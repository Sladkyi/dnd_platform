# Generated by Django 5.1.5 on 2025-04-27 12:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0018_remove_map_last_opened_room_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='map',
            name='full_card_map_image',
        ),
        migrations.AddField(
            model_name='map',
            name='last_opened_room_id',
            field=models.PositiveIntegerField(blank=True, null=True, verbose_name='ID последней открытой комнаты'),
        ),
    ]
