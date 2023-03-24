from django.contrib import admin

from .models import Product, Brand, Category, Image, Discount, DiscountProduct, ProductVariant, ProductStorage

admin.site.register(Product)
admin.site.register(Brand)
admin.site.register(Category)
admin.site.register(Image)
admin.site.register(ProductStorage)
admin.site.register(Discount)
admin.site.register(DiscountProduct)
admin.site.register(ProductVariant)