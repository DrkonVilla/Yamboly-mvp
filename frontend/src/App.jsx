import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';

// Layout
import { Navbar } from './components/Navbar';

// Páginas
import { HomePage } from './pages/HomePage';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';

import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminPurchaseOrders } from './pages/admin/AdminPurchaseOrders';
import { AdminStock } from './pages/admin/AdminStock';
import { AdminSuppliers } from './pages/admin/AdminSuppliers';
import { AdminSupplies } from './pages/admin/AdminSupplies';

import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderOrders } from './pages/provider/ProviderOrders';
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
            <Route path="stock" element={<AdminStock />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="supplies" element={<AdminSupplies />} />
          </Route>
          
          <Route path="/provider" element={<AdminLayout />}>
            <Route index element={<ProviderDashboard />} />
            <Route path="orders" element={<ProviderOrders />} />
          </Route>
        </Routes>
      </main>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;