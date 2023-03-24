
from django.urls import path, include

from .views import BasketView, GetOrderView, OrderView, DetailsView, DiscountsView

urlpatterns = [
    path('basket', BasketView.as_view()),
    path('order', OrderView.as_view()),
    path('check_details', DetailsView.as_view()),
    path('check_discount', DiscountsView.as_view()),
    path('order-page/<int:id>', GetOrderView.as_view()),
]