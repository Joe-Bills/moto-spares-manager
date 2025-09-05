from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    buying_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    stock_qty = models.PositiveIntegerField()
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    
    # New fields for bulk/unit handling
    units_per_box = models.PositiveIntegerField(default=1, help_text="Number of units in one box/case")
    is_bulk_product = models.BooleanField(default=False, help_text="Product is sold in boxes/cases")
    
    def __str__(self):
        return self.name
    
    @property
    def is_out_of_stock(self):
        """Check if product is out of stock"""
        return self.stock_qty <= 0
    
    @property
    def stock_status(self):
        """Get stock status for alerts"""
        if self.stock_qty <= 0:
            return 'out_of_stock'
        elif self.stock_qty <= 2:
            return 'critical'
        elif self.stock_qty <= 5:
            return 'low'
        elif self.stock_qty <= 10:
            return 'medium'
        else:
            return 'normal'
    
    @property
    def unit_buying_price(self):
        """Calculate unit buying price for bulk products"""
        if self.units_per_box > 1:
            return self.buying_price / self.units_per_box
        return self.buying_price
    
    @property
    def unit_selling_price(self):
        """Calculate unit selling price for bulk products"""
        if self.units_per_box > 1:
            return self.selling_price / self.units_per_box
        return self.selling_price
    
    @property
    def total_boxes(self):
        """Calculate total number of boxes available"""
        if self.units_per_box > 1:
            return self.stock_qty // self.units_per_box
        return self.stock_qty
    
    @property
    def remaining_units(self):
        """Calculate remaining individual units (not in complete boxes)"""
        if self.units_per_box > 1:
            return self.stock_qty % self.units_per_box
        return 0
    
    def can_sell_quantity(self, quantity):
        """Check if the specified quantity can be sold"""
        return self.stock_qty >= quantity
    
    def deduct_stock(self, quantity):
        """Deduct stock quantity and validate"""
        if not self.can_sell_quantity(quantity):
            raise ValidationError(f"Insufficient stock. Available: {self.stock_qty}, Requested: {quantity}")
        
        self.stock_qty -= quantity
        self.save()
        return self.stock_qty
    
    def add_stock(self, quantity):
        """Add stock quantity"""
        self.stock_qty += quantity
        self.save()
        return self.stock_qty
    
    def get_display_info(self):
        """Get formatted display information for the product"""
        if self.is_bulk_product and self.units_per_box > 1:
            return {
                'name': f"{self.name} ({self.units_per_box} units/box)",
                'box_price': self.selling_price,
                'unit_price': self.unit_selling_price,
                'total_boxes': self.total_boxes,
                'remaining_units': self.remaining_units,
                'total_units': self.stock_qty
            }
        else:
            return {
                'name': self.name,
                'unit_price': self.selling_price,
                'total_units': self.stock_qty
            }

class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    payment_type = models.CharField(max_length=50, choices=[('cash', 'Cash'), ('mobile', 'Mobile Money'), ('bank', 'Bank')])
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Sale #{self.id} - {self.product} x {self.quantity} on {self.date.strftime('%Y-%m-%d')}"
    
    def save(self, *args, **kwargs):
        # If this is a new sale, deduct stock
        if not self.pk and self.product:
            self.product.deduct_stock(self.quantity)
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # If deleting a sale, add back the stock
        if self.product:
            self.product.add_stock(self.quantity)
        super().delete(*args, **kwargs)

class Expense(models.Model):
    date = models.DateField()
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    def __str__(self):
        return f"{self.description} - {self.amount}"

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model = models.CharField(max_length=50)
    object_id = models.CharField(max_length=50, blank=True, null=True)
    details = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.timestamp} {self.user} {self.action} {self.model} {self.object_id}"

class BusinessSettings(models.Model):
    """Store business settings like name, currency, etc."""
    business_name = models.CharField(max_length=200, default='Moto Spares')
    currency = models.CharField(max_length=10, default='TZS')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Business Settings"
        verbose_name_plural = "Business Settings"
    
    def __str__(self):
        return f"Business Settings - {self.business_name}"
    
    @classmethod
    def get_settings(cls):
        """Get or create the single settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings
