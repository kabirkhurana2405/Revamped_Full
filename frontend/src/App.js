import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "@/App.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Landing from "./pages/Landing";
import Catalogue from "./pages/Catalogue";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import ImpactPage from "./pages/ImpactPage";
import TakeBackPage from "./pages/TakeBackPage";
import AssessPage from "./pages/AssessPage";
import RewardsPage from "./pages/RewardsPage";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Products from "./admin/Products";
import ProductForm from "./admin/ProductForm";
import Inventory from "./admin/Inventory";
import Orders from "./admin/Orders";
import Customers from "./admin/Customers";
import TakeBacks from "./admin/TakeBacks";
import Assessments from "./admin/Assessments";
import ImpactAdmin from "./admin/ImpactAdmin";
import Settings from "./admin/Settings";
import { Toaster } from "./components/ui/sonner";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/men" element={<Catalogue gender="men" />} />
            <Route path="/women" element={<Catalogue gender="women" />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/take-back" element={<TakeBackPage />} />
            <Route path="/take-back/assess" element={<AssessPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="takebacks" element={<TakeBacks />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="impact" element={<ImpactAdmin />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Catalogue gender="men" />} />
          </Routes>
          <Toaster position="bottom-center" />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
