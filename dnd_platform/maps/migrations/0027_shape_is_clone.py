# Generated by Django 5.1.5 on 2025-05-31 14:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0026_alter_playerinsession_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='shape',
            name='is_clone',
            field=models.BooleanField(default=False),
        ),
    ]
