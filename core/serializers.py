from rest_framework import serializers
from .models import Category, Product, Sale, Expense, AuditLog
from django.conf import settings

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    is_out_of_stock = serializers.ReadOnlyField()
    stock_status = serializers.ReadOnlyField()
    unit_buying_price = serializers.ReadOnlyField()
    unit_selling_price = serializers.ReadOnlyField()
    total_boxes = serializers.ReadOnlyField()
    remaining_units = serializers.ReadOnlyField()
    display_info = serializers.ReadOnlyField()
    is_bulk_product = serializers.BooleanField(default=False)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add full URL for image if it exists
        if instance.image:
            data['image'] = self.context['request'].build_absolute_uri(instance.image.url)
        return data
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'buying_price', 'selling_price', 'stock_qty', 'image', 
            'is_out_of_stock', 'stock_status', 'units_per_box', 'is_bulk_product',
            'unit_buying_price', 'unit_selling_price', 'total_boxes', 'remaining_units',
            'display_info'
        ]

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__' 