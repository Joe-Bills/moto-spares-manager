from django.contrib import admin
from import_export.admin import ImportExportModelAdmin
from .models import Category, Product, Sale, Expense, AuditLog

class ProductAdmin(ImportExportModelAdmin):
    list_display = ('name', 'buying_price', 'selling_price', 'stock_qty')

admin.site.register(Category)
admin.site.register(Product, ProductAdmin)
admin.site.register(Sale)
admin.site.register(Expense)
admin.site.register(AuditLog)
