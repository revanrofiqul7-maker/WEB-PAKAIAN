import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { setAuthContext } from './utils/api';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import ProductDetail from './pages/product-detail';
import Cart from './pages/cart';
import Checkout from './pages/checkout';
import Receipt from './pages/receipt';
import './styles/global.css';

// wrap the routing logic in its own component so we can read the 
// auth context _after_ the provider is in place
function AppRoutes() {
  const authContext = React.useContext(AuthContext);
  const { user, token } = authContext;

  // Initialize API context untuk auto-refresh
  React.useEffect(() => {
    setAuthContext(authContext);
  }, [authContext]);

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* redirect already authenticated users away from login/register */}
          <Route
            path="/"
            element={
              token && user ? <Navigate to="/dashboard" /> : <Login />
            }
          />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/products/:id"
            element={<ProtectedRoute><ProductDetail /></ProtectedRoute>}
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="customer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requiredRole="customer">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipt"
            element={
              <ProtectedRoute requiredRole="customer">
                <Receipt />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
