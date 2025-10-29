import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { checkoutAPI } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [placing, setPlacing] = useState(false);

  async function placeOrder() {
    if (!userId) {
      alert("❌ User ID missing. Please log in again.");
      navigate("/login");
      return;
    }

    if (!state || !state.cart || state.cart.length === 0) {
      alert("❌ Cart is empty!");
      navigate("/cart");
      return;
    }

    setPlacing(true);
    try {
      console.log("📦 Placing order with data:", {
        userId,
        totalAmount: state.total,
        items: state.cart
      });

      const { data } = await checkoutAPI.post("/orders/checkout", {
        userId: Number(userId),
        totalAmount: state.total,
        items: state.cart.map(c => ({
          productId: c.productId,
          merchantId: String(c.merchantId),
          quantity: c.quantity,
          price: c.price
        }))
      });

      console.log("✅ Order placed successfully:", data);
      alert("✅ Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      console.error("❌ Checkout failed:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Checkout failed. Please try again.";
      alert(`❌ ${errorMsg}`);
    } finally {
      setPlacing(false);
    }
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6 text-center text-gray-600">Cart is empty!</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4 text-teal-700">Confirm Order</h1>
      <div className="bg-white rounded-lg p-5 shadow-sm">
        <p className="mb-4 text-gray-600">You’re about to place an order for:</p>
        <ul className="space-y-2">
          {state.cart.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>{item.productId} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <hr className="my-4" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{state.total.toFixed(2)}</span>
        </div>
        <button
          onClick={placeOrder}
          disabled={placing}
          className="mt-5 w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </div>
      </div>
    </div>
  );
}
