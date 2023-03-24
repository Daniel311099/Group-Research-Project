# Generated by Django 4.0.4 on 2022-05-19 11:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0033_rename_productstorages_productstorage_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='price',
        ),
        migrations.AddField(
            model_name='productstorage',
            name='price',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]
