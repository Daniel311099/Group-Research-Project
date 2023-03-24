from rest_framework import serializers
from .models import Product, Brand, ProductVariant, ProductStorage, Discount


class BrandSerializer(serializers.ModelSerializer):
    image = serializers.StringRelatedField()
    class Meta:
        model = Brand
        fields = ['id', 'name', 'url', 'image']

class ProductDataField(serializers.RelatedField):
    def to_representation(self, value):
        return {
            'product_id': value.id,
            'name': value.name,
            'category': value.category.name,
            'brand': value.brand.name,
            'description': value.description,
            'specifications': value.specifications
            
        }

class ProductVariantDataField(serializers.RelatedField):
    def to_representation(self, value):
        return {
            'id': value.id,
            'product': value.colour,
        }

class ProductStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStorage
        fields = ['id', 'storage', 'price']

class ProductVariantSerializer(serializers.ModelSerializer):
    product = ProductDataField(read_only=True)
    product_variant_storages = ProductStorageSerializer(many=True)
    product_variant_images = serializers.StringRelatedField(many=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'colour', 'product_variant_storages', 'product_variant_images', 'product']

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    brand = serializers.StringRelatedField()
    product_variants = ProductVariantSerializer(many=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'brand', 'description', 'specifications', 'product_variants']

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = '__all__'