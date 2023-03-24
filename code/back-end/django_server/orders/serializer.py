from rest_framework import serializers
from .models import BasketProduct, Address, Order, OrderProduct

class ProductDataField(serializers.RelatedField):
    def to_representation(self, value):
        return {
            'product_id': value.id,
            # 'name': value.name,
            # 'price': value.price,
            # 'category': value.category.name
        }

class BasketProductSerializer(serializers.ModelSerializer):
    # category = serializers.StringRelatedField()
    # product_variant = ProductDataField(read_only=True)
    # image = serializers.ImageField()

    class Meta:
        model = BasketProduct
        fields = ['id', 'product_storage', 'quantity']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class AddressDataField(serializers.RelatedField):
    def to_representation(self, value):
        return {
            'house_number': value.house_number,
            'first_line': value.first_line,
            'second_line': value.second_line,
            'post_code': value.post_code
        }

class OrderProductDataField(serializers.RelatedField):
    def to_representation(self, value):
        return {
            'product_id': value.id,
            'name': str(value),
            'price': value.price,
            'category': value.product_variant.product.category.name,
            'brand': value.product_variant.product.brand.name,
            'image': str(value.product_variant.product_variant_images.first())
        }

class OrderProductSerializer(serializers.ModelSerializer):
    product = OrderProductDataField(read_only=True)
    class Meta:
        model = OrderProduct
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    order_products = OrderProductSerializer(many=True)
    address = AddressDataField(read_only=True)
    card = serializers.StringRelatedField()
    discount = serializers.StringRelatedField()
    # est = serializers.Field(source='est')
    class Meta:
        model = Order
        fields = '__all__'
        extra_fields = ['est', 'order_products']
    
    def get_field_names(self, declared_fields, info):
        expanded_fields = super(OrderSerializer, self).get_field_names(declared_fields, info)

        if getattr(self.Meta, 'extra_fields', None):
            return expanded_fields + self.Meta.extra_fields
        else:
            return expanded_fields