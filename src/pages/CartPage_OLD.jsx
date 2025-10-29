import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { checkoutAPI } from "../api/http"; // ✅ use your API helper

export default function CartPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    if (!userId) return;

    async function fetchCart() {
      try {
        const res = await checkoutAPI.get(`/cart/get/${userId}`);
        const data = res.data.cartItems || res.data || [];
        setCartItems(data);
        calculateSubtotal(data);
      } catch (err) {
        console.error("❌ Failed to load cart items:", err);
        setError("Failed to load cart items");
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [userId]);

  const calculateSubtotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(total);
  };

  // ✅ Use checkoutAPI for update/remove too
  const handleQuantityChange = async (item, newQty) => {
    if (newQty < 1) return;
    try {
      await checkoutAPI.put("/cart/update", { ...item, quantity: newQty });
      const updated = cartItems.map((c) => (c.id === item.id ? { ...c, quantity: newQty } : c));
      setCartItems(updated);
      calculateSubtotal(updated);
    } catch (err) {
      console.error(err);
      alert("Couldn't update quantity");
    }
  };

  const handleRemove = async (item) => {
    try {
      await checkoutAPI.delete("/cart/remove", { data: item });
      const updated = cartItems.filter((c) => c.id !== item.id);
      setCartItems(updated);
      calculateSubtotal(updated);
    } catch (err) {
      console.error(err);
      alert("Couldn't remove item");
    }
  };


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your cart...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold mb-6 text-teal-700">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-gray-600 text-center mt-10 text-lg">
            Your cart is empty 😔
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cart Items List */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-4 items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${import.meta.env.VITE_PRODUCT_SERVICE_URL}${
                        item.imageUrl || "/images/placeholder.png"
                      }`}
                      alt={item.productId}
                      className="h-20 w-20 object-cover rounded-md border"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Product ID: {item.productId}
                      </div>
                      <div className="text-sm text-gray-500">
                        Merchant: {item.merchantId}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() =>
                        handleQuantityChange(item, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() =>
                        handleQuantityChange(item, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemove(item)}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-fit">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Order Summary
              </h2>
              <div className="flex justify-between text-gray-700 mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold text-teal-700">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <button
                className="w-full mt-5 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded transition"
                onClick={() => navigate("/checkout", { state: { cart: cartItems, total: subtotal } })}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
