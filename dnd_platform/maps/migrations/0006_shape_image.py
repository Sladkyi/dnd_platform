# Generated by Django 5.1.5 on 2025-01-20 17:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0005_alter_map_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='shape',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='shapes/'),
        ),
    ]
