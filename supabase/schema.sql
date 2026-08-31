-- ============================================================
-- All Available — Supabase PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    subcategories JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    show_in_nav BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100),
    description TEXT,
    short_description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory VARCHAR(255),
    brand VARCHAR(255) DEFAULT 'All Available',
    gender VARCHAR(50) DEFAULT 'unisex',
    material VARCHAR(255),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2),
    cost_price NUMERIC(12, 2),
    discount_percentage INT DEFAULT 0,
    variants JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    allow_whatsapp BOOLEAN DEFAULT true,
    allow_email BOOLEAN DEFAULT true,
    rating NUMERIC(3, 2) DEFAULT 0,
    review_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    seo_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(is_new_arrival);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    cart JSONB DEFAULT '[]'::jsonb,
    wishlist TEXT[] DEFAULT ARRAY[]::TEXT[],
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 4. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) NOT NULL UNIQUE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    guest_info JSONB,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'placed',
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- 7. Website Settings Table (Singleton)
CREATE TABLE IF NOT EXISTS public.website_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'primary',
    site_name VARCHAR(255) DEFAULT 'All Available',
    site_tagline VARCHAR(255) DEFAULT 'Everything You Desire, All Available.',
    logo TEXT,
    favicon TEXT,
    announcement_bar JSONB DEFAULT '{"isActive": true, "messages": ["Free Delivery on Orders Above Rs. 5,000", "New Collection Has Arrived"]}'::jsonb,
    contact JSONB DEFAULT '{"email": "allavailable.shooping@gmail.com", "phone": "+92 306 4538251", "whatsapp": "+92 306 4538251", "address": "Gulberg III, Lahore, Pakistan"}'::jsonb,
    ordering JSONB DEFAULT '{"whatsappNumber": "+923064538251", "orderEmail": "allavailable.shooping@gmail.com", "whatsappDefaultMessage": "", "emailDefaultMessage": ""}'::jsonb,
    social JSONB DEFAULT '{"instagram": "https://instagram.com", "facebook": "https://facebook.com", "whatsapp": "+923064538251"}'::jsonb,
    shipping JSONB DEFAULT '{"freeShippingThreshold": 5000, "standardShippingCost": 200}'::jsonb,
    footer JSONB DEFAULT '{"copyrightText": "© All Available. All Rights Reserved."}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Homepage Sections Table
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    type VARCHAR(100) NOT NULL,
    filter_params JSONB DEFAULT '{}'::jsonb,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    subtitle VARCHAR(255),
    tag VARCHAR(100),
    image_url TEXT NOT NULL,
    link_url TEXT,
    cta_text VARCHAR(100) DEFAULT 'Shop Now',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    discount_type VARCHAR(50) DEFAULT 'percentage',
    discount_value NUMERIC(12, 2) NOT NULL,
    min_order_amount NUMERIC(12, 2) DEFAULT 0,
    max_discount_amount NUMERIC(12, 2),
    usage_limit INT,
    times_used INT DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID,
    admin_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access policies for storefront
CREATE POLICY "Allow public read on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read on reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Allow public read on website_settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read on homepage_sections" ON public.homepage_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read on banners" ON public.banners FOR SELECT USING (is_active = true);

-- Note: Express backend using SUPABASE_SERVICE_ROLE_KEY bypasses RLS safely.
