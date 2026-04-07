# store/urls.py  (app-level)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView)

from . import views

router = DefaultRouter()
router.register(r'products',  views.ProductViewSet,  basename='product')
router.register(r'wishlist',  views.WishlistViewSet,  basename='wishlist')
router.register(r'addresses', views.AddressViewSet,   basename='address')
router.register(r'orders',    views.OrderViewSet,     basename='order')

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────
    path('auth/register/',      views.RegisterView.as_view(),         name='register'),
    path('auth/login/',         TokenObtainPairView.as_view(),        name='token_obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(),           name='token_refresh'),
    path('auth/token/verify/',  TokenVerifyView.as_view(),            name='token_verify'),
    path('auth/profile/',       views.ProfileView.as_view(),          name='profile'),

    # ── Location ──────────────────────────────────────────────
    path('counties/',           views.CountyListView.as_view(),       name='counties'),
    path('pickup-stations/',    views.PickupStationListView.as_view(), name='pickup-stations'),

    # ── Catalogue ─────────────────────────────────────────────
    path('categories/',         views.CategoryListView.as_view(),     name='categories'),
    path('brands/',             views.BrandListView.as_view(),        name='brands'),

    # ── Cart ──────────────────────────────────────────────────
    path('cart/',               views.CartView.as_view(),             name='cart'),

    # ── Orders ────────────────────────────────────────────────
    path('orders/create/',      views.CreateOrderView.as_view(),      name='order-create'),

    # ── Payments ──────────────────────────────────────────────
    path('mpesa/initiate/',     views.InitiateMpesaView.as_view(),    name='mpesa-initiate'),
    path('mpesa/callback/',     views.MpesaCallbackView.as_view(),    name='mpesa-callback'),

    # ── Coupons ───────────────────────────────────────────────
    path('coupons/validate/',   views.ValidateCouponView.as_view(),   name='coupon-validate'),

    # ── Home / Banners ────────────────────────────────────────
    path('home/',               views.HomeView.as_view(),             name='home'),
    path('banners/',            views.BannerListView.as_view(),       name='banners'),

    # ── Router (products, wishlist, addresses, orders) ────────
    path('', include(router.urls)),
]