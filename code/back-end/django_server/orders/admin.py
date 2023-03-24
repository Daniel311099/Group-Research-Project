from django.contrib import admin

from .models import Basket, BasketProduct, BasketDiscount, Order, OrderProduct, Delivery

admin.site.register(Basket)
admin.site.register(BasketProduct)
admin.site.register(BasketDiscount)
admin.site.register(Order)
admin.site.register(OrderProduct)
admin.site.register(Delivery)
