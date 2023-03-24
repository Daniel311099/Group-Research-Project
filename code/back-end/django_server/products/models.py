from django.db import models
import pathlib

from itertools import combinations

class Category(models.Model):
    name = models.CharField(max_length=100, null=False, unique=True)
    def __str__(self) -> str:
        return self.name

def _brand_image_upload_path(instance, filename):
    """Provides a clean upload path for user avatar images
    """
    file_extension = pathlib.Path(filename).suffix
    return f'images/brands/{instance.name}{file_extension}'

class Brand(models.Model):
    name = models.CharField(max_length=100, null=False, unique=True)
    url = models.CharField(max_length=100, null=True)
    image = models.ImageField(null=True, blank=True, upload_to=_brand_image_upload_path)

    def __str__(self) -> str:
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="category_products", null=True)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name="brand_products", null=True)
    name = models.CharField(max_length=100, null=False)
    description = models.CharField(max_length=500)
    specifications = models.CharField(max_length=2000, default='', blank=True)

    def __str__(self) -> str:
        return self.name

class ProductVariant(models.Model):

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_variants", null=True)
    colour = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f'{self.product.name}-{self.colour}'

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['product', 'colour'], name="unique_variant")
        ]

class ProductStorage(models.Model):
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name="product_variant_storages", null=True)
    storage = models.IntegerField()
    price = models.FloatField()
    stock_count = models.IntegerField(default=100, blank=True)
    order_limit = models.IntegerField(default=10, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['product_variant', 'storage'], name="unique_storages")
        ]

    def __str__(self) -> str:
        return f'{self.product_variant}-{self.storage}GB'
class Discount(models.Model):
    class DiscountType(models.TextChoices):
        percent = '% off'
        fixed = '£ off'
        b1g1f = 'buy 1 get 1 free'

    name = models.CharField(max_length= 100, null=False)
    discount_type = models.CharField(max_length=100, choices=DiscountType.choices, null=False)
    description = models.CharField(max_length=100, null=True)
    amount = models.FloatField(null=True)
    discount_code = models.CharField(max_length=100, unique=True, null=True)

    def __str__(self) -> str:
        return self.name

    def gen_code(self):
        pass

class DiscountProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_discounts", null=True, unique=True)
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name="discount_products", null=True)
    active = models.BooleanField(default=False)

def _product_image_upload_path(instance, filename):
    """Provides a clean upload path for user avatar images
    """
    file_extension = pathlib.Path(filename).suffix
    return f'images/products/{str(instance.product_variant)}{file_extension}'

class Image(models.Model):
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name="product_variant_images", null=True)
    
    image = models.ImageField(null=True, blank=True, upload_to=_product_image_upload_path) 
    label = models.CharField(null=True, max_length=100)
    
    def __str__(self) -> str:
        return str(self.image)
    
def sale_test():
    sale = Discount(sale_type="£ off", discount=10)
    products = Product.objects.all()

