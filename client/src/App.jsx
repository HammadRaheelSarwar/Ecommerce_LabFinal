import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, GuestRoute, AdminProtectedRoute } from './routes/RouteGuards'
import PublicLayout from './layouts/PublicLayout'

// ─── Public Pages ───────────────────────────────────────────
const HomePage           = lazy(() => import('./pages/HomePage'))
const ShopPage           = lazy(() => import('./pages/ShopPage'))
const ProductPage        = lazy(() => import('./pages/ProductPage'))
const CategoryPage       = lazy(() => import('./pages/CategoryPage'))
const SearchResultsPage  = lazy(() => import('./pages/SearchResultsPage'))
const WishlistPage       = lazy(() => import('./pages/WishlistPage'))
const CartPage           = lazy(() => import('./pages/CartPage'))
const StaticPage         = lazy(() => import('./pages/StaticPage'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'))

// ─── Auth Pages ─────────────────────────────────────────────
const LoginPage          = lazy(() => import('./pages/auth/LoginPage'))
const SignupPage         = lazy(() => import('./pages/auth/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('./pages/auth/ResetPasswordPage'))

// ─── Checkout ───────────────────────────────────────────────
const CheckoutPage            = lazy(() => import('./pages/CheckoutPage'))
const OrderConfirmationPage   = lazy(() => import('./pages/OrderConfirmationPage'))

// ─── Account ────────────────────────────────────────────────
const AccountLayout      = lazy(() => import('./pages/account/AccountLayout'))
const AccountDashboard   = lazy(() => import('./pages/account/AccountDashboard'))
const ProfilePage        = lazy(() => import('./pages/account/ProfilePage'))
const MyOrdersPage       = lazy(() => import('./pages/account/MyOrdersPage'))
const OrderDetailsPage   = lazy(() => import('./pages/account/OrderDetailsPage'))
const AddressesPage      = lazy(() => import('./pages/account/AddressesPage'))
const AccountWishlist    = lazy(() => import('./pages/account/AccountWishlistPage'))

// ─── Admin ──────────────────────────────────────────────────
const AdminLogin         = lazy(() => import('./admin/AdminLogin'))
const AdminLayout        = lazy(() => import('./admin/AdminLayout'))
const AdminDashboard     = lazy(() => import('./admin/pages/Dashboard'))
const AdminProducts      = lazy(() => import('./admin/pages/products/ProductList'))
const AdminProductForm   = lazy(() => import('./admin/pages/products/ProductForm'))
const AdminCategories    = lazy(() => import('./admin/pages/categories/CategoryList'))
const AdminOrders        = lazy(() => import('./admin/pages/orders/OrderList'))
const AdminOrderDetail   = lazy(() => import('./admin/pages/orders/OrderDetail'))
const AdminCustomers     = lazy(() => import('./admin/pages/customers/CustomerList'))
const AdminInventory     = lazy(() => import('./admin/pages/Inventory'))
const AdminCoupons       = lazy(() => import('./admin/pages/Coupons'))
const AdminReviews       = lazy(() => import('./admin/pages/Reviews'))
const AdminBanners       = lazy(() => import('./admin/pages/Banners'))
const AdminContent       = lazy(() => import('./admin/pages/Content'))
const AdminNewsletter    = lazy(() => import('./admin/pages/Newsletter'))
const AdminReports       = lazy(() => import('./admin/pages/Reports'))
const AdminSettings      = lazy(() => import('./admin/pages/Settings'))
const AdminLogs          = lazy(() => import('./admin/pages/ActivityLogs'))

const Loader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ─── Public storefront ─── */}
        <Route element={<PublicLayout />}>
          <Route path="/"             element={<HomePage />} />
          <Route path="/shop"         element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search"       element={<SearchResultsPage />} />
          <Route path="/wishlist"     element={<WishlistPage />} />
          <Route path="/cart"         element={<CartPage />} />
          <Route path="/contact"      element={<StaticPage />} />
          <Route path="/delivery"     element={<StaticPage />} />
          <Route path="/returns"      element={<StaticPage />} />
          <Route path="/privacy"      element={<StaticPage />} />
          <Route path="/terms"        element={<StaticPage />} />
          <Route path="/faqs"         element={<StaticPage />} />

          {/* Auth routes (guests only) */}
          <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup"         element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Auth-gated checkout */}
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

          {/* Account section */}
          <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
            <Route index element={<AccountDashboard />} />
            <Route path="profile"       element={<ProfilePage />} />
            <Route path="orders"        element={<MyOrdersPage />} />
            <Route path="orders/:id"    element={<OrderDetailsPage />} />
            <Route path="addresses"     element={<AddressesPage />} />
            <Route path="wishlist"      element={<AccountWishlist />} />
          </Route>
        </Route>

        {/* ─── Admin panel ─── (no PublicLayout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index                  element={<AdminDashboard />} />
          <Route path="products"        element={<AdminProducts />} />
          <Route path="products/new"    element={<AdminProductForm />} />
          <Route path="products/:id"    element={<AdminProductForm />} />
          <Route path="categories"      element={<AdminCategories />} />
          <Route path="orders"          element={<AdminOrders />} />
          <Route path="orders/:id"      element={<AdminOrderDetail />} />
          <Route path="customers"       element={<AdminCustomers />} />
          <Route path="inventory"       element={<AdminInventory />} />
          <Route path="coupons"         element={<AdminCoupons />} />
          <Route path="reviews"         element={<AdminReviews />} />
          <Route path="banners"         element={<AdminBanners />} />
          <Route path="content"         element={<AdminContent />} />
          <Route path="newsletter"      element={<AdminNewsletter />} />
          <Route path="reports"         element={<AdminReports />} />
          <Route path="settings"        element={<AdminSettings />} />
          <Route path="logs"            element={<AdminLogs />} />
        </Route>

        {/* ─── 404 ─── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
