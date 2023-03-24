from urllib import response
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.db.models import Q

from rest_framework.views import APIView

from .models import Category, Product, Brand, Image, ProductStorage, ProductVariant, Discount
from.serializer import ProductSerializer, BrandSerializer, ProductVariantSerializer, ProductStorageSerializer, DiscountSerializer

class BrandView(APIView):
    def get(self, request, *args, **kwargs):
        brands_obj = Brand.objects.all()
        
        brands_json = BrandSerializer(brands_obj, many=True).data

        return JsonResponse(brands_json, safe=False)

class ProductView(APIView):
    def get(self, request, *args, **kwargs):
        product_id = kwargs['id']
        product_obj = Product.objects.get(id=product_id)
        product_json = ProductSerializer(product_obj).data
        variants = []
        for variant in product_json['product_variants']:
            variant['images'] = variant['product_variant_images']
            del variant['product_variant_images']
            variant['storages'] = variant['product_variant_storages']
            del variant['product_variant_storages']
            variants.append(variant)
        product_json['variants'] = variants
        print(variants)
        del product_json['product_variants']
        product_json['variants'] = list(filter(
            lambda variant: len(variant['storages'])>0,
            product_json['variants']
        ))
        return JsonResponse(product_json)

class ProductListView(APIView):
    def get(self, request, *args, **kwargs):
        search_field = kwargs['search']
        print(search_field)
        in_category = Product.objects.filter(
            Q(category__name__icontains=search_field) |
            Q(name__icontains=search_field) |
            Q(brand__name__icontains=search_field)
        )
        products_json = ProductSerializer(in_category, many=True).data
        to_del = []
        for i, (product_obj, product_json) in enumerate(zip(in_category, products_json)):
            default_variant = filter(
                lambda variant: len(variant.product_variant_storages.all())>0, 
                product_obj.product_variants.all()
            )
            if not default_variant: 
                to_del.append(i)
                continue
            try:
                image = default_variant.product_variant_images.first()
                product_json['image'] = str(image)
            except AttributeError:
                product_json['image'] = ""
        print(products_json)
        for i in to_del:
            products_json.pop(i)
        return JsonResponse(products_json, safe=False)

class BasketItemsView(APIView):
    def post(self, request, *args, **kwargs):
        products = request.data
        response = []
        for product_v in products:
            try:
                product_obj = ProductStorage.objects.get(id=product_v['id'])

                print(product_obj)
            except ProductStorage.DoesNotExist:
                continue
            product_json = ProductStorageSerializer(product_obj).data
            product = ProductVariantSerializer(product_obj.product_variant).data
            product['price'] = product_obj.price
            product_json['product'] = product
            product_json['quantity'] = product_v['quantity']

            product_json = {
                'id': product_obj.id,
                'image': str(product_obj.product_variant.product_variant_images.first()),
                'quantity': product_v['quantity'],
                'price': product_obj.price,
                'product': {
                    'id': product_obj.product_variant.product.id,
                    'name': str(product_obj),
                    'brand': product_obj.product_variant.product.brand.name,

                }
            }
            response.append(product_json)
        print(response)
        return JsonResponse(response, safe=False)

class PopularProductsView(APIView):
    def get(self, request, *args, **kwargs):
        brands = Brand.objects.all()
        popular = map(lambda brand: brand.brand_products.first(), brands)
        popular_json = [
            {
                'product_id': product.id,
                'name': product.name,
                'image': str(product.product_variants.first().product_variant_images.first())
            }
        for product in popular if product]
        print(popular_json)
        return JsonResponse(popular_json, safe=False)

class DiscountView(APIView):
    def get(self, request, *args, **kwargs):
        discounts = Discount.objects.all()
        discount_json = DiscountSerializer(discounts, many=True).data

        return JsonResponse(discount_json, safe=False)