import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { checkoutAPI, productAPI } from "../api/http";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchCart();

    // Auto-refresh cart every 10 seconds to catch deleted products
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing cart to check for deleted products...");
      fetchCart();
    }, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  async function fetchCart() {
    try {
      console.log(`📦 Fetching cart for userId: ${userId}`);
      const res = await checkoutAPI.get(`/cart/get/${userId}`);
      console.log("Cart API response:", res.data);

      const data = res.data.cartItems || res.data || [];
      console.log(`Found ${data.length} items in cart:`, data);

      setCartItems(data);
      calculateSubtotal(data);

      // Fetch product details (name and image) for all items
      await fetchProductDetails(data);
    } catch (err) {
      console.error("❌ Failed to load cart items:", err);
      console.error("Error details:", err.response?.data);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  }

  async function fetchProductDetails(items) {
    const details = {};
    const itemsToRemove = [];

    for (const item of items) {
      try {
        const res = await productAPI.get(`/products/${item.productId}`);
        details[item.productId] = {
          name: res.data.name || `Product ${item.productId}`,
          imageUrl: res.data.imageUrl || null,
          exists: true,
        };
      } catch (err) {
        console.error(`❌ Product ${item.productId} not found - will auto-remove`, err);
        details[item.productId] = {
          name: `[DELETED] Product ${item.productId}`,
          imageUrl: null,
          exists: false,
        };
        // Mark for auto-removal
        itemsToRemove.push(item);
      }
    }

    setProductDetails(details);

    // Auto-remove deleted products silently
    if (itemsToRemove.length > 0) {
      console.log(`🗑️ Auto-removing ${itemsToRemove.length} deleted products from cart...`);
      console.log("Items to remove:", itemsToRemove);

      // Remove from backend - try different payload formats
      for (const item of itemsToRemove) {
        try {
          console.log(`Attempting to remove item:`, item);
          // Try the remove endpoint with the full item
          await checkoutAPI.delete("/cart/remove", { data: item });
          console.log(`✅ Removed deleted product: ${item.productId}`);
        } catch (err) {
          console.error(`❌ Failed to remove ${item.productId}:`, err.response?.data || err.message);
          // Try alternative: remove by ID
          try {
            await checkoutAPI.delete(`/cart/remove/${item.id}`);
            console.log(`✅ Removed by ID: ${item.id}`);
          } catch (err2) {
            console.error(`❌ Also failed to remove by ID:`, err2.response?.data || err2.message);
          }
        }
      }

      // Update local state immediately
      const updatedItems = items.filter(item =>
        !itemsToRemove.some(removed => removed.id === item.id)
      );
      setCartItems(updatedItems);
      calculateSubtotal(updatedItems);

      console.log(`✅ Cart cleaned: removed ${itemsToRemove.length} deleted products`);
    }
  }

  const calculateSubtotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(total);
  };

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
    console.log("🗑️ Attempting to remove item:", item);

    // Ensure we have all required fields
    const removePayload = {
      userId: item.userId,
      productId: item.productId,
      merchantId: item.merchantId,
      quantity: item.quantity,
      price: item.price
    };

    console.log("📤 Remove payload:", removePayload);

    // Optimistically update UI first
    const updated = cartItems.filter((c) => c.id !== item.id);
    setCartItems(updated);
    calculateSubtotal(updated);

    try {
      // Send remove request to backend
      const response = await checkoutAPI.delete("/cart/remove", { data: removePayload });
      console.log("✅ Item removed successfully from backend:", response.data);
    } catch (err) {
      console.error("❌ Backend remove failed:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error message:", err.response?.data?.message || err.message);

      // If backend fails, revert the UI change
      alert(`Warning: Item removed from display but backend sync failed. Error: ${err.response?.data?.message || err.message}`);

      // Optionally reload cart to sync with backend
      setTimeout(() => {
        console.log("🔄 Reloading cart to sync with backend...");
        fetchCart();
      }, 1000);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/checkout", {
      state: {
        cart: cartItems,
        total: subtotal,
        productDetails: productDetails, // Pass product names and images
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl text-gray-600">Loading your cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-[1500px] mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
                <div className="divide-y">
                  {cartItems.map((item) => {
                    const product = productDetails[item.productId] || {};
                    const imageUrl = product.imageUrl
                      ? `${import.meta.env.VITE_PRODUCT_SERVICE_URL}${product.imageUrl}`
                      : "https://via.placeholder.com/150?text=No+Image";
                    const isDeleted = product.exists === false;

                    // Don't render deleted products (they'll be auto-removed)
                    if (isDeleted) {
                      return null;
                    }

                    return (
                      <div key={item.id} className="py-6 flex gap-6">
                        {/* Product Image */}
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={product.name || "Product"}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error("❌ Cart image failed to load:", imageUrl);
                              e.target.src = "https://via.placeholder.com/150?text=Deleted";
                            }}
                            onLoad={() => {
                              console.log("✅ Cart image loaded:", product.name);
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {product.name || "Loading..."}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">Merchant ID: {item.merchantId}</p>
                          <p className="text-xl font-bold text-gray-900 mb-4">₹{item.price.toFixed(2)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            <Trash2 size={18} />
                            Remove
                          </button>
                        </div>
                      </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-semibold">Subtotal ({cartItems.length} items):</span>
                    <span className="font-bold text-2xl">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (estimated):</span>
                    <span className="font-medium">₹{(subtotal * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>₹{(subtotal * 1.18).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>FREE Delivery</strong> on orders over ₹500
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

