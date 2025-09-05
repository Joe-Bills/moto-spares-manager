from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0002_auditlog'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='price',
        ),
        migrations.RemoveField(
            model_name='product',
            name='category',
        ),
        migrations.AddField(
            model_name='product',
            name='buying_price',
            field=models.DecimalField(max_digits=12, decimal_places=2, default=0),
        ),
        migrations.AddField(
            model_name='product',
            name='selling_price',
            field=models.DecimalField(max_digits=12, decimal_places=2, default=0),
        ),
    ] 