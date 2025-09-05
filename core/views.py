from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Category, Product, Sale, Expense, AuditLog
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer, ExpenseSerializer, AuditLogSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from django.http import HttpResponse, JsonResponse
try:
    from reportlab.pdfgen import canvas
    from openpyxl import Workbook
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
import io
from django.core.exceptions import ValidationError

# Create your views here.

class IsAdminOrReadCreateOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS or request.method == 'POST':
            return request.user and request.user.is_authenticated
        return request.user and (request.user.is_superuser or request.user.groups.filter(name='Admin').exists())

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

def log_action(user, action, model, object_id, details=''):
    AuditLog.objects.create(user=user, action=action, model=model, object_id=str(object_id), details=details)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadCreateOnly]
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        obj = serializer.save()
        log_action(self.request.user, 'create', 'Product', obj.id, f'Created product {obj.name}')
    def perform_update(self, serializer):
        # Handle image removal
        if self.request.data.get('remove_image') == 'true':
            instance = serializer.instance
            if instance.image:
                # Delete the image file
                instance.image.delete(save=False)
                # Clear the image field
                instance.image = None
        obj = serializer.save()
        log_action(self.request.user, 'update', 'Product', obj.id, f'Updated product {obj.name}')
    def perform_destroy(self, instance):
        log_action(self.request.user, 'delete', 'Product', instance.id, f'Deleted product {instance.name}')
        instance.delete()

    @action(detail=True, methods=['post'], url_path='restock')
    def restock(self, request, pk=None):
        product = self.get_object()
        qty = int(request.data.get('quantity', 10))  # Default restock amount is 10
        product.add_stock(qty)
        log_action(request.user, 'update', 'Product', product.id, f'Restocked {qty} units')
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAdminOrReadCreateOnly]
    
    def perform_create(self, serializer):
        # Validate stock before creating sale
        product = serializer.validated_data.get('product')
        quantity = serializer.validated_data.get('quantity')
        
        if product and not product.can_sell_quantity(quantity):
            raise ValidationError(f"Insufficient stock for {product.name}. Available: {product.stock_qty}, Requested: {quantity}")
        
        obj = serializer.save(user=self.request.user)
        log_action(self.request.user, 'create', 'Sale', obj.id, f'Created sale #{obj.id} for {product.name} x {quantity}')
    
    def perform_update(self, serializer):
        obj = serializer.save()
        log_action(self.request.user, 'update', 'Sale', obj.id, f'Updated sale #{obj.id}')
    
    def perform_destroy(self, instance):
        log_action(self.request.user, 'delete', 'Sale', instance.id, f'Deleted sale #{instance.id}')
        instance.delete()

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAdminOrReadCreateOnly]
    def perform_create(self, serializer):
        obj = serializer.save()
        log_action(self.request.user, 'create', 'Expense', obj.id, f'Created expense {obj.description}')
    def perform_update(self, serializer):
        obj = serializer.save()
        log_action(self.request.user, 'update', 'Expense', obj.id, f'Updated expense {obj.description}')
    def perform_destroy(self, instance):
        log_action(self.request.user, 'delete', 'Expense', instance.id, f'Deleted expense {instance.description}')
        instance.delete()

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AuditLogSerializer

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'groups': [g.name for g in user.groups.all()],
            'is_superuser': user.is_superuser,
        })

class LowStockProductsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Get products with different stock alert levels
        out_of_stock = Product.objects.filter(stock_qty=0)
        critical_stock = Product.objects.filter(stock_qty__lte=2, stock_qty__gt=0)
        low_stock = Product.objects.filter(stock_qty__lte=5, stock_qty__gt=2)
        medium_stock = Product.objects.filter(stock_qty__lte=10, stock_qty__gt=5)
        
        data = {
            'out_of_stock': ProductSerializer(out_of_stock, many=True).data,
            'critical': ProductSerializer(critical_stock, many=True).data,
            'low': ProductSerializer(low_stock, many=True).data,
            'medium': ProductSerializer(medium_stock, many=True).data,
            'total_alerts': out_of_stock.count() + critical_stock.count() + low_stock.count() + medium_stock.count()
        }
        return Response(data)

class StockValidationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        """Validate if a sale can be made with given product and quantity"""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 0)
        
        try:
            product = Product.objects.get(id=product_id)
            can_sell = product.can_sell_quantity(quantity)
            
            return Response({
                'can_sell': can_sell,
                'available_stock': product.stock_qty,
                'requested_quantity': quantity,
                'product_name': product.name,
                'message': 'Stock available' if can_sell else f'Insufficient stock. Available: {product.stock_qty}'
            })
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def sales_report_pdf(request):
    if not REPORTLAB_AVAILABLE:
        return HttpResponse("PDF generation not available. Please install reportlab.", status=503)
    
    try:
        from .models import Sale
        from datetime import datetime
        
        # Create PDF buffer
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=(612, 792))  # Standard letter size
        
        # Set PDF metadata
        p.setTitle("Sales Report")
        p.setAuthor("Moto Spares Manager")
        p.setSubject("Sales Report")
        p.setCreator("Moto Spares Manager")
        
        # Set up the PDF with better spacing - moved down from top
        p.setFont("Helvetica-Bold", 18)
        p.drawString(50, 750, "SALES REPORT")
        
        p.setFont("Helvetica", 10)
        p.drawString(50, 730, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Get sales data with date filtering
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        
        # Add date range if specified
        if from_date or to_date:
            date_range = f"Date Range: {from_date or 'Start'} to {to_date or 'End'}"
            p.drawString(50, 710, date_range)
        
        sales_query = Sale.objects.all()
        if from_date:
            sales_query = sales_query.filter(date__gte=from_date)
        if to_date:
            sales_query = sales_query.filter(date__lte=to_date)
        
        sales = sales_query.order_by('-date')[:100]  # Limit to 100 records
        
        if not sales:
            p.drawString(50, 690, "No sales data available")
        else:
            # Table header with better spacing
            p.setFont("Helvetica-Bold", 11)
            p.drawString(50, 690, "Date")
            p.drawString(120, 690, "Product")
            p.drawString(320, 690, "Qty")
            p.drawString(380, 690, "Price")
            p.drawString(480, 690, "Total")
            
            # Draw header line
            p.line(50, 685, 550, 685)
            
            # Data rows with better formatting
            p.setFont("Helvetica", 10)
            y = 670
            total_revenue = 0
            row_count = 0
            
            for sale in sales:
                if y < 80:  # Start new page if running out of space
                    p.showPage()
                    p.setFont("Helvetica-Bold", 12)
                    p.drawString(50, 750, "Sales Report (Continued)")
                    p.setFont("Helvetica", 10)
                    y = 730
                
                # Get product name
                product_name = sale.product.name if sale.product else f"Product {sale.product_id}"
                
                # Calculate total with error handling
                try:
                    sale_total = float(sale.price) * sale.quantity - float(sale.discount or 0)
                    total_revenue += sale_total
                except (ValueError, TypeError):
                    sale_total = 0
                
                # Draw row with better spacing
                p.drawString(50, y, sale.date.strftime('%Y-%m-%d'))
                # Handle long product names better - allow more space
                display_name = product_name[:35] + "..." if len(product_name) > 35 else product_name
                p.drawString(120, y, display_name)
                p.drawString(320, y, str(sale.quantity))
                p.drawString(380, y, f"TZS {sale.price}")
                p.drawString(480, y, f"TZS {sale_total:.2f}")
                
                # Draw subtle line between rows
                p.setStrokeColorRGB(0.9, 0.9, 0.9)
                p.line(50, y - 2, 550, y - 2)
                p.setStrokeColorRGB(0, 0, 0)  # Reset to black
                
                y -= 18  # Slightly closer spacing
                row_count += 1
            
            # Summary section with better positioning
            # Draw summary box
            p.setFillColorRGB(0.95, 0.95, 0.95)
            p.rect(50, y - 80, 500, 60, fill=1)
            p.setFillColorRGB(0, 0, 0)  # Reset to black
            
            p.setFont("Helvetica-Bold", 12)
            p.drawString(60, y - 30, "SUMMARY")
            p.setFont("Helvetica", 10)
            p.drawString(60, y - 50, f"Total Revenue: TZS {total_revenue:,.2f}")
            p.drawString(60, y - 70, f"Total Sales: {len(sales)}")
            
            # Add footer
            p.setFont("Helvetica", 8)
            p.drawString(50, 30, "Generated by Moto Spares Manager")
            p.drawString(50, 20, f"Page 1 of 1")
        
        # Finalize PDF
        p.showPage()
        p.save()
        
        # Get PDF content
        buffer.seek(0)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        # Create response with proper headers
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="sales_report.pdf"'
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        # Write PDF content to response
        response.write(pdf_content)
        return response
        
    except Exception as e:
        print(f"PDF generation error: {e}")
        import traceback
        traceback.print_exc()
        return HttpResponse(f"PDF generation failed: {str(e)}", status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def sales_report_excel(request):
    if not REPORTLAB_AVAILABLE:
        return HttpResponse("Excel generation not available. Please install openpyxl.", status=503)
    
    try:
        from .models import Sale
        from datetime import datetime
        
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="sales_report.xlsx"'
        
        wb = Workbook()
        ws = wb.active
        ws.title = "Sales Report"
        
        # Add header
        ws.append(["Sales Report"])
        ws.append([f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"])
        ws.append([])  # Empty row
        
        # Get date range from query params
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        
        # Filter sales by date range if provided
        sales_query = Sale.objects.all()
        if from_date:
            sales_query = sales_query.filter(date__gte=from_date)
        if to_date:
            sales_query = sales_query.filter(date__lte=to_date)
        
        sales = sales_query.order_by('-date')[:100]  # Limit to 100 records
        
        # Add column headers
        headers = ["ID", "Date", "Product", "Quantity", "Price", "Discount", "Total", "Payment Type"]
        ws.append(headers)
        
        # Add data
        total_revenue = 0
        for sale in sales:
            product_name = sale.product.name if sale.product else f"Product {sale.product_id}"
            try:
                sale_total = float(sale.price) * sale.quantity - float(sale.discount or 0)
                total_revenue += sale_total
            except (ValueError, TypeError):
                sale_total = 0
            
            ws.append([
                sale.id,
                sale.date.strftime('%Y-%m-%d'),
                product_name,
                sale.quantity,
                float(sale.price),
                float(sale.discount),
                sale_total,
                sale.payment_type
            ])
        
        # Add summary
        ws.append([])  # Empty row
        ws.append(["Summary"])
        ws.append(["Total Revenue", total_revenue])
        ws.append(["Total Sales", len(sales)])
        
        wb.save(response)
        return response
        
    except Exception as e:
        print(f"Excel generation error: {e}")
        return HttpResponse(f"Excel generation failed: {str(e)}", status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def reports_data(request):
    """Get comprehensive data for reports and charts"""
    try:
        from .models import Sale, Product, Expense
        from datetime import datetime, timedelta
        
        # Get date range from query params
        from_date = request.GET.get('from')
        to_date = request.GET.get('to')
        
        # Filter sales by date range if provided
        sales_query = Sale.objects.all()
        if from_date:
            sales_query = sales_query.filter(date__gte=from_date)
        if to_date:
            sales_query = sales_query.filter(date__lte=to_date)
        
        sales = sales_query.order_by('-date')
        
        # Monthly revenue data
        monthly_revenue = {}
        for sale in sales:
            month = sale.date.strftime('%Y-%m')
            total = float(sale.price) * sale.quantity - float(sale.discount)
            monthly_revenue[month] = monthly_revenue.get(month, 0) + total
        
        # Top products by quantity sold
        product_sales = {}
        for sale in sales:
            product_name = sale.product.name if sale.product else f"Product {sale.product_id}"
            product_sales[product_name] = product_sales.get(product_name, 0) + sale.quantity
        
        # Payment method distribution
        payment_methods = {}
        for sale in sales:
            payment_methods[sale.payment_type] = payment_methods.get(sale.payment_type, 0) + 1
        
        # Stock analysis with proper bulk product handling
        products = Product.objects.all()
        total_stock_value = 0
        total_stock_cost = 0
        
        for product in products:
            if product.is_bulk_product and product.units_per_box > 1:
                # For bulk products: use unit buying price × stock quantity
                unit_buying_price = float(product.buying_price) / product.units_per_box
                total_stock_cost += product.stock_qty * unit_buying_price
                total_stock_value += product.stock_qty * unit_buying_price  # Using cost for stock value
            else:
                # For regular products: use buying price × stock quantity
                total_stock_cost += product.stock_qty * float(product.buying_price)
                total_stock_value += product.stock_qty * float(product.buying_price)
        
        stock_analysis = {
            'total_products': products.count(),
            'out_of_stock': products.filter(stock_qty=0).count(),
            'low_stock': products.filter(stock_qty__lte=5, stock_qty__gt=0).count(),
            'total_stock_value': total_stock_value,
            'total_stock_quantity': sum(p.stock_qty for p in products)
        }
        
        # Profit analysis with proper cost calculation and expenses
        total_revenue = sum(float(sale.price) * sale.quantity - float(sale.discount) for sale in sales)
        
        # Calculate total cost of goods sold (COGS)
        total_cost = 0
        for sale in sales:
            if sale.product:
                if sale.product.is_bulk_product and sale.product.units_per_box > 1:
                    # For bulk products: use unit buying price × quantity sold
                    unit_buying_price = float(sale.product.buying_price) / sale.product.units_per_box
                    total_cost += sale.quantity * unit_buying_price
                else:
                    # For regular products: use buying price × quantity sold
                    total_cost += sale.quantity * float(sale.product.buying_price)
        
        # Add expenses to the cost
        expenses = Expense.objects.all()
        if from_date:
            expenses = expenses.filter(date__gte=from_date)
        if to_date:
            expenses = expenses.filter(date__lte=to_date)
        
        total_expenses = sum(float(expense.amount) for expense in expenses)
        total_cost += total_expenses
        
        total_profit = total_revenue - total_cost
        
        return Response({
            'monthly_revenue': monthly_revenue,
            'top_products': dict(sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:10]),
            'payment_methods': payment_methods,
            'stock_analysis': stock_analysis,
            'profit_analysis': {
                'total_revenue': total_revenue,
                'total_cost': total_cost,
                'total_expenses': total_expenses,
                'total_profit': total_profit,
                'profit_margin': (total_profit / total_revenue * 100) if total_revenue > 0 else 0
            },
            'summary': {
                'total_sales': sales.count(),
                'total_revenue': total_revenue,
                'average_sale': total_revenue / sales.count() if sales.count() > 0 else 0
            }
        })
        
    except Exception as e:
        print(f"Reports data error: {e}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint with debugging info"""
    from django.conf import settings
    return JsonResponse({
        'status': 'ok', 
        'message': 'Django app is running',
        'debug': settings.DEBUG,
        'allowed_hosts': settings.ALLOWED_HOSTS,
        'settings_module': settings.SETTINGS_MODULE
    })
