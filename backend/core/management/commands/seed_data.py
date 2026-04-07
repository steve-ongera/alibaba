"""
Management command to seed the database with realistic data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --clear   # clears all data first

Images are loaded from: D:\\gadaf\\Documents\\images\\jumia
Place product images in that folder (jpg/jpeg/png/webp).
The script will cycle through all found images across the 40 products.
"""

import os
import glob
import random
import string
import uuid
from decimal import Decimal
from datetime import date, timedelta
from pathlib import Path

from django.core.management.base import BaseCommand
from django.core.files import File
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model

User = get_user_model()

# ---------------------------------------------------------------------------
# LOCAL IMAGES FOLDER  (Windows path – works when run on your machine)
# ---------------------------------------------------------------------------
IMAGES_DIR = Path(r"D:\gadaf\Documents\images\jumia")


def get_local_images():
    """Return a sorted list of image paths from the jumia folder."""
    extensions = ["*.jpg", "*.jpeg", "*.png", "*.webp"]
    images = []
    for ext in extensions:
        images.extend(glob.glob(str(IMAGES_DIR / ext)))
        images.extend(glob.glob(str(IMAGES_DIR / ext.upper())))
    return sorted(set(images))


# ---------------------------------------------------------------------------
# SEED DATA DEFINITIONS
# ---------------------------------------------------------------------------

COUNTIES = [
    ("Nairobi", "001"),
    ("Mombasa", "002"),
    ("Kisumu", "003"),
    ("Nakuru", "004"),
    ("Eldoret", "005"),
    ("Thika", "006"),
    ("Meru", "007"),
    ("Nyeri", "008"),
    ("Machakos", "009"),
    ("Kiambu", "010"),
]

PICKUP_STATIONS = [
    # (county_name, station_name, address, phone, fee)
    ("Nairobi", "CBD Pick-up Point", "Moi Avenue, CBD, Nairobi", "0700000001", Decimal("100.00")),
    ("Nairobi", "Westlands Station", "Westlands Mall, Nairobi", "0700000002", Decimal("120.00")),
    ("Nairobi", "Eastleigh Hub", "1st Avenue, Eastleigh", "0700000003", Decimal("110.00")),
    ("Mombasa", "Nyali Center", "Nyali Centre Mall, Mombasa", "0700000004", Decimal("150.00")),
    ("Mombasa", "Likoni Hub", "Likoni Crossing, Mombasa", "0700000005", Decimal("160.00")),
    ("Kisumu", "Kisumu Town", "Oginga Odinga St, Kisumu", "0700000006", Decimal("200.00")),
    ("Nakuru", "Nakuru CBD", "Kenyatta Ave, Nakuru", "0700000007", Decimal("180.00")),
    ("Eldoret", "Eldoret Express", "Uganda Road, Eldoret", "0700000008", Decimal("220.00")),
    ("Thika", "Thika Road Pick-up", "Thika Town, Blue Post", "0700000009", Decimal("130.00")),
    ("Kiambu", "Ruiru Station", "Ruiru Town Centre", "0700000010", Decimal("140.00")),
]

CATEGORIES = [
    # (name, parent_name_or_None, icon)
    ("Electronics", None, "fa-microchip"),
    ("Phones & Tablets", "Electronics", "fa-mobile-alt"),
    ("Laptops & Computers", "Electronics", "fa-laptop"),
    ("TVs & Audio", "Electronics", "fa-tv"),
    ("Cameras", "Electronics", "fa-camera"),
    ("Fashion", None, "fa-tshirt"),
    ("Men's Clothing", "Fashion", "fa-male"),
    ("Women's Clothing", "Fashion", "fa-female"),
    ("Shoes", "Fashion", "fa-shoe-prints"),
    ("Home & Kitchen", None, "fa-home"),
    ("Furniture", "Home & Kitchen", "fa-couch"),
    ("Kitchen Appliances", "Home & Kitchen", "fa-blender"),
    ("Sports & Outdoors", None, "fa-running"),
    ("Beauty & Health", None, "fa-spa"),
    ("Baby Products", None, "fa-baby"),
]

BRANDS = [
    "Samsung", "Apple", "Tecno", "Infinix", "Itel",
    "HP", "Dell", "Lenovo", "LG", "Sony",
    "Nike", "Adidas", "Puma", "Gucci", "Zara",
    "Philips", "Bruhm", "Von", "Ramtons", "Ariston",
]

PRODUCTS = [
    # (name, category, brand, price, original_price, stock, description)
    ("Samsung Galaxy A54 5G 128GB", "Phones & Tablets", "Samsung",
     Decimal("38999"), Decimal("45000"), 50,
     "6.4-inch Super AMOLED display, 50MP triple camera, 5000mAh battery with 25W fast charging."),

    ("Tecno Spark 20 Pro 256GB", "Phones & Tablets", "Tecno",
     Decimal("19999"), Decimal("24000"), 80,
     "6.6-inch FHD+ display, 108MP main camera, 5000mAh battery, Android 13."),

    ("Infinix Hot 40i 128GB", "Phones & Tablets", "Infinix",
     Decimal("12999"), Decimal("15000"), 120,
     "6.56-inch display, 50MP AI camera, 5000mAh battery, MediaTek Helio G85."),

    ("Apple iPhone 15 128GB", "Phones & Tablets", "Apple",
     Decimal("129999"), Decimal("145000"), 20,
     "6.1-inch Super Retina XDR, A16 Bionic chip, 48MP main camera, iOS 17."),

    ("Samsung Galaxy Tab A9+ WiFi", "Phones & Tablets", "Samsung",
     Decimal("35999"), Decimal("42000"), 30,
     "11-inch LCD display, 8GB RAM + 128GB storage, 7040mAh battery, Snapdragon 695."),

    ("HP 250 G9 Laptop 15.6\" Core i5", "Laptops & Computers", "HP",
     Decimal("65000"), Decimal("72000"), 25,
     "Intel Core i5-1235U, 8GB DDR4 RAM, 512GB SSD, Windows 11 Home, Full HD display."),

    ("Lenovo IdeaPad 3 Core i3 15.6\"", "Laptops & Computers", "Lenovo",
     Decimal("45000"), Decimal("52000"), 35,
     "Intel Core i3-1215U, 8GB RAM, 256GB SSD, Windows 11, 15.6\" HD display."),

    ("Dell Inspiron 15 3000 Core i7", "Laptops & Computers", "Dell",
     Decimal("89000"), Decimal("99000"), 15,
     "12th Gen Intel Core i7, 16GB RAM, 512GB SSD, NVIDIA GeForce MX550, Windows 11."),

    ("HP LaserJet Pro M15w Printer", "Laptops & Computers", "HP",
     Decimal("14999"), Decimal("18000"), 40,
     "Wireless monochrome laser printer, 19 ppm, USB & WiFi connectivity."),

    ("Samsung 43\" Crystal UHD 4K TV", "TVs & Audio", "Samsung",
     Decimal("55000"), Decimal("65000"), 20,
     "4K UHD, Crystal Processor 4K, HDR, PurColor, Smart TV with Tizen OS."),

    ("LG 32\" Full HD LED TV", "TVs & Audio", "LG",
     Decimal("28000"), Decimal("33000"), 45,
     "Full HD 1080p, Active HDR, AI Sound, WebOS Smart TV, Magic Remote."),

    ("Sony 55\" BRAVIA 4K OLED TV", "TVs & Audio", "Sony",
     Decimal("135000"), Decimal("160000"), 10,
     "4K OLED, XR Processor, Dolby Atmos, Google TV, HDMI 2.1 ports."),

    ("Bluetooth Speaker JBL Flip 6", "TVs & Audio", "Sony",
     Decimal("12999"), Decimal("16000"), 60,
     "IP67 waterproof, 12 hours playtime, bold JBL Pro Sound, PartyBoost compatible."),

    ("Canon EOS 250D DSLR Camera", "Cameras", "Sony",
     Decimal("85000"), Decimal("99000"), 12,
     "24.1MP APS-C sensor, 4K video, DIGIC 8 processor, Wi-Fi & Bluetooth, vari-angle touchscreen."),

    ("Sony ZV-E10 Mirrorless Camera", "Cameras", "Sony",
     Decimal("78000"), Decimal("90000"), 18,
     "24.2MP APS-C, 4K video, real-time eye tracking, directional 3-capsule mic."),

    ("Nike Air Max 270 Men's Shoes", "Shoes", "Nike",
     Decimal("12999"), Decimal("16000"), 100,
     "Max Air unit in heel, breathable mesh upper, rubber outsole for traction."),

    ("Adidas Ultraboost 22 Running Shoes", "Shoes", "Adidas",
     Decimal("14999"), Decimal("18500"), 80,
     "BOOST midsole cushioning, Primeknit+ upper, Continental rubber outsole."),

    ("Puma Softride Men's Sneakers", "Shoes", "Puma",
     Decimal("7999"), Decimal("10000"), 150,
     "SOFTRIDE foam midsole for all-day comfort, EVA outsole, lace-up closure."),

    ("Nike Dri-FIT Men's T-Shirt", "Men's Clothing", "Nike",
     Decimal("3499"), Decimal("4500"), 200,
     "Sweat-wicking Dri-FIT fabric, standard fit, 100% polyester, machine washable."),

    ("Adidas Tiro 23 Men's Track Pants", "Men's Clothing", "Adidas",
     Decimal("4999"), Decimal("6500"), 180,
     "Slim-fit track pants, AEROREADY moisture management, recycled materials."),

    ("Zara Women's Floral Maxi Dress", "Women's Clothing", "Zara",
     Decimal("5999"), Decimal("8000"), 90,
     "Flowing chiffon fabric, all-over floral print, V-neckline, adjustable spaghetti straps."),

    ("Gucci GG Marmont Women's Bag", "Women's Clothing", "Gucci",
     Decimal("25000"), Decimal("32000"), 15,
     "Matelassé chevron leather, gold-toned hardware, chain strap, magnetic closure."),

    ("Ramtons 4-Slice Pop-Up Toaster", "Kitchen Appliances", "Ramtons",
     Decimal("2999"), Decimal("3800"), 300,
     "4 browning levels, removable crumb tray, 1500W power, stainless steel body."),

    ("Von Hotpoint 20L Microwave Oven", "Kitchen Appliances", "Von",
     Decimal("8999"), Decimal("11000"), 80,
     "20-litre capacity, 700W output, 5 power levels, digital display, defrost function."),

    ("Bruhm 3-Burner Gas Cooker", "Kitchen Appliances", "Bruhm",
     Decimal("14999"), Decimal("18000"), 55,
     "3 brass burners, enamel pan supports, piezoelectric ignition, stainless steel top."),

    ("Ariston 7kg Top Load Washing Machine", "Kitchen Appliances", "Ariston",
     Decimal("39999"), Decimal("48000"), 20,
     "7kg capacity, 12 wash programs, 700 RPM spin, LED display, child lock."),

    ("Philips Air Fryer HD9200", "Kitchen Appliances", "Philips",
     Decimal("12999"), Decimal("16000"), 65,
     "4.1-litre capacity, Rapid Air Technology, up to 90% less fat, 1400W, dishwasher safe."),

    ("LG Side-by-Side Refrigerator 508L", "Kitchen Appliances", "LG",
     Decimal("95000"), Decimal("110000"), 12,
     "508-litre total capacity, InstaView Door-in-Door, LinearCooling, Smart ThinQ."),

    ("Itel A70 64GB Smartphone", "Phones & Tablets", "Itel",
     Decimal("8999"), Decimal("11000"), 200,
     "6.6-inch display, 5000mAh battery, 13MP camera, 3GB RAM, Android 13 Go."),

    ("Samsung Galaxy Buds2 Pro TWS", "TVs & Audio", "Samsung",
     Decimal("18999"), Decimal("24000"), 70,
     "Intelligent ANC, 360° audio, 29hr total battery, Hi-Fi 24-bit audio, IPX7."),

    ("Lenovo Tab M10 Plus 3rd Gen", "Phones & Tablets", "Lenovo",
     Decimal("28999"), Decimal("35000"), 40,
     "10.6-inch 2K display, Helio G80, 4GB RAM, 128GB storage, 7700mAh battery."),

    ("Dell 24\" IPS Monitor P2422H", "Laptops & Computers", "Dell",
     Decimal("32000"), Decimal("38000"), 30,
     "Full HD IPS panel, 5ms response time, 60Hz, HDMI+DP+VGA, height adjustable."),

    ("HP Wireless Keyboard & Mouse Combo", "Laptops & Computers", "HP",
     Decimal("3999"), Decimal("5500"), 250,
     "2.4GHz wireless, slim keyboard, optical mouse, plug-and-play USB receiver."),

    ("Nike Football Size 5 Match Ball", "Sports & Outdoors", "Nike",
     Decimal("4999"), Decimal("6500"), 100,
     "FIFA Quality Pro certified, reinforced rubber bladder, machine-stitched, all weather."),

    ("Adidas Gym Bag 30L", "Sports & Outdoors", "Adidas",
     Decimal("3999"), Decimal("5000"), 120,
     "30-litre capacity, separate wet compartment, adjustable shoulder strap, zip pockets."),

    ("Philips Beard Trimmer BT3231", "Beauty & Health", "Philips",
     Decimal("4999"), Decimal("6500"), 150,
     "13 length settings, DualCut technology, 60-min runtime, washable attachment."),

    ("Huggies Gold Newborn Diapers 40s", "Baby Products", "Sony",
     Decimal("1299"), Decimal("1600"), 500,
     "Size 1 (2–5kg), wetness indicator, BreathEasy layer, hypoallergenic, pack of 40."),

    ("Bruhm 2-Door Fridge 120L", "Kitchen Appliances", "Bruhm",
     Decimal("28999"), Decimal("35000"), 35,
     "120-litre capacity, separate freezer, mechanical thermostat, low noise compressor."),

    ("Tecno Phantom X2 Pro 512GB", "Phones & Tablets", "Tecno",
     Decimal("74999"), Decimal("89000"), 22,
     "6.8-inch AMOLED Curved, Dimensity 9000, 50MP periscope camera, 4600mAh, 45W."),

    ("Samsung 980 Pro NVMe SSD 1TB", "Laptops & Computers", "Samsung",
     Decimal("18999"), Decimal("24000"), 60,
     "PCIe 4.0 NVMe, 7000MB/s read, 5000MB/s write, MLC NAND, PS5 compatible."),
]


class Command(BaseCommand):
    help = "Seed the database with realistic Kenyan e-commerce data (40 products)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write(self.style.WARNING("Clearing existing data..."))
            self._clear_data()

        self.stdout.write(self.style.MIGRATE_HEADING("Starting data seeding..."))

        image_paths = get_local_images()
        if not image_paths:
            self.stdout.write(
                self.style.WARNING(
                    f"No images found in {IMAGES_DIR}. "
                    "Products will be created without images. "
                    "Add jpg/png images to that folder and re-run."
                )
            )

        self._seed_users()
        self._seed_counties()
        self._seed_pickup_stations()
        self._seed_categories()
        self._seed_brands()
        self._seed_products(image_paths)
        self._seed_addresses()
        self._seed_carts()
        self._seed_wishlists()
        self._seed_orders()
        self._seed_coupons()
        self._seed_banners()

        self.stdout.write(self.style.SUCCESS("✅  Database seeded successfully!"))

    # ------------------------------------------------------------------
    # CLEAR
    # ------------------------------------------------------------------
    def _clear_data(self):
        from core.models import (
            Banner, Coupon, MpesaTransaction, OrderItem, Order,
            Address, Wishlist, CartItem, Cart, ProductReview,
            ProductVariant, ProductImage, Product, Brand, Category,
            PickupStation, County,
        )
        models_to_clear = [
            Banner, Coupon, MpesaTransaction, OrderItem, Order,
            Address, Wishlist, CartItem, Cart, ProductReview,
            ProductVariant, ProductImage, Product, Brand, Category,
            PickupStation, County,
        ]
        for model in models_to_clear:
            count, _ = model.objects.all().delete()
            self.stdout.write(f"  Deleted {count} {model.__name__} records")
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write("  Cleared non-superuser Users")

    # ------------------------------------------------------------------
    # USERS
    # ------------------------------------------------------------------
    def _seed_users(self):
        from core.models import User as CoreUser

        users_data = [
            ("admin@alibabakenya.co.ke", "admin", "Admin", "User", True, False),
            ("vendor1@alibabakenya.co.ke", "password123", "John", "Kamau", False, True),
            ("vendor2@alibabakenya.co.ke", "password123", "Mary", "Wanjiku", False, True),
            ("customer1@example.com", "password123", "Peter", "Ochieng", False, False),
            ("customer2@example.com", "password123", "Grace", "Muthoni", False, False),
            ("customer3@example.com", "password123", "Daniel", "Kipchoge", False, False),
        ]

        self.users = []
        self.vendors = []

        for email, password, first, last, is_super, is_vendor in users_data:
            if User.objects.filter(email=email).exists():
                u = User.objects.get(email=email)
            else:
                u = User.objects.create_user(
                    username=email.split("@")[0],
                    email=email,
                    password=password,
                    first_name=first,
                    last_name=last,
                    is_superuser=is_super,
                    is_staff=is_super,
                    is_vendor=is_vendor,
                    phone=f"07{random.randint(10000000, 99999999)}",
                )
            self.users.append(u)
            if is_vendor:
                self.vendors.append(u)

        self.stdout.write(f"  ✔ Users: {len(self.users)} created/found")

    # ------------------------------------------------------------------
    # COUNTIES
    # ------------------------------------------------------------------
    def _seed_counties(self):
        from core.models import County

        self.counties = {}
        for name, code in COUNTIES:
            slug = slugify(name)
            obj, _ = County.objects.get_or_create(
                code=code,
                defaults={"name": name, "slug": slug},
            )
            self.counties[name] = obj

        self.stdout.write(f"  ✔ Counties: {len(self.counties)}")

    # ------------------------------------------------------------------
    # PICKUP STATIONS
    # ------------------------------------------------------------------
    def _seed_pickup_stations(self):
        from core.models import PickupStation

        self.stations = []
        for county_name, station_name, address, phone, fee in PICKUP_STATIONS:
            county = self.counties.get(county_name)
            if not county:
                continue
            slug = slugify(f"{county_name}-{station_name}")
            obj, _ = PickupStation.objects.get_or_create(
                slug=slug,
                defaults={
                    "county": county,
                    "name": station_name,
                    "address": address,
                    "phone": phone,
                    "delivery_fee": fee,
                    "is_active": True,
                    "operating_hours": "Mon-Sat 8am-6pm",
                },
            )
            self.stations.append(obj)

        self.stdout.write(f"  ✔ Pickup Stations: {len(self.stations)}")

    # ------------------------------------------------------------------
    # CATEGORIES
    # ------------------------------------------------------------------
    def _seed_categories(self):
        from core.models import Category

        self.categories = {}
        # First pass: top-level
        for name, parent_name, icon in CATEGORIES:
            if parent_name is None:
                slug = slugify(name)
                obj, _ = Category.objects.get_or_create(
                    slug=slug,
                    defaults={
                        "name": name,
                        "icon": icon,
                        "is_active": True,
                        "description": f"Shop the best {name} products in Kenya.",
                        "order": list(dict.fromkeys(
                            n for n, p, _ in CATEGORIES if p is None
                        )).index(name),
                    },
                )
                self.categories[name] = obj

        # Second pass: children
        for name, parent_name, icon in CATEGORIES:
            if parent_name is not None:
                parent = self.categories.get(parent_name)
                slug = slugify(name)
                obj, _ = Category.objects.get_or_create(
                    slug=slug,
                    defaults={
                        "name": name,
                        "parent": parent,
                        "icon": icon,
                        "is_active": True,
                        "description": f"Explore top {name} deals in Kenya.",
                    },
                )
                self.categories[name] = obj

        self.stdout.write(f"  ✔ Categories: {len(self.categories)}")

    # ------------------------------------------------------------------
    # BRANDS
    # ------------------------------------------------------------------
    def _seed_brands(self):
        from core.models import Brand

        self.brands = {}
        for name in BRANDS:
            slug = slugify(name)
            obj, _ = Brand.objects.get_or_create(
                slug=slug,
                defaults={"name": name, "is_active": True},
            )
            self.brands[name] = obj

        self.stdout.write(f"  ✔ Brands: {len(self.brands)}")

    # ------------------------------------------------------------------
    # PRODUCTS
    # ------------------------------------------------------------------
    def _seed_products(self, image_paths):
        from core.models import Product, ProductImage, ProductVariant, ProductReview

        self.products = []
        image_cycle = list(image_paths)  # local copy to cycle through

        for i, (name, cat_name, brand_name, price, orig_price, stock, desc) in enumerate(PRODUCTS):
            category = self.categories.get(cat_name)
            brand = self.brands.get(brand_name)
            seller = random.choice(self.vendors)

            slug_base = slugify(name)
            slug = slug_base
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{slug_base}-{counter}"
                counter += 1

            short_desc = desc[:150] if len(desc) > 150 else desc

            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "category": category,
                    "brand": brand,
                    "seller": seller,
                    "description": desc,
                    "short_description": short_desc,
                    "price": price,
                    "original_price": orig_price,
                    "stock": stock,
                    "is_active": True,
                    "is_featured": i < 8,           # first 8 are featured
                    "is_flash_sale": i in (0, 1, 2, 3),
                    "flash_sale_end": (
                        timezone.now() + timedelta(days=3) if i < 4 else None
                    ),
                    "view_count": random.randint(100, 5000),
                    "sold_count": random.randint(5, 500),
                    "rating_avg": Decimal(str(round(random.uniform(3.5, 5.0), 2))),
                    "rating_count": random.randint(10, 300),
                },
            )

            if created:
                # ---- Attach images ----
                if image_cycle:
                    # Use a different image for each product (cycle if fewer images than products)
                    img_path = image_cycle[i % len(image_cycle)]
                    try:
                        with open(img_path, "rb") as img_file:
                            filename = os.path.basename(img_path)
                            pi = ProductImage(
                                product=product,
                                alt_text=name,
                                is_primary=True,
                                order=0,
                            )
                            pi.image.save(filename, File(img_file), save=True)

                        # Add a second image if we have enough images
                        second_idx = (i + len(PRODUCTS) // 2) % len(image_cycle)
                        with open(image_cycle[second_idx], "rb") as img_file2:
                            filename2 = os.path.basename(image_cycle[second_idx])
                            pi2 = ProductImage(
                                product=product,
                                alt_text=f"{name} - view 2",
                                is_primary=False,
                                order=1,
                            )
                            pi2.image.save(filename2, File(img_file2), save=True)

                    except (IOError, OSError) as e:
                        self.stdout.write(
                            self.style.WARNING(f"    Could not attach image for '{name}': {e}")
                        )

                # ---- Variants (size/color for fashion & shoes) ----
                if cat_name in ("Shoes", "Men's Clothing", "Women's Clothing"):
                    sizes = ["S", "M", "L", "XL"] if "Clothing" in cat_name else ["39", "40", "41", "42", "43", "44"]
                    for size in sizes:
                        ProductVariant.objects.create(
                            product=product,
                            name="Size",
                            value=size,
                            price_adjustment=Decimal("0.00"),
                            stock=random.randint(5, 30),
                        )

                elif cat_name == "Phones & Tablets":
                    for storage in ["64GB", "128GB", "256GB"]:
                        adj = {"64GB": 0, "128GB": 2000, "256GB": 5000}[storage]
                        ProductVariant.objects.create(
                            product=product,
                            name="Storage",
                            value=storage,
                            price_adjustment=Decimal(str(adj)),
                            stock=random.randint(5, 30),
                        )

                # ---- Reviews ----
                customers = [u for u in self.users if not u.is_vendor and not u.is_superuser]
                reviewers = random.sample(customers, min(2, len(customers)))
                review_texts = [
                    "Great product, exactly as described. Fast delivery!",
                    "Very good quality. Would recommend to anyone.",
                    "Good value for money. Works perfectly.",
                    "Excellent! Packaging was great and product is top-notch.",
                    "Decent product. Delivery was a bit slow but overall satisfied.",
                ]
                for reviewer in reviewers:
                    ProductReview.objects.get_or_create(
                        product=product,
                        user=reviewer,
                        defaults={
                            "rating": random.randint(3, 5),
                            "title": "Good product",
                            "body": random.choice(review_texts),
                            "is_verified_purchase": True,
                            "helpful_count": random.randint(0, 20),
                        },
                    )

            self.products.append(product)

        self.stdout.write(f"  ✔ Products: {len(self.products)} (with images & variants)")

    # ------------------------------------------------------------------
    # ADDRESSES
    # ------------------------------------------------------------------
    def _seed_addresses(self):
        from core.models import Address

        customers = [u for u in self.users if not u.is_vendor and not u.is_superuser]
        self.addresses = []

        towns = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]

        for customer in customers:
            county = random.choice(list(self.counties.values()))
            station = random.choice(self.stations) if self.stations else None
            addr, _ = Address.objects.get_or_create(
                user=customer,
                full_name=f"{customer.first_name} {customer.last_name}",
                defaults={
                    "phone": customer.phone or "0700000000",
                    "county": county,
                    "pickup_station": station,
                    "town": random.choice(towns),
                    "street": f"{random.randint(1, 999)} Main Street",
                    "is_default": True,
                },
            )
            self.addresses.append(addr)

        self.stdout.write(f"  ✔ Addresses: {len(self.addresses)}")

    # ------------------------------------------------------------------
    # CARTS
    # ------------------------------------------------------------------
    def _seed_carts(self):
        from core.models import Cart, CartItem

        customers = [u for u in self.users if not u.is_vendor and not u.is_superuser]
        for customer in customers:
            cart, _ = Cart.objects.get_or_create(user=customer)
            if not cart.items.exists():
                sample_products = random.sample(self.products, min(3, len(self.products)))
                for product in sample_products:
                    CartItem.objects.get_or_create(
                        cart=cart,
                        product=product,
                        defaults={"quantity": random.randint(1, 3)},
                    )

        self.stdout.write(f"  ✔ Carts seeded for {len(customers)} customers")

    # ------------------------------------------------------------------
    # WISHLISTS
    # ------------------------------------------------------------------
    def _seed_wishlists(self):
        from core.models import Wishlist

        customers = [u for u in self.users if not u.is_vendor and not u.is_superuser]
        count = 0
        for customer in customers:
            sample = random.sample(self.products, min(5, len(self.products)))
            for product in sample:
                _, created = Wishlist.objects.get_or_create(user=customer, product=product)
                if created:
                    count += 1

        self.stdout.write(f"  ✔ Wishlist items: {count}")

    # ------------------------------------------------------------------
    # ORDERS
    # ------------------------------------------------------------------
    def _seed_orders(self):
        from core.models import Order, OrderItem, MpesaTransaction

        customers = [u for u in self.users if not u.is_vendor and not u.is_superuser]
        statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
        self.orders = []

        for customer in customers:
            addr = self.addresses[customers.index(customer)] if self.addresses else None
            station = random.choice(self.stations) if self.stations else None

            for _ in range(random.randint(1, 3)):
                sample_products = random.sample(self.products, random.randint(1, 4))
                subtotal = sum(p.price * random.randint(1, 2) for p in sample_products)
                delivery_fee = station.delivery_fee if station else Decimal("100.00")
                total = subtotal + delivery_fee

                order_num = "ALB" + "".join(random.choices(string.digits, k=10))
                while Order.objects.filter(order_number=order_num).exists():
                    order_num = "ALB" + "".join(random.choices(string.digits, k=10))

                order = Order.objects.create(
                    order_number=order_num,
                    user=customer,
                    status=random.choice(statuses),
                    shipping_address=addr,
                    pickup_station=station,
                    subtotal=subtotal,
                    delivery_fee=delivery_fee,
                    total=total,
                    estimated_delivery=date.today() + timedelta(days=random.randint(2, 7)),
                )

                for product in sample_products:
                    qty = random.randint(1, 2)
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=product.name,
                        product_sku=product.sku or f"ALB-{str(product.id)[:8].upper()}",
                        quantity=qty,
                        unit_price=product.price,
                        subtotal=product.price * qty,
                    )

                # Mpesa transaction for paid+ orders
                if order.status in ("paid", "processing", "shipped", "delivered"):
                    MpesaTransaction.objects.create(
                        order=order,
                        phone_number=customer.phone or "0712345678",
                        amount=total,
                        merchant_request_id=f"MR-{uuid.uuid4().hex[:12].upper()}",
                        checkout_request_id=f"CR-{uuid.uuid4().hex[:12].upper()}",
                        mpesa_receipt_number=f"QGH{uuid.uuid4().hex[:8].upper()}",
                        result_code="0",
                        result_desc="The service request is processed successfully.",
                        status="success",
                        completed_at=timezone.now(),
                    )

                self.orders.append(order)

        self.stdout.write(f"  ✔ Orders: {len(self.orders)} (with items & Mpesa transactions)")

    # ------------------------------------------------------------------
    # COUPONS
    # ------------------------------------------------------------------
    def _seed_coupons(self):
        from core.models import Coupon

        coupons_data = [
            ("WELCOME10", "percent", Decimal("10"), Decimal("500"), 100, 30),
            ("SAVE500", "fixed", Decimal("500"), Decimal("3000"), 50, 30),
            ("FLASH20", "percent", Decimal("20"), Decimal("1000"), 200, 7),
            ("FREESHIP", "fixed", Decimal("150"), Decimal("0"), None, 60),
            ("NEWUSER25", "percent", Decimal("25"), Decimal("2000"), 30, 14),
        ]

        count = 0
        for code, dtype, value, min_order, max_uses, days_valid in coupons_data:
            _, created = Coupon.objects.get_or_create(
                code=code,
                defaults={
                    "discount_type": dtype,
                    "discount_value": value,
                    "minimum_order": min_order,
                    "max_uses": max_uses,
                    "valid_from": timezone.now(),
                    "valid_to": timezone.now() + timedelta(days=days_valid),
                    "is_active": True,
                },
            )
            if created:
                count += 1

        self.stdout.write(f"  ✔ Coupons: {count} created")

    # ------------------------------------------------------------------
    # BANNERS
    # ------------------------------------------------------------------
    def _seed_banners(self):
        from core.models import Banner

        banners_data = [
            ("Mega Electronics Sale", "Up to 40% off on phones, laptops & TVs", "/shop/?category=electronics", 1),
            ("New Arrivals - Fashion", "Trendy styles for men & women", "/shop/?category=fashion", 2),
            ("Kitchen Essentials", "Equip your kitchen for less", "/shop/?category=home-kitchen", 3),
            ("Flash Sale - Today Only", "Grab deals before they expire!", "/flash-sale/", 4),
            ("Free Delivery Fridays", "Order on Friday & get free delivery", "/shop/", 5),
        ]

        count = 0
        for title, subtitle, link, order in banners_data:
            _, created = Banner.objects.get_or_create(
                title=title,
                defaults={
                    "subtitle": subtitle,
                    "link": link,
                    "order": order,
                    "is_active": True,
                },
            )
            if created:
                count += 1

        self.stdout.write(f"  ✔ Banners: {count} created")