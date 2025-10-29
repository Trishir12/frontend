import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { checkoutAPI, productAPI } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { Package, ShoppingBag, Calendar, RefreshCw } from "lucide-react";

export default function OrdersPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productNames, setProductNames] = useState({});

  async function loadOrders() {
    if (!userId) {
      console.log("❌ No userId found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📦 Fetching orders for userId:", userId);
      const response = await checkoutAPI.get(`/orders/${userId}`);
      console.log("✅ Full response:", response);
      console.log("✅ Orders data:", response.data);

      // Handle both array response and empty array
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} orders`);
        setOrders(response.data);
        setError(""); // Clear any previous errors

        // Fetch product names for all order items
        await fetchProductNames(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If single order object, wrap in array
        console.log("✅ Found 1 order (wrapped in array)");
        setOrders([response.data]);
        setError("");

        // Fetch product names for the single order
        await fetchProductNames([response.data]);
      } else {
        console.log("ℹ️ No orders found");
        setOrders([]);
        setError("");
      }
    } catch (err) {
      console.error("❌ Failed to load orders:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);

      // If it's a 404 or empty response, show no orders instead of error
      if (err.response?.status === 404) {
        console.log("ℹ️ 404 - No orders found for this user");
        setOrders([]);
        setError("");
      } else if (err.response?.status === 401) {
        console.log("❌ 401 - Unauthorized, redirecting to login");
        setError("Session expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        console.log("❌ Real error occurred");
        setError("Failed to load orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchProductNames(orders) {
    const names = {};
    for (const order of orders) {
      if (order.items) {
        for (const item of order.items) {
          if (!names[item.productId]) {
            try {
              const res = await productAPI.get(`/products/${item.productId}`);
              names[item.productId] = res.data.name || `Product ${item.productId}`;
            } catch (err) {
              console.error(`Failed to fetch product ${item.productId}:`, err);
              names[item.productId] = `Product ${item.productId}`;
            }
          }
        }
      }
    }
    setProductNames(names);
  }

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const handleRefresh = () => {
    console.log("🔄 Refreshing orders...");
    loadOrders();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl text-gray-600">Loading your orders...</div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Package size={80} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">{error}</h2>
          <button
            onClick={loadOrders}
            className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package size={32} />
            My Orders
          </h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Order #{order.id}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                      </span>
                      <span className="font-medium">
                        Total: ₹{order.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    Order Placed
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Items:</h4>
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {productNames[item.productId] || "Loading..."}
                        </div>
                        <div className="text-sm text-gray-600">Merchant ID: {item.merchantId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">Qty: {item.quantity}</div>
                        <div className="text-sm text-gray-600">₹{item.price?.toFixed(2)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
