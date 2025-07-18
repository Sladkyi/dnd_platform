# Generated by Django 5.1.5 on 2025-07-07 20:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0010_item_default_find_diff_iteminstance_find_diff_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='mappoint',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='poi_images/', verbose_name='Картинка точки'),
        ),
        migrations.CreateModel(
            name='MapPointImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='poi_images/', verbose_name='Картинка слайд-шоу')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Порядок показа')),
                ('point', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='maps.mappoint', verbose_name='Точка интереса')),
            ],
        ),
    ]
