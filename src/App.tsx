// src/App.tsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onForegroundMessage } from './services/firebase';
import { Unsubscribe } from 'firebase/messaging';

// ✅ NEW: Modal to guide FB/IG users to open in real browser
import OpenInBrowserModal from './components/OpenInBrowserModal';
import { isFacebookOrInstagramInAppBrowser } from './utils/inAppBrowser';

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
import CompleteProfile from './pages/CompleteProfile';
import ProfilePage from './pages/ProfilePage';
import CustomOrders from './pages/CustomOrders';
import CakeConfigurationManagement from './pages/admin/CakeConfigurationManagement';
import CustomOrdersManagement from './pages/admin/CustomOrdersManagement';
import MyCustomOrders from './pages/MyCustomOrders';
import BreakfastBoxesPage from './pages/BreakfastBoxesPage';

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

      <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
        {/* Header */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Header />} />
        </Routes>

        <main className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/instant" element={<InstantPage />} />
            <Route path="/breakfast" element={<BreakfastBoxesPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes - Require Authentication */}
            <Route
              path="/custom"
              element={
                <ProtectedRoute>
                  <CustomOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-custom-orders"
              element={
                <ProtectedRoute>
                  <MyCustomOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order/:id"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="notifications" replace />} />
              <Route path="notifications" element={<OrderNotifications />} />
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

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <Routes>
          <Route path="/admin/*" element={null} />
          <Route path="*" element={<Footer />} />
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
