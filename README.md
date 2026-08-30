# All Available — Luxury E-Commerce Platform

> **"Everything You Desire, All Available."**

A modern, high-end MERN stack e-commerce web platform designed with an editorial **Deep Black + Radiant Gold** aesthetic (`#050505`, `#0D0D0D`, `#D4AF37`). Built for fashion, lifestyle, luxury watches, fine fragrances, jewelry, and accessories.

---

## Key Highlights

- **Aesthetic Excellence**: Black + Gold palette, Cormorant Garamond editorial serif headers, Manrope sans-serif body, smooth parallax hero, marquee announcements, micro-interactions, and glassmorphism.
- **Account-Based Checkout**: Guest browsing with persistent localStorage cart & wishlist. Logging in or signing up seamlessly merges guest items into the MongoDB account with zero cart loss.
- **Dedicated Dual Authentication**:
  - **Customers**: Standard JWT (`aa_token`) protecting checkout, profile, addresses, order history, and order placement.
  - **Admins**: Isolated secret JWT (`aa_admin_token` & `X-Admin-Authorization`) protecting `/admin/*` operations.
  - **Hidden Admin Panel**: The public website contains **zero links** to the admin dashboard.
- **Comprehensive Admin Suite**:
  - **Dashboard**: Real-time sales KPIs, revenue history chart (Recharts), order pipeline breakdown.
  - **Catalog**: Full product CRUD with image uploads, dynamic variant matrix (size/color/stock/SKU), category taxonomy.
  - **Inventory**: Variant-level stock monitoring with out-of-stock and low-stock alerts plus inline quick updates.
  - **Orders**: Status fulfillment pipeline (`new` → `confirmed` → `processing` → `shipped` → `delivered` / `cancelled`), payment toggling, and customer delivery logs.
  - **Promotions & Coupons**: Percentage or fixed discounts with min-order thresholds, usage limits, and expiration dates.
  - **Content Management (CMS)**: Visual banner manager and live homepage section editor (hero, watches, perfumes, signature collections).
  - **Customer Relations**: Newsletter subscriber management with CSV export, customer directory, and review moderation.
  - **System Audit**: Activity logs tracking all admin actions.

---

## Tech Stack

### Frontend (`client/`)
- **React 18** with **Vite**
- **Tailwind CSS** (configured with bespoke luxury tokens: `gold`, `black-surface`, `black-premium`)
- **Framer Motion** (page transitions, drawers, modal animations)
- **Lucide React** (icons)
- **Recharts** (analytics dashboards)
- **React Router v6** (declarative route protection & lazy-loaded bundles)
- **React Hot Toast** (notifications)

### Backend (`server/`)
- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **Dual JWT Authentication** & **Bcrypt.js**
- **Cloudinary** & **Multer** for media storage
- **Rate Limiting**, **Helmet**, **CORS**, and custom sanitization middlewares

---

## Project Structure

```
Ecommerce_LabFinal/
├── package.json               # Root scripts for running client & server
├── .env.example               # Environment variables template
├── client/                    # Vite + React Frontend
│   ├── index.html             # Google fonts & meta setup
│   ├── src/
│   │   ├── admin/             # Admin portal (dashboard, products, orders, CMS, etc.)
│   │   ├── components/        # Layout, Home sections, UI elements (ProductCard, Skeleton)
│   │   ├── context/           # AuthContext, CartContext, WishlistContext, SearchContext
│   │   ├── layouts/           # PublicLayout, AccountLayout, AdminLayout
│   │   ├── pages/             # HomePage, ShopPage, ProductPage, Checkout, Account, etc.
│   │   ├── routes/            # RouteGuards (ProtectedRoute, GuestRoute, AdminProtectedRoute)
│   │   ├── services/          # Axios API clients
│   │   └── index.css          # Design system classes (.btn-gold, .input-luxury, etc.)
└── server/                    # Express + MongoDB Backend
    ├── config/                # Database & Cloudinary config
    ├── controllers/           # Auth, Products, Orders, Categories, Content, Analytics, etc.
    ├── middleware/            # auth, adminAuth, errorHandler, rateLimiter, upload
    ├── models/                # 13 Mongoose schemas
    ├── routes/                # REST endpoints
    ├── seed/                  # Database seeding scripts & mock catalog
    └── server.js              # Entry point
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (local connection or MongoDB Atlas cluster)

### 2. Environment Configuration
Create `.env` in the `server/` directory (refer to `.env.example`):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/all_available

JWT_SECRET=super_secret_jwt_customer_key_12345
ADMIN_JWT_SECRET=super_secret_jwt_admin_key_67890

ADMIN_EMAIL=admin@allavailable.com
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Store SuperAdmin

CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
```

### 3. Database Seeding (Optional but Recommended)
Populate categories, starter luxury products across categories (women, men, watches, perfumes, jewelry, accessories), and the default homepage CMS:

```bash
npm run seed
```

### 4. Running the Development Servers
From the root directory:

```bash
# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

- **Storefront**: [http://localhost:5173](http://localhost:5173)
- **Admin Portal**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
  - Default Admin: `admin@allavailable.com` / `AdminPassword123!`

---

## License
Private / Academic Project. All rights reserved.
