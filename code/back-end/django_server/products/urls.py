
from django.urls import path, include

from .views import BrandView, ProductView, ProductListView, BasketItemsView, PopularProductsView, DiscountView

urlpatterns = [
    path('brands', BrandView.as_view()),
    path('<int:id>', ProductView.as_view()),
    path('product_list/<str:search>', ProductListView.as_view()),
    path('basket_items', BasketItemsView.as_view()),
    path('popular_products', PopularProductsView.as_view()),
    path('discounts', DiscountView.as_view()),
]