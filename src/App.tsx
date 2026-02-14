// src/App.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onForegroundMessage } from './services/firebase';
import { Unsubscribe } from 'firebase/messaging';

// ✅ NEW: Modal to guide FB/IG users to open in real browser
import OpenInBrowserModal from './components/OpenInBrowserModal';
import { isFacebookOrInstagramInAppBrowser } from './utils/inAppBrowser';

// ✅ PWA Install Prompt
import InstallPrompt from './components/InstallPrompt';

// Public Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import InstantPage from './pages/InstantPage';
import NotFoundPage from './pages/NotFoundPage';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';

// Admin Pages
import AdminPage from './pages/admin/AdminPage';
import ProductsManagement from './pages/admin/ProductsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import CustomersManagement from './pages/admin/CustomersManagement';
import DiscountCodesManagement from './pages/admin/DiscountCodesManagement';
import ShippingManagement from './pages/admin/ShippingManagement';
import OrderNotifications from './pages/admin/OrderNotifications';
import CustomOrderNotifications from './pages/admin/CustomOrderNotifications';
import CompleteProfile from './pages/CompleteProfile';
import ProfilePage from './pages/ProfilePage';
import CustomOrders from './pages/CustomOrders';
import CakeConfigurationManagement from './pages/admin/CakeConfigurationManagement';
import CustomOrdersManagement from './pages/admin/CustomOrdersManagement';
import MyCustomOrders from './pages/MyCustomOrders';
import BreakfastBoxesPage from './pages/BreakfastBoxesPage';

// ===== Bottom Nav Helper =====
function useNavPageId() {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (pathname === '/' || pathname.startsWith('/product')) return 'home';
    if (pathname.startsWith('/menu')) return 'menu';
    if (pathname.startsWith('/instant')) return 'instant';
    if (pathname.startsWith('/breakfast')) return 'breakfast';
    if (pathname.startsWith('/custom')) return 'custom';
    if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) return 'cart';
    return 'home';
  }, [pathname]);
}

// ===== Public Layout =====
function PublicLayout() {
  const navigate = useNavigate();
  const currentPage = useNavPageId();

  const handleNavigate = (page: string) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'menu':
        navigate('/menu');
        break;
      case 'instant':
        navigate('/instant');
        break;
      case 'breakfast':
        navigate('/breakfast');
        break;
      case 'custom':
        navigate('/custom');
        break;
      case 'cart':
        navigate('/cart');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden" dir="rtl">
      <Header />
      <main className="flex-grow pb-24">
        <Outlet />
      </main>
      <Footer />
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}

// ===== Admin Layout =====
function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Outlet />
    </div>
  );
}

function AppContent() {
  // ✅ NEW: Show the "Open in Browser" modal globally
  const [showOpenInBrowser, setShowOpenInBrowser] = useState(false);

  useEffect(() => {
    if (isFacebookOrInstagramInAppBrowser()) {
      setShowOpenInBrowser(true);
    }
  }, []);

  // Handle foreground notifications
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    // Check for notification support before subscribing
    if ('Notification' in window) {
      unsubscribe = onForegroundMessage((payload) => {
        const { notification } = payload;
        toast.info(
          <div>
            <strong>{notification?.title}</strong>
            <br />
            {notification?.body}
          </div>,
          {
            position: 'top-right',
            autoClose: 6000,
          }
        );
      });
    }

    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <Router>
      {/* ✅ Global modal */}
      <OpenInBrowserModal
        open={showOpenInBrowser}
        onClose={() => setShowOpenInBrowser(false)}
      />

      {/* ✅ PWA Install Prompt */}
      <InstallPrompt />

      <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden" dir="rtl">
        <Routes>
          {/* ===== Admin Routes (Protected) ===== */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route
              path="*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            >
              <Route path="notifications" element={<OrderNotifications />} />
              <Route path="custom-notifications" element={<CustomOrderNotifications />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="customers" element={<CustomersManagement />} />
              <Route path="discounts" element={<DiscountCodesManagement />} />
              <Route path="shipping" element={<ShippingManagement />} />
              <Route
                path="custom-orders-management"
                element={<CustomOrdersManagement />}
              />
              <Route
                path="cake-configuration"
                element={<CakeConfigurationManagement />}
              />
            </Route>
          </Route>

          {/* ===== Public Routes ===== */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="instant" element={<InstantPage />} />
            <Route path="breakfast" element={<BreakfastBoxesPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="login" element={<LoginPage />} />

            {/* Protected Routes - Require Authentication */}
            <Route
              path="custom"
              element={
                <ProtectedRoute>
                  <CustomOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-custom-orders"
              element={
                <ProtectedRoute>
                  <MyCustomOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="order/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

        <ToastContainer />
      </div>
    </Router>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
