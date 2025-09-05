from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, SaleViewSet, ExpenseViewSet, UserInfoView, LowStockProductsView, StockValidationView, sales_report_pdf, sales_report_excel, reports_data, AuditLogViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user-info/', UserInfoView.as_view(), name='user_info'),
    path('low-stock/', LowStockProductsView.as_view(), name='low_stock_products'),
    path('stock-validation/', StockValidationView.as_view(), name='stock_validation'),
    path('reports/sales/pdf/', sales_report_pdf, name='sales_report_pdf'),
    path('reports/sales/excel/', sales_report_excel, name='sales_report_excel'),
    path('reports/data/', reports_data, name='reports_data'),
    path('auth/', include('djoser.urls')),  # registration, password reset, etc.
    path('auth/', include('djoser.urls.jwt')),  # JWT endpoints for djoser
] 