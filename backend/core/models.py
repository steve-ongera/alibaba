from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.utils import timezone
import uuid


class User(AbstractUser):
    phone = models.CharField(max_length=15, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_vendor = models.BooleanField(default=False)

    def __str__(self):
        return self.email or self.username


class County(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    code = models.CharField(max_length=10, unique=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Counties"
        ordering = ['name']


class PickupStation(models.Model):
    county = models.ForeignKey(County, on_delete=models.CASCADE, related_name='pickup_stations')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    operating_hours = models.CharField(max_length=100, default="Mon-Sat 8am-6pm")
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.county.name}-{self.name}")
            self.slug = base
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.county.name}) - KES {self.delivery_fee}"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.meta_title:
            self.meta_title = f"Buy {self.name} Online in Kenya | Alibaba Kenya"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['order', 'name']


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    logo = models.ImageField(upload_to='brands/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=300)
    slug = models.SlugField(unique=True, max_length=350)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_flash_sale = models.BooleanField(default=False)
    flash_sale_end = models.DateTimeField(null=True, blank=True)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    meta_keywords = models.CharField(max_length=500, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    sold_count = models.PositiveIntegerField(default=0)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.name)
            self.slug = base
            counter = 1
            while Product.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{base}-{counter}"
                counter += 1
        if not self.sku:
            self.sku = f"ALB-{str(self.id)[:8].upper()}"
        if not self.meta_title:
            self.meta_title = f"Buy {self.name} | Best Price in Kenya | Alibaba Kenya"
        if not self.meta_description:
            self.meta_description = (self.short_description or self.description)[:160]
        super().save(*args, **kwargs)

    @property
    def discount_percent(self):
        if self.original_price and self.original_price > self.price:
            return int(((self.original_price - self.price) / self.original_price) * 100)
        return 0

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    price_adjustment = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)


class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=200, blank=True)
    body = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'user']
        ordering = ['-created_at']


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='cart')
    session_key = models.CharField(max_length=40, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def item_count(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    @property
    def subtotal(self):
        price = self.product.price
        if self.variant:
            price += self.variant.price_adjustment
        return price * self.quantity


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    county = models.ForeignKey(County, on_delete=models.SET_NULL, null=True)
    pickup_station = models.ForeignKey(PickupStation, on_delete=models.SET_NULL, null=True, blank=True, related_name='address_pickups')
    town = models.CharField(max_length=100)
    street = models.CharField(max_length=200, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.full_name} - {self.town}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'), ('paid', 'Paid'),
        ('processing', 'Processing'), ('shipped', 'Shipped'),
        ('out_for_delivery', 'Out for Delivery'), ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'), ('refunded', 'Refunded'),
    ]
    order_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    pickup_station = models.ForeignKey(PickupStation, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_pickups')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    estimated_delivery = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random, string
            self.order_number = 'ALB' + ''.join(random.choices(string.digits, k=10))
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=300)
    product_sku = models.CharField(max_length=50)
    variant_info = models.CharField(max_length=200, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)


class MpesaTransaction(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'), ('pending', 'Pending'),
        ('success', 'Success'), ('failed', 'Failed'), ('cancelled', 'Cancelled'),
    ]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='mpesa_transactions')
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    merchant_request_id = models.CharField(max_length=100, blank=True)
    checkout_request_id = models.CharField(max_length=100, blank=True)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True)
    result_code = models.CharField(max_length=10, blank=True)
    result_desc = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-initiated_at']


class Coupon(models.Model):
    DISCOUNT_TYPE = [('percent', 'Percentage'), ('fixed', 'Fixed Amount')]
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE, default='percent')
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def is_valid(self):
        now = timezone.now()
        return self.is_active and self.valid_from <= now <= self.valid_to


class Banner(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    image = models.ImageField(upload_to='banners/')
    link = models.CharField(max_length=300, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']