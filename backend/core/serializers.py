from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    County, PickupStation, Category, Brand, Product, ProductImage,
    ProductVariant, ProductReview, Cart, CartItem, Wishlist, Address,
    Order, OrderItem, MpesaTransaction, Coupon, Banner
)

User = get_user_model()


# ─── Auth / User ────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'avatar', 'date_of_birth', 'is_vendor']
        read_only_fields = ['id', 'email']


# ─── Location ───────────────────────────────────────────────────────────────

class CountySerializer(serializers.ModelSerializer):
    class Meta:
        model  = County
        fields = ['id', 'name', 'slug', 'code']


class PickupStationSerializer(serializers.ModelSerializer):
    county_name = serializers.CharField(source='county.name', read_only=True)

    class Meta:
        model  = PickupStation
        fields = ['id', 'name', 'slug', 'county', 'county_name', 'address',
                  'phone', 'delivery_fee', 'latitude', 'longitude',
                  'operating_hours', 'is_active']


# ─── Catalogue ──────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'parent', 'image', 'icon',
                  'description', 'is_active', 'order', 'children']

    def get_children(self, obj):
        qs = obj.children.filter(is_active=True)
        return CategorySerializer(qs, many=True, context=self.context).data


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Brand
        fields = ['id', 'name', 'slug', 'logo', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductVariant
        fields = ['id', 'name', 'value', 'price_adjustment', 'stock']


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model  = ProductReview
        fields = ['id', 'user', 'user_name', 'rating', 'title', 'body',
                  'is_verified_purchase', 'helpful_count', 'created_at']
        read_only_fields = ['user', 'is_verified_purchase', 'helpful_count']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    primary_image    = serializers.SerializerMethodField()
    category_name    = serializers.CharField(source='category.name', read_only=True)
    brand_name       = serializers.CharField(source='brand.name', read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Product
        fields = ['id', 'name', 'slug', 'sku', 'category_name', 'brand_name',
                  'price', 'original_price', 'discount_percent', 'stock',
                  'is_featured', 'is_flash_sale', 'flash_sale_end',
                  'rating_avg', 'rating_count', 'sold_count', 'primary_image']

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images           = ProductImageSerializer(many=True, read_only=True)
    variants         = ProductVariantSerializer(many=True, read_only=True)
    reviews          = ProductReviewSerializer(many=True, read_only=True)
    category         = CategorySerializer(read_only=True)
    brand            = BrandSerializer(read_only=True)
    seller_name      = serializers.CharField(source='seller.get_full_name', read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Product
        fields = '__all__'


# ─── Cart ───────────────────────────────────────────────────────────────────

class CartItemSerializer(serializers.ModelSerializer):
    product_name  = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(source='product.price',
                                              max_digits=10, decimal_places=2, read_only=True)
    subtotal      = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = CartItem
        fields = ['id', 'product', 'product_name', 'product_image',
                  'product_price', 'variant', 'quantity', 'subtotal']

    def get_product_image(self, obj):
        img = obj.product.images.filter(is_primary=True).first()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class CartSerializer(serializers.ModelSerializer):
    items      = CartItemSerializer(many=True, read_only=True)
    total      = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']


# ─── Wishlist ────────────────────────────────────────────────────────────────

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True)

    class Meta:
        model  = Wishlist
        fields = ['id', 'product', 'product_id', 'added_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ─── Address ─────────────────────────────────────────────────────────────────

class AddressSerializer(serializers.ModelSerializer):
    county_name         = serializers.CharField(source='county.name', read_only=True)
    pickup_station_name = serializers.CharField(source='pickup_station.name', read_only=True)

    class Meta:
        model  = Address
        fields = ['id', 'full_name', 'phone', 'county', 'county_name',
                  'pickup_station', 'pickup_station_name', 'town', 'street', 'is_default']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ─── Orders ──────────────────────────────────────────────────────────────────

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku',
                  'variant_info', 'quantity', 'unit_price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items           = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    status_display  = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Order
        fields = ['id', 'order_number', 'status', 'status_display', 'items',
                  'shipping_address', 'pickup_station', 'subtotal',
                  'delivery_fee', 'total', 'notes', 'created_at',
                  'updated_at', 'estimated_delivery']


class CreateOrderSerializer(serializers.Serializer):
    address_id       = serializers.IntegerField()
    pickup_station_id = serializers.IntegerField(required=False, allow_null=True)
    coupon_code      = serializers.CharField(required=False, allow_blank=True)
    notes            = serializers.CharField(required=False, allow_blank=True)


# ─── M-Pesa ──────────────────────────────────────────────────────────────────

class MpesaTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MpesaTransaction
        fields = ['id', 'order', 'phone_number', 'amount', 'merchant_request_id',
                  'checkout_request_id', 'mpesa_receipt_number',
                  'result_code', 'result_desc', 'status',
                  'initiated_at', 'completed_at']
        read_only_fields = ['merchant_request_id', 'checkout_request_id',
                            'mpesa_receipt_number', 'result_code', 'result_desc']


class InitiateMpesaSerializer(serializers.Serializer):
    order_id     = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=15)


# ─── Coupons ─────────────────────────────────────────────────────────────────

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value',
                  'minimum_order', 'valid_from', 'valid_to', 'is_active']


class ValidateCouponSerializer(serializers.Serializer):
    code         = serializers.CharField(max_length=20)
    order_amount = serializers.DecimalField(max_digits=10, decimal_places=2)


# ─── Banners ─────────────────────────────────────────────────────────────────

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'link', 'is_active', 'order']