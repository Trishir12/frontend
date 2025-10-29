import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductPage from "./pages/ProductPage";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import AnalyticsPage from "./pages/merchant/AnalyticsPage";
import SettingsPage from "./pages/merchant/SettingsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
      <Route path="/merchant/analytics" element={<AnalyticsPage />} />
      <Route path="/merchant/settings" element={<SettingsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<ProductPage />} />
    </Routes>
  );
}
