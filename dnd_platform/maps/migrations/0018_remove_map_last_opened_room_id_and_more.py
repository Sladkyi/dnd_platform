# Generated by Django 5.1.5 on 2025-04-27 11:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0017_map_last_opened_room_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='map',
            name='last_opened_room_id',
        ),
        migrations.AddField(
            model_name='map',
            name='full_card_map_image',
            field=models.ImageField(blank=True, null=True, upload_to='maps/'),
        ),
    ]
