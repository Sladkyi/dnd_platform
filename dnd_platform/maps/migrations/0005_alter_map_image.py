# Generated by Django 5.1.5 on 2025-01-20 12:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0004_remove_map_shapes_shape'),
    ]

    operations = [
        migrations.AlterField(
            model_name='map',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='maps/'),
        ),
    ]
