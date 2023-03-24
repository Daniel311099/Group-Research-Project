from email import message
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Case, When, F
from markupsafe import re

from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed

import jwt
import datetime
import calendar

from .models import Basket, BasketProduct, Address, Card, Order, Delivery
from .serializer import BasketProductSerializer, AddressSerializer, OrderSerializer

from products.serializer import ProductSerializer
from products.models import Product, ProductVariant, Discount, ProductStorage
from users.models import User


class BasketView(APIView):
    def get(self, request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed("Unauthenticated!")
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")

        user = User.objects.filter(id=payload['id']).first()
        basket = user.user_basket
        # basket = Basket.objects.all()[1]
        basket_products = basket.basket_products.all()
        print(basket_products)
        basket_products_json = BasketProductSerializer(basket_products, many=True).data
        try:
            savings = basket.basket_discount.savings
        except AttributeError:
            savings = None
        
        for basket_product in basket_products_json:
            basket_product['id'] = basket_product['product_storage']
            del basket_product['product_storage']

        del_type = request.GET.get('delivery_type')
        est_delivery = self.delivery_type[del_type]['est']
        basket_json = {
            'products': basket_products_json,
            'savings': savings,
            'est_delivery': est_delivery
            # 'pre_total': basket.pre_total()
        }
        # make seperate call for photos

        return JsonResponse(basket_json, safe=False)
    
    delivery_type = {
        'free': {'price': 0, 'est': (datetime.date.today()+datetime.timedelta(days=7)).strftime("%d/%m/%Y")},
        'express': {'price': 5, 'est': (datetime.date.today()+datetime.timedelta(days=3)).strftime("%d/%m/%Y")}
    }

    def post(self, request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed("Unauthenticated!")
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")

        user = User.objects.filter(id=payload['id']).first()
        basket = user.user_basket

        # basket = Basket.objects.all()[1]

        product_obj = request.data
        print(basket.basket_products.all(), product_obj)
        prod_id = product_obj['id']
        quantity = product_obj['quantity']
        # product = Product.objects.filter(id=prod_id)
        try:
            basket_product = basket.basket_products.get(product_storage=prod_id)
            b_qaunt = basket_product.quantity
            num_of = b_qaunt + quantity
            if num_of == 0:
                basket_product.delete()
            else:
                basket_product.quantity = num_of
                basket_product.save()

        except BasketProduct.DoesNotExist:
            product = ProductStorage.objects.get(id=prod_id)
            basket_product = basket.basket_products.create(product_storage=product, quantity=quantity)
        
        basket_products = basket.basket_products.all()
        basket_products_json = BasketProductSerializer(basket_products, many=True).data

        for basket_product in basket_products_json:
            basket_product['id'] = basket_product['product_storage']
            del basket_product['product_storage']
        response = {'created': True, 'products': basket_products_json}
        print(response)
        return JsonResponse(response)
        
class OrderView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed("Unauthenticated!")
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")

        user = User.objects.filter(id=payload['id']).first()
        basket = user.user_basket
        address_details = request.data['address']
        other = request.data['other']
        try:
            address_obj = Address.objects.get(**address_details)
        except Address.DoesNotExist:
            address_obj = Address.objects.create(**address_details)

        card_details = request.data['card']
        year, month = card_details['expiry_date'].split('-')
        day = calendar.monthrange(int(year), int(month))[1]
        card_details['expiry_date'] = f'{year}-{month}-{day}'
        try:
            card_obj = Card.objects.get(**card_details)
        except Card.DoesNotExist:
            # encrypt details
            card_obj = Card.objects.create(**card_details)
        
        basket_discount = basket.basket_discount
        if basket_discount: 
            discount = basket_discount.discount
            savings = basket_discount.savings
        else:
            discount = None
            savings = 0

        delivery_obj = Delivery.objects.get(delivery_type=other['delivery_type'])
        order = user.user_orders.create(
            address = address_obj,
            card = card_obj,
            discount = discount,
            delivery = delivery_obj,
            contact_number = other['contact_number'],
            order_total = basket.total + delivery_obj.price,
            savings = savings
        )
        basket_products = basket.basket_products.all()
        for basket_product in basket_products:
            order.order_products.create(
                product = basket_product.product_storage,
                quantity = basket_product.quantity,
            )
        if len(order.order_products.all()) == len(basket.basket_products.all()):
            response = {
                'ordered': True,
                'order_id': order.id * order.SCALAR,
                'address': AddressSerializer(order.address).data,
                'final_price': order.order_total
            }
            basket.clear()
            basket_discount.clear()
            print(order.id * order.SCALAR)
        else:
            order.delete()
            card_obj.delete()
            address_obj.delete()
            response = {'ordered': False}
        print(response)
        return JsonResponse(response)

    def get(self, request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed("Unauthenticated!")
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")

        user = User.objects.filter(id=payload['id']).first()
        orders = user.user_orders.all()
        order_data = OrderSerializer(orders, many=True).data
        for order in order_data:
            order['id'] *= orders[0].SCALAR
        response = {
            'orders': order_data,
            # 'scalar': 
        }
        return JsonResponse(response, safe=False)

class GetOrderView(APIView):
    def get(self, request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed("Unauthenticated!")
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")

        user = User.objects.filter(id=payload['id']).first()
        order_id = kwargs['id']
        order_obj = user.user_orders.get(id=order_id/Order.SCALAR)
        order_json = OrderSerializer(order_obj).data
        order_json['id'] *= Order.SCALAR
        response = {'order': order_json}
        return JsonResponse(response)

# check details view
class DetailsView(APIView):
    def post(self, request, *args, **kwargs):
        details = request.data
        address = details['address']
        response = {}
        card = details['card']
        address_valid = self.check_address(**address)
        response['address'] = address_valid
        print(card)
        card_valid = self.check_card(**card)
        response['card'] = card_valid
        return JsonResponse(response)

    def check_address(self, house_number, first_line, second_line, post_code):
        not_null = all([house_number, first_line, post_code])
        if not not_null: 
            return {'valid': False, 'message': 'Fill all required fields.'}
        return {'valid': True}

    def check_card(self, card_number, expiry_date, security_code):
        not_null = all([card_number, expiry_date, security_code])
        if not not_null: 
            return {'valid': False, 'message': 'fill all required fields'}
        
        message = []
        if len(card_number) != 16: message.append('invalid card number')
        if len(security_code) != 3: message.append('invalid security code')
        year, month = expiry_date.split('-')
        day = calendar.monthrange(int(year), int(month))[1]
        if datetime.datetime(int(year), int(month), day) < datetime.datetime.now():
            message.append('card expired')

        if message: 
            return {'valid': False, 'message': 'Error: ' + ','.join(message)}
        else:
            return {'valid': True, 'message': ''}

class DiscountsView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed("Unauthenticated!")
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")

        user = User.objects.filter(id=payload['id']).first()
        basket = user.user_basket
        code = request.data['code']
        try:
            discount = Discount.objects.get(discount_code=code)
            basket_discount = basket.basket_discount
            print(basket_discount)
            basket_discount.clear()
            basket_discount.discount = discount
            basket_discount.save()
            print(discount, 15476537457364)
            print(1434235)
            response = {
                'valid': True, 
                'message': 'valid code',
                'discount': {
                    'discount_type': discount.discount_type,
                    'amount': basket_discount.savings
                }
            }
            print(response, 11111222222222)
        except Discount.DoesNotExist:
            response = {'valid': False, 'message': 'Invalid code'}
        return JsonResponse(response)

    def get(self, request, *args, **kwargs):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed("Unauthenticated!")
        
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Unauthenticated!")

        user = User.objects.filter(id=payload['id']).first()
        basket = user.user_basket
        basket_discount = basket.basket_discount # initialises basket_discount if doesn't exist
        if basket_discount.discount:
            response = {
                'valid': True, 
                'message': 'valid code',
                'discount': {
                    'discount_type': basket_discount.discount.discount_type,
                    'amount': basket_discount.savings
                }
            }
        else:
            response = {'valid': False, 'message': ''}
        
        return JsonResponse(response)
        