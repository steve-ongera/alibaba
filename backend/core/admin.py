from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.db.models import Sum, Count, Avg
from django.urls import reverse
from django.utils import timezone
from django.contrib import messages
from decimal import Decimal
import json

from .models import (
    User, County, PickupStation, Category, Brand,
    Product, ProductImage, ProductVariant, ProductReview,
    Cart, CartItem, Wishlist, Address,
    Order, OrderItem, MpesaTransaction,
    Coupon, Banner,
)

# ===========================================================================
# ADMIN SITE CUSTOMIZATION
# ===========================================================================

admin.site.site_header  = "🛒 Alibaba Kenya — Admin Panel"
admin.site.site_title   = "Alibaba Kenya"
admin.site.index_title  = "Welcome to Alibaba Kenya Administration"


# ===========================================================================
# HELPERS
# ===========================================================================

def image_preview(url, width=60, height=60):
    if url:
        return format_html(
            '<img src="{}" width="{}" height="{}" '
            'style="object-fit:cover;border-radius:6px;border:1px solid #ddd;" />',
            url, width, height,
        )
    return format_html('<span style="color:#aaa;font-size:11px;">No image</span>')


def colored_badge(text, color):
    return format_html(
        '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;'
        'font-size:11px;font-weight:600;">{}</span>',
        color, text,
    )


STATUS_COLORS = {
    "pending":          "#f59e0b",
    "paid":             "#3b82f6",
    "processing":       "#8b5cf6",
    "shipped":          "#06b6d4",
    "out_for_delivery": "#f97316",
    "delivered":        "#22c55e",
    "cancelled":        "#ef4444",
    "refunded":         "#6b7280",
    "success":          "#22c55e",
    "failed":           "#ef4444",
    "initiated":        "#f59e0b",
}


# ===========================================================================
# USER
# ===========================================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ("avatar_thumb", "email", "full_name", "phone", "is_vendor",
                     "is_active", "is_staff", "date_joined")
    list_filter   = ("is_vendor", "is_active", "is_staff", "is_superuser")
    search_fields = ("email", "username", "first_name", "last_name", "phone")
    ordering      = ("-date_joined",)
    readonly_fields = ("date_joined", "last_login", "avatar_preview")

    fieldsets = (
        ("Account", {
            "fields": ("username", "email", "password"),
        }),
        ("Personal Info", {
            "fields": ("first_name", "last_name", "phone", "date_of_birth",
                       "avatar", "avatar_preview"),
        }),
        ("Roles & Permissions", {
            "fields": ("is_vendor", "is_active", "is_staff", "is_superuser",
                       "groups", "user_permissions"),
        }),
        ("Timestamps", {
            "fields": ("date_joined", "last_login"),
            "classes": ("collapse",),
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2",
                       "first_name", "last_name", "phone", "is_vendor"),
        }),
    )

    def full_name(self, obj):
        return obj.get_full_name() or "—"
    full_name.short_description = "Name"

    def avatar_thumb(self, obj):
        return image_preview(obj.avatar.url if obj.avatar else None, 36, 36)
    avatar_thumb.short_description = ""

    def avatar_preview(self, obj):
        return image_preview(obj.avatar.url if obj.avatar else None, 120, 120)
    avatar_preview.short_description = "Current Avatar"


# ===========================================================================
# COUNTY
# ===========================================================================

@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display  = ("name", "code", "slug", "station_count")
    search_fields = ("name", "code")
    prepopulated_fields = {"slug": ("name",)}

    def station_count(self, obj):
        count = obj.pickup_stations.count()
        return format_html('<b>{}</b> station(s)', count)
    station_count.short_description = "Stations"


# ===========================================================================
# PICKUP STATION
# ===========================================================================

@admin.register(PickupStation)
class PickupStationAdmin(admin.ModelAdmin):
    list_display  = ("name", "county", "delivery_fee_display", "phone",
                     "operating_hours", "is_active")
    list_filter   = ("is_active", "county")
    search_fields = ("name", "address", "phone", "county__name")
    list_editable = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("map_link",)

    fieldsets = (
        ("Location", {
            "fields": ("county", "name", "slug", "address", "latitude", "longitude", "map_link"),
        }),
        ("Details", {
            "fields": ("phone", "delivery_fee", "operating_hours", "is_active"),
        }),
    )

    def delivery_fee_display(self, obj):
        return format_html("KES <b>{}</b>", obj.delivery_fee)
    delivery_fee_display.short_description = "Delivery Fee"

    def map_link(self, obj):
        if obj.latitude and obj.longitude:
            url = f"https://maps.google.com/?q={obj.latitude},{obj.longitude}"
            return format_html('<a href="{}" target="_blank">📍 View on Google Maps</a>', url)
        return "—"
    map_link.short_description = "Map"


# ===========================================================================
# CATEGORY
# ===========================================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ("category_image", "name", "parent", "icon", "product_count",
                     "is_active", "order")
    list_filter   = ("is_active", "parent")
    search_fields = ("name", "description")
    list_editable = ("is_active", "order")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("image_preview_large",)

    fieldsets = (
        ("Basic Info", {
            "fields": ("name", "slug", "parent", "icon", "description", "order", "is_active"),
        }),
        ("Image", {
            "fields": ("image", "image_preview_large"),
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description"),
            "classes": ("collapse",),
        }),
    )

    def category_image(self, obj):
        return image_preview(obj.image.url if obj.image else None, 40, 40)
    category_image.short_description = ""

    def image_preview_large(self, obj):
        return image_preview(obj.image.url if obj.image else None, 200, 200)
    image_preview_large.short_description = "Preview"

    def product_count(self, obj):
        count = obj.products.filter(is_active=True).count()
        return format_html('<b>{}</b>', count)
    product_count.short_description = "Products"


# ===========================================================================
# BRAND
# ===========================================================================

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display  = ("logo_thumb", "name", "slug", "product_count", "is_active")
    list_filter   = ("is_active",)
    search_fields = ("name",)
    list_editable = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}

    def logo_thumb(self, obj):
        return image_preview(obj.logo.url if obj.logo else None, 40, 40)
    logo_thumb.short_description = ""

    def product_count(self, obj):
        count = obj.product_set.filter(is_active=True).count()
        return format_html('<b>{}</b>', count)
    product_count.short_description = "Products"


# ===========================================================================
# PRODUCT IMAGES (inline)
# ===========================================================================

class ProductImageInline(admin.TabularInline):
    model   = ProductImage
    extra   = 1
    fields  = ("image_preview", "image", "alt_text", "is_primary", "order")
    readonly_fields = ("image_preview",)
    ordering = ("order",)

    def image_preview(self, obj):
        return image_preview(obj.image.url if obj.image else None, 70, 70)
    image_preview.short_description = "Preview"


class ProductVariantInline(admin.TabularInline):
    model   = ProductVariant
    extra   = 1
    fields  = ("name", "value", "price_adjustment", "stock")


class ProductReviewInline(admin.TabularInline):
    model   = ProductReview
    extra   = 0
    fields  = ("user", "rating", "title", "is_verified_purchase", "helpful_count", "created_at")
    readonly_fields = ("created_at",)
    can_delete = True


# ===========================================================================
# PRODUCT
# ===========================================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "primary_image", "name", "category", "brand", "seller",
        "price_display", "stock_badge", "rating_display",
        "is_active", "is_featured", "is_flash_sale", "created_at",
    )
    list_filter  = (
        "is_active", "is_featured", "is_flash_sale",
        "category", "brand", "seller",
    )
    search_fields = ("name", "sku", "description", "seller__email", "brand__name")
    list_editable = ("is_active", "is_featured", "is_flash_sale")
    readonly_fields = (
        "id", "sku", "slug", "discount_percent_display",
        "view_count", "sold_count", "rating_avg", "rating_count",
        "created_at", "updated_at",
    )
    inlines   = [ProductImageInline, ProductVariantInline, ProductReviewInline]
    ordering  = ("-created_at",)
    date_hierarchy = "created_at"
    save_on_top = True

    fieldsets = (
        ("Product Info", {
            "fields": (
                "id", "name", "slug", "sku", "category", "brand", "seller",
                "description", "short_description",
            ),
        }),
        ("Pricing & Stock", {
            "fields": (
                "price", "original_price", "discount_percent_display", "stock",
            ),
        }),
        ("Visibility & Promotions", {
            "fields": (
                "is_active", "is_featured", "is_flash_sale", "flash_sale_end",
            ),
        }),
        ("Stats", {
            "fields": (
                "view_count", "sold_count", "rating_avg", "rating_count",
            ),
            "classes": ("collapse",),
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description", "meta_keywords"),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    actions = [
        "mark_active", "mark_inactive", "mark_featured",
        "unmark_featured", "mark_flash_sale", "unmark_flash_sale",
    ]

    def primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return image_preview(img.image.url if img else None, 55, 55)
    primary_image.short_description = ""

    def price_display(self, obj):
        html = f'<b style="color:#16a34a;">KES {obj.price:,.0f}</b>'
        if obj.original_price and obj.original_price > obj.price:
            html += (
                f'<br><s style="color:#aaa;font-size:11px;">KES {obj.original_price:,.0f}</s>'
                f'<span style="color:#ef4444;font-size:11px;margin-left:4px;">'
                f'-{obj.discount_percent}%</span>'
            )
        return format_html(html)
    price_display.short_description = "Price"

    def stock_badge(self, obj):
        if obj.stock == 0:
            return colored_badge("Out of Stock", "#ef4444")
        elif obj.stock <= 10:
            return colored_badge(f"Low: {obj.stock}", "#f59e0b")
        return colored_badge(str(obj.stock), "#22c55e")
    stock_badge.short_description = "Stock"

    def rating_display(self, obj):
        stars = "★" * int(obj.rating_avg) + "☆" * (5 - int(obj.rating_avg))
        return format_html(
            '<span style="color:#f59e0b;">{}</span> '
            '<span style="font-size:11px;color:#777;">({} reviews)</span>',
            stars, obj.rating_count,
        )
    rating_display.short_description = "Rating"

    def discount_percent_display(self, obj):
        return f"{obj.discount_percent}%"
    discount_percent_display.short_description = "Discount"

    def mark_active(self, request, qs):
        updated = qs.update(is_active=True)
        self.message_user(request, f"{updated} product(s) marked as Active.", messages.SUCCESS)
    mark_active.short_description = "✅ Mark selected as Active"

    def mark_inactive(self, request, qs):
        updated = qs.update(is_active=False)
        self.message_user(request, f"{updated} product(s) marked as Inactive.", messages.WARNING)
    mark_inactive.short_description = "❌ Mark selected as Inactive"

    def mark_featured(self, request, qs):
        qs.update(is_featured=True)
        self.message_user(request, "Marked as Featured.", messages.SUCCESS)
    mark_featured.short_description = "⭐ Mark as Featured"

    def unmark_featured(self, request, qs):
        qs.update(is_featured=False)
        self.message_user(request, "Removed from Featured.", messages.WARNING)
    unmark_featured.short_description = "Remove from Featured"

    def mark_flash_sale(self, request, qs):
        end = timezone.now() + timezone.timedelta(days=3)
        qs.update(is_flash_sale=True, flash_sale_end=end)
        self.message_user(request, "Flash Sale enabled (3 days).", messages.SUCCESS)
    mark_flash_sale.short_description = "🔥 Enable Flash Sale (3 days)"

    def unmark_flash_sale(self, request, qs):
        qs.update(is_flash_sale=False, flash_sale_end=None)
        self.message_user(request, "Flash Sale disabled.", messages.WARNING)
    unmark_flash_sale.short_description = "Disable Flash Sale"


# ===========================================================================
# PRODUCT REVIEW (standalone)
# ===========================================================================

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display  = ("product", "user", "star_display", "title",
                     "is_verified_purchase", "helpful_count", "created_at")
    list_filter   = ("rating", "is_verified_purchase")
    search_fields = ("product__name", "user__email", "title", "body")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    def star_display(self, obj):
        stars = "★" * obj.rating + "☆" * (5 - obj.rating)
        return format_html('<span style="color:#f59e0b;font-size:14px;">{}</span>', stars)
    star_display.short_description = "Rating"


# ===========================================================================
# ORDER ITEMS (inline)
# ===========================================================================

class OrderItemInline(admin.TabularInline):
    model   = OrderItem
    extra   = 0
    fields  = ("product_name", "product_sku", "variant_info", "quantity",
               "unit_price", "subtotal")
    readonly_fields = ("product_name", "product_sku", "variant_info",
                       "quantity", "unit_price", "subtotal")
    can_delete = False


class MpesaTransactionInline(admin.TabularInline):
    model   = MpesaTransaction
    extra   = 0
    fields  = ("phone_number", "amount", "mpesa_receipt_number",
               "status_badge", "initiated_at", "completed_at")
    readonly_fields = fields
    can_delete = False

    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, "#6b7280")
        return colored_badge(obj.get_status_display(), color)
    status_badge.short_description = "Status"


# ===========================================================================
# ORDER
# ===========================================================================

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number", "user_link", "status_badge", "item_count",
        "subtotal_display", "delivery_fee_display", "total_display",
        "pickup_station", "created_at", "estimated_delivery",
    )
    list_filter  = ("status", "created_at", "pickup_station__county")
    search_fields = (
        "order_number", "user__email", "user__first_name",
        "user__last_name", "pickup_station__name",
    )
    readonly_fields = (
        "order_number", "created_at", "updated_at",
        "subtotal", "total",
    )
    inlines   = [OrderItemInline, MpesaTransactionInline]
    ordering  = ("-created_at",)
    date_hierarchy = "created_at"
    save_on_top = True

    fieldsets = (
        ("Order Info", {
            "fields": (
                "order_number", "user", "status",
                "shipping_address", "pickup_station", "notes",
            ),
        }),
        ("Financials", {
            "fields": ("subtotal", "delivery_fee", "total"),
        }),
        ("Dates", {
            "fields": ("created_at", "updated_at", "estimated_delivery"),
        }),
    )

    actions = [
        "mark_paid", "mark_processing", "mark_shipped",
        "mark_delivered", "mark_cancelled",
    ]

    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, "#6b7280")
        return colored_badge(obj.get_status_display(), color)
    status_badge.short_description = "Status"

    def user_link(self, obj):
        url = reverse("admin:core_user_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.email)
    user_link.short_description = "Customer"

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = "Items"

    def subtotal_display(self, obj):
        return format_html("KES <b>{:,.0f}</b>", obj.subtotal)
    subtotal_display.short_description = "Subtotal"

    def delivery_fee_display(self, obj):
        return format_html("KES {:,.0f}", obj.delivery_fee)
    delivery_fee_display.short_description = "Delivery"

    def total_display(self, obj):
        return format_html('<b style="color:#16a34a;">KES {:,.0f}</b>', obj.total)
    total_display.short_description = "Total"

    def _bulk_status(self, request, qs, status, label):
        updated = qs.update(status=status)
        self.message_user(request, f"{updated} order(s) marked as {label}.", messages.SUCCESS)

    def mark_paid(self, request, qs):
        self._bulk_status(request, qs, "paid", "Paid")
    mark_paid.short_description = "Mark as Paid"

    def mark_processing(self, request, qs):
        self._bulk_status(request, qs, "processing", "Processing")
    mark_processing.short_description = "Mark as Processing"

    def mark_shipped(self, request, qs):
        self._bulk_status(request, qs, "shipped", "Shipped")
    mark_shipped.short_description = "🚚 Mark as Shipped"

    def mark_delivered(self, request, qs):
        self._bulk_status(request, qs, "delivered", "Delivered")
    mark_delivered.short_description = "✅ Mark as Delivered"

    def mark_cancelled(self, request, qs):
        self._bulk_status(request, qs, "cancelled", "Cancelled")
    mark_cancelled.short_description = "❌ Mark as Cancelled"


# ===========================================================================
# MPESA TRANSACTION
# ===========================================================================

@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display  = (
        "order_link", "phone_number", "amount_display",
        "mpesa_receipt_number", "status_badge",
        "initiated_at", "completed_at",
    )
    list_filter   = ("status", "initiated_at")
    search_fields = (
        "phone_number", "mpesa_receipt_number",
        "merchant_request_id", "checkout_request_id",
        "order__order_number",
    )
    readonly_fields = (
        "order", "merchant_request_id", "checkout_request_id",
        "mpesa_receipt_number", "result_code", "result_desc",
        "initiated_at", "completed_at",
    )
    ordering = ("-initiated_at",)
    date_hierarchy = "initiated_at"

    def status_badge(self, obj):
        color = STATUS_COLORS.get(obj.status, "#6b7280")
        return colored_badge(obj.get_status_display(), color)
    status_badge.short_description = "Status"

    def order_link(self, obj):
        url = reverse("admin:core_order_change", args=[obj.order.pk])
        return format_html('<a href="{}">{}</a>', url, obj.order.order_number)
    order_link.short_description = "Order"

    def amount_display(self, obj):
        return format_html('<b>KES {:,.0f}</b>', obj.amount)
    amount_display.short_description = "Amount"


# ===========================================================================
# CART & CART ITEMS
# ===========================================================================

class CartItemInline(admin.TabularInline):
    model   = CartItem
    extra   = 0
    fields  = ("product", "variant", "quantity", "subtotal_display", "added_at")
    readonly_fields = ("subtotal_display", "added_at")

    def subtotal_display(self, obj):
        return format_html("KES <b>{:,.0f}</b>", obj.subtotal)
    subtotal_display.short_description = "Subtotal"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display  = ("id", "user", "session_key", "item_count_display",
                     "total_display", "created_at", "updated_at")
    search_fields = ("user__email", "session_key")
    readonly_fields = ("created_at", "updated_at")
    inlines = [CartItemInline]

    def item_count_display(self, obj):
        return obj.item_count
    item_count_display.short_description = "Items"

    def total_display(self, obj):
        return format_html('<b>KES {:,.0f}</b>', obj.total)
    total_display.short_description = "Cart Total"


# ===========================================================================
# WISHLIST
# ===========================================================================

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display  = ("user", "product_link", "product_price", "added_at")
    search_fields = ("user__email", "product__name")
    list_filter   = ("added_at",)
    readonly_fields = ("added_at",)

    def product_link(self, obj):
        url = reverse("admin:core_product_change", args=[obj.product.pk])
        return format_html('<a href="{}">{}</a>', url, obj.product.name)
    product_link.short_description = "Product"

    def product_price(self, obj):
        return format_html("KES <b>{:,.0f}</b>", obj.product.price)
    product_price.short_description = "Price"


# ===========================================================================
# ADDRESS
# ===========================================================================

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display  = ("full_name", "user", "county", "town",
                     "pickup_station", "phone", "is_default")
    list_filter   = ("is_default", "county")
    search_fields = ("full_name", "user__email", "town", "street", "phone")
    list_editable = ("is_default",)


# ===========================================================================
# COUPON
# ===========================================================================

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display  = (
        "code", "discount_display", "minimum_order_display",
        "usage_display", "validity_badge", "valid_from", "valid_to", "is_active",
    )
    list_filter   = ("discount_type", "is_active")
    search_fields = ("code",)
    list_editable = ("is_active",)
    readonly_fields = ("used_count",)

    fieldsets = (
        ("Coupon Details", {
            "fields": ("code", "discount_type", "discount_value", "minimum_order"),
        }),
        ("Usage Limits", {
            "fields": ("max_uses", "used_count"),
        }),
        ("Validity", {
            "fields": ("valid_from", "valid_to", "is_active"),
        }),
    )

    def discount_display(self, obj):
        if obj.discount_type == "percent":
            return format_html('<b style="color:#8b5cf6;">{:.0f}% OFF</b>', obj.discount_value)
        return format_html('<b style="color:#16a34a;">KES {:.0f} OFF</b>', obj.discount_value)
    discount_display.short_description = "Discount"

    def minimum_order_display(self, obj):
        return format_html("KES {:,.0f}", obj.minimum_order)
    minimum_order_display.short_description = "Min. Order"

    def usage_display(self, obj):
        limit = str(obj.max_uses) if obj.max_uses else "∞"
        return format_html("{} / {}", obj.used_count, limit)
    usage_display.short_description = "Used / Limit"

    def validity_badge(self, obj):
        if obj.is_valid():
            return colored_badge("Valid", "#22c55e")
        return colored_badge("Expired", "#ef4444")
    validity_badge.short_description = "Status"


# ===========================================================================
# BANNER
# ===========================================================================

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display  = ("banner_preview", "title", "subtitle", "link",
                     "order", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("title", "subtitle")
    list_filter   = ("is_active",)
    readonly_fields = ("banner_large",)

    fieldsets = (
        ("Content", {
            "fields": ("title", "subtitle", "link", "order", "is_active"),
        }),
        ("Image", {
            "fields": ("image", "banner_large"),
        }),
    )

    def banner_preview(self, obj):
        return image_preview(obj.image.url if obj.image else None, 100, 45)
    banner_preview.short_description = "Preview"

    def banner_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:600px;border-radius:8px;" />',
                obj.image.url,
            )
        return "—"
    banner_large.short_description = "Banner Preview"