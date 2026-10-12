import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import StartOrderPage from "./pages/StartOrderPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";

import AdminPage from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRegisterPage from "./pages/AdminRegisterPage";
import AdminVerifyEmailPage from "./pages/AdminVerifyEmailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/start-order" element={<StartOrderPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/order/:orderNumber"
          element={<OrderTrackingPage />}
        />

        {/* Admin authentication pages */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route
          path="/admin/verify-email"
          element={<AdminVerifyEmailPage />}
        />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
