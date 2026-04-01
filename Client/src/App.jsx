import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import useAuthStore from './store/authStore';

// Layouts (eager - needed immediately)
import AdminLayout from './components/AdminLayout';
import StoreLayout from './components/StoreLayout';

// Lazy-loaded pages (code splitting)
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageProducts    = lazy(() => import('./pages/admin/ManageProducts'));
const ManageCategories  = lazy(() => import('./pages/admin/ManageCategories'));
const ManageOrders      = lazy(() => import('./pages/admin/ManageOrders'));
const ManageCoupons     = lazy(() => import('./pages/admin/ManageCoupons'));

const HomePage          = lazy(() => import('./pages/HomePage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const ProductCatalog    = lazy(() => import('./pages/ProductCatalog'));
const ProductDetails    = lazy(() => import('./pages/ProductDetails'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const CheckoutPage      = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage  = lazy(() => import('./pages/OrderSuccessPage'));
const SecretAdminLoginPage = lazy(() => import('./pages/SecretAdminLoginPage'));
const UserProfilePage   = lazy(() => import('./pages/UserProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));

// New placeholder pages
const ContactUsPage     = lazy(() => import('./pages/ContactUsPage'));

// Page Loading Fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
);

const AdminRoute = ({ children }) => {
  const { userInfo } = useAuthStore();
  return userInfo && userInfo.isAdmin ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductCatalog />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          

          <Route path="contact-us" element={<ContactUsPage />} />
        </Route>

        {/* Auth & Other Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/secret-admin-login" element={<SecretAdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/success/:id" element={<OrderSuccessPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="coupons" element={<ManageCoupons />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
