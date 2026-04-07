from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model

from rest_framework import generics, viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    County, PickupStation, Category, Brand, Product,
    ProductReview, Cart, CartItem, Wishlist, Address,
    Order, OrderItem, MpesaTransaction, Coupon, Banner
)
from .serializers import (
    RegisterSerializer, UserSerializer,
    CountySerializer, PickupStationSerializer,
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer,
    ProductReviewSerializer,
    CartSerializer, CartItemSerializer,
    WishlistSerializer, AddressSerializer,
    OrderSerializer, CreateOrderSerializer,
    MpesaTransactionSerializer, InitiateMpesaSerializer,
    CouponSerializer, ValidateCouponSerializer,
    BannerSerializer,
)

User = get_user_model()


# ────────────────────────────────────────────────────────────────
#  Auth
# ────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user":    UserSerializer(user).data,
            "refresh": str(refresh),
            "access":  str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/"""
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ────────────────────────────────────────────────────────────────
#  Location
# ────────────────────────────────────────────────────────────────

class CountyListView(generics.ListAPIView):
    queryset           = County.objects.all()
    serializer_class   = CountySerializer
    permission_classes = [permissions.AllowAny]


class PickupStationListView(generics.ListAPIView):
    serializer_class   = PickupStationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = PickupStation.objects.filter(is_active=True)
        county_id = self.request.query_params.get('county')
        if county_id:
            qs = qs.filter(county_id=county_id)
        return qs


# ────────────────────────────────────────────────────────────────
#  Catalogue
# ────────────────────────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    queryset           = Category.objects.filter(is_active=True, parent=None)
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]


class BrandListView(generics.ListAPIView):
    queryset           = Brand.objects.filter(is_active=True)
    serializer_class   = BrandSerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['category__slug', 'brand__slug', 'is_featured', 'is_flash_sale']
    search_fields      = ['name', 'description', 'sku', 'brand__name']
    ordering_fields    = ['price', 'created_at', 'rating_avg', 'sold_count', 'view_count']
    ordering           = ['-created_at']
    lookup_field       = 'slug'

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related(
            'category', 'brand', 'seller'
        ).prefetch_related('images', 'variants')

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def flash_sale(self, request):
        qs = self.get_queryset().filter(
            is_flash_sale=True,
            flash_sale_end__gt=timezone.now()
        )
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.get_queryset().filter(is_featured=True)[:20]
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'],
            permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def reviews(self, request, slug=None):
        product = self.get_object()
        if request.method == 'POST':
            serializer = ProductReviewSerializer(
                data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            review = serializer.save(product=product)
            # update rating denorm
            reviews = product.reviews.all()
            product.rating_avg   = sum(r.rating for r in reviews) / reviews.count()
            product.rating_count = reviews.count()
            product.save(update_fields=['rating_avg', 'rating_count'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        qs = product.reviews.select_related('user').order_by('-created_at')
        serializer = ProductReviewSerializer(qs, many=True)
        return Response(serializer.data)


# ────────────────────────────────────────────────────────────────
#  Cart
# ────────────────────────────────────────────────────────────────

def _get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart


class CartView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = _get_or_create_cart(request)
        return Response(CartSerializer(cart, context={'request': request}).data)

    def post(self, request):
        """Add / update item. Body: {product_id, quantity, variant_id?}"""
        cart       = _get_or_create_cart(request)
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))
        variant_id = request.data.get('variant_id')

        product = get_object_or_404(Product, id=product_id, is_active=True)
        if product.stock < quantity:
            return Response({'detail': 'Not enough stock.'}, status=400)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            variant_id=variant_id if variant_id else None
        )
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart, context={'request': request}).data)

    def delete(self, request):
        """Remove item. Body: {item_id}"""
        cart = _get_or_create_cart(request)
        item_id = request.data.get('item_id')
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        return Response(CartSerializer(cart, context={'request': request}).data)

    def patch(self, request):
        """Update quantity. Body: {item_id, quantity}"""
        cart     = _get_or_create_cart(request)
        item_id  = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()
        return Response(CartSerializer(cart, context={'request': request}).data)


# ────────────────────────────────────────────────────────────────
#  Wishlist
# ────────────────────────────────────────────────────────────────

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class   = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'post', 'delete']

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related(
            'product', 'product__category')


# ────────────────────────────────────────────────────────────────
#  Addresses
# ────────────────────────────────────────────────────────────────

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        self.get_queryset().update(is_default=False)
        address = self.get_object()
        address.is_default = True
        address.save()
        return Response({'detail': 'Default address updated.'})


# ────────────────────────────────────────────────────────────────
#  Orders
# ────────────────────────────────────────────────────────────────

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items', 'items__product')


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        cart = get_object_or_404(Cart, user=request.user)
        if not cart.items.exists():
            return Response({'detail': 'Cart is empty.'}, status=400)

        address = get_object_or_404(Address, id=data['address_id'], user=request.user)
        pickup  = None
        if data.get('pickup_station_id'):
            from .models import PickupStation
            pickup = get_object_or_404(PickupStation, id=data['pickup_station_id'])

        delivery_fee = pickup.delivery_fee if pickup else 0
        subtotal     = cart.total
        total        = subtotal + delivery_fee

        # Coupon
        discount = 0
        if data.get('coupon_code'):
            try:
                coupon = Coupon.objects.get(code=data['coupon_code'])
                if coupon.is_valid() and subtotal >= coupon.minimum_order:
                    if coupon.discount_type == 'percent':
                        discount = subtotal * coupon.discount_value / 100
                    else:
                        discount = coupon.discount_value
                    coupon.used_count += 1
                    coupon.save()
            except Coupon.DoesNotExist:
                pass
        total -= discount

        order = Order.objects.create(
            user=request.user,
            status='pending',
            shipping_address=address,
            pickup_station=pickup,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            notes=data.get('notes', ''),
        )

        for item in cart.items.select_related('product', 'variant').all():
            price = item.product.price
            if item.variant:
                price += item.variant.price_adjustment
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_sku=item.product.sku,
                variant_info=f"{item.variant.name}: {item.variant.value}" if item.variant else '',
                quantity=item.quantity,
                unit_price=price,
                subtotal=price * item.quantity,
            )
            # decrement stock
            item.product.stock -= item.quantity
            item.product.save(update_fields=['stock'])

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


# ────────────────────────────────────────────────────────────────
#  M-Pesa
# ────────────────────────────────────────────────────────────────

class InitiateMpesaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiateMpesaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data  = serializer.validated_data
        order = get_object_or_404(Order, id=data['order_id'], user=request.user)

        # Placeholder — integrate daraja SDK here
        txn = MpesaTransaction.objects.create(
            order=order,
            phone_number=data['phone_number'],
            amount=order.total,
            status='initiated',
        )
        return Response(MpesaTransactionSerializer(txn).data, status=status.HTTP_201_CREATED)


class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        body = request.data.get('Body', {}).get('stkCallback', {})
        checkout_id  = body.get('CheckoutRequestID', '')
        result_code  = str(body.get('ResultCode', ''))
        result_desc  = body.get('ResultDesc', '')

        try:
            txn = MpesaTransaction.objects.get(checkout_request_id=checkout_id)
        except MpesaTransaction.DoesNotExist:
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

        txn.result_code = result_code
        txn.result_desc = result_desc

        if result_code == '0':
            items = body.get('CallbackMetadata', {}).get('Item', [])
            receipt = next((i['Value'] for i in items if i['Name'] == 'MpesaReceiptNumber'), '')
            txn.mpesa_receipt_number = receipt
            txn.status               = 'success'
            txn.completed_at         = timezone.now()
            txn.order.status         = 'paid'
            txn.order.save(update_fields=['status'])
        else:
            txn.status = 'failed'

        txn.save()
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


# ────────────────────────────────────────────────────────────────
#  Coupons
# ────────────────────────────────────────────────────────────────

class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ValidateCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            coupon = Coupon.objects.get(code=data['code'])
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'detail': 'Coupon not found.'}, status=400)

        if not coupon.is_valid():
            return Response({'valid': False, 'detail': 'Coupon is expired or inactive.'}, status=400)
        if data['order_amount'] < coupon.minimum_order:
            return Response({'valid': False, 'detail': f'Minimum order is KES {coupon.minimum_order}.'}, status=400)

        return Response({
            'valid':          True,
            'discount_type':  coupon.discount_type,
            'discount_value': coupon.discount_value,
        })


# ────────────────────────────────────────────────────────────────
#  Banners & Home
# ────────────────────────────────────────────────────────────────

class BannerListView(generics.ListAPIView):
    queryset           = Banner.objects.filter(is_active=True)
    serializer_class   = BannerSerializer
    permission_classes = [permissions.AllowAny]


class HomeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        banners    = Banner.objects.filter(is_active=True)
        categories = Category.objects.filter(is_active=True, parent=None)[:10]
        featured   = Product.objects.filter(is_active=True, is_featured=True)[:12]
        flash_sale = Product.objects.filter(
            is_active=True, is_flash_sale=True,
            flash_sale_end__gt=timezone.now())[:12]
        new_arrivals = Product.objects.filter(is_active=True).order_by('-created_at')[:12]

        return Response({
            'banners':      BannerSerializer(banners, many=True, context={'request': request}).data,
            'categories':   CategorySerializer(categories, many=True, context={'request': request}).data,
            'featured':     ProductListSerializer(featured, many=True, context={'request': request}).data,
            'flash_sale':   ProductListSerializer(flash_sale, many=True, context={'request': request}).data,
            'new_arrivals': ProductListSerializer(new_arrivals, many=True, context={'request': request}).data,
        })