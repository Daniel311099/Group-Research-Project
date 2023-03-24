from django.db import models
from annoying.fields import AutoOneToOneField

from itertools import combinations
from functools import reduce
from collections import Counter
import datetime as dt

from products.models import Product, Discount, DiscountProduct, ProductVariant, ProductStorage
from users.models import User

class Basket(models.Model):
    user = AutoOneToOneField(User, primary_key=True, on_delete=models.CASCADE, related_name="user_basket")
    total = models.FloatField(default=0, blank=True)

    def clear(self):
        self.total = 0
        self.basket_products.all().delete()
        self.save()
    
    def __str__(self) -> str:
        return f"{self.user.email}'s basket"

    def pre_total(self):
        products = self.basket_products.all()
        total = reduce(lambda a, b: a + (b.product_storage.price*b.quantity) , products, 0)
        return total

    def calc_total(self): # allows total savings to be retrieved without updating it
        try:
            savings = self.basket_discount.savings
        except AttributeError:
            savings = 0
        pre_total = self.pre_total()
        return pre_total - savings

class BasketDiscount(models.Model):
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name="discount_baskets", null=True)
    basket = AutoOneToOneField(Basket, primary_key=True, on_delete=models.CASCADE, related_name="basket_discount")
    savings = models.FloatField(default=0, null=True)

    discount_funcs = { # p is staandard price and d is the discount
        "% off": lambda p, d: p * d/100,
        "£ off": lambda p, d: d,
    }

    def clear(self):
        self.discount = None
        self.savings = 0
        super().save()

    def save(self, *args, **kwargs):
        if self.discount:
            discount = Discount.objects.filter(id=self.discount.id)
            if len(discount) == 0: return "doesn't exist"
            discount = discount.first()
            func = self.discount_funcs[discount.discount_type]
            pre_total = self.basket.pre_total()
            self.savings = func(pre_total, self.discount.amount)
        super().save(*args, **kwargs)
        print(self.savings)
        self.basket.total = self.basket.calc_total()
        self.basket.save()

class BasketProduct(models.Model):
    basket = models.ForeignKey(Basket, on_delete=models.CASCADE, related_name="basket_products", null=True)
    product_storage = models.ForeignKey(ProductStorage, on_delete=models.CASCADE, related_name="product_variant_baskets", null=True)
    quantity = models.PositiveIntegerField(default=1) # add limit and send to front end, limit is fixed or all remaining stock
    
    def save(self, *args, **kwargs):
        product = self.basket.basket_products.filter(product_storage=self.product_storage)
        print(product)
        super().save(*args, **kwargs)
        self.basket.total = self.basket.pre_total()
        self.basket.save()

class Address(models.Model):
    house_number = models.IntegerField(null=True)
    first_line = models.CharField(max_length=100)
    second_line = models.CharField(null=True, max_length=100)
    post_code = models.CharField(max_length=20)


    def __str__(self) -> str:
        return f'{self.house_number}, {self.first_line}, {self.post_code}'

class Card(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_cards", null=True)
    card_number = models.CharField(max_length=16)
    expiry_date = models.DateField()
    security_code = models.CharField(max_length=3)

    def __str__(self) -> str:
        return '*'*12 + self.card_number[-5:-1]

class Delivery(models.Model):
    delivery_type = models.CharField(max_length=100)
    price = models.FloatField(default=0)
    estimate = models.IntegerField(default=7)

    def __str__(self) -> str:
        return self.delivery_type

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_orders", null=True)
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name="address_orders", null=True)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="card_orders", null=True)
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name="discount_orders", null=True)
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name="delivery_orders", null=True)
    datetime = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    contact_number = models.CharField(max_length=20, null=True)
    order_status = models.CharField(max_length=30, null=True, default='order pending')
    delivery_date = models.DateField(auto_now=False, null=True)
    order_total = models.FloatField(default=0)
    savings = models.FloatField(default=0)
    SCALAR = 7437363

    @property
    def est(self):
        est = self.datetime + dt.timedelta(days=7)
        return est.strftime("%d/%m/%Y")
    
    def __str__(self) -> str:
        return f'{self.user.email}-{self.id}'

class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_products", null=True)
    product = models.ForeignKey(ProductStorage, on_delete=models.CASCADE, related_name="product_orders", null=True)
    quantity = models.PositiveIntegerField(null=False) # add limit and send to front end, limit is fixed or all remaining stock

def test():
    product = Product.objects.all().first()
    basket = Basket.objects.all().first()
    basket.basket_products.create(product=product, quantity=5, )