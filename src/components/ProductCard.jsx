import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Star, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProductCard({ p, onProductClick }) {
  const { userId, accessToken } = useAuth();
  const [availableStock, setAvailableStock] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(0);

  const merchant = p.merchants?.[0];
  const rating = merchant?.rating || 0;
  const actualStock = merchant?.stock || 0;

  // Fetch cart to calculate available stock
  useEffect(() => {
    async function fetchCartQuantity() {
      if (!userId || !accessToken) {
        setAvailableStock(actualStock);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_CHECKOUT_SERVICE_URL}/cart/get/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const cartItems = res.data.cartItems || res.data || [];

        // Find quantity of this product in cart
        const itemInCart = cartItems.find(
          (item) => item.productId === p.id && item.merchantId === merchant?.merchant_id
        );

        const qtyInCart = itemInCart ? itemInCart.quantity : 0;
        setCartQuantity(qtyInCart);
        setAvailableStock(Math.max(0, actualStock - qtyInCart));
      } catch (err) {
        console.error("❌ Failed to fetch cart for stock calculation:", err);
        setAvailableStock(actualStock);
      }
    }

    fetchCartQuantity();
  }, [userId, accessToken, p.id, merchant?.merchant_id, actualStock]);

  async function handleAddToCart() {
    if (!userId || !accessToken) {
      alert("User ID missing — please log in again.");
      return;
    }

    // Check if merchant data exists
    if (!p.merchants?.[0]) {
      alert("Product does not have merchant data. Please contact support.");
      return;
    }

    if (availableStock <= 0) {
      alert("❌ Not enough stock available!");
      return;
    }

    try {
      const payload = {
        userId, // ✅ required by backend
        productId: p.id,
        merchantId: p.merchants[0].merchant_id, // ✅ Use merchant_id (with underscore)
        price: p.merchants[0].price,
        quantity: 1,
      };

      console.log("🛒 Adding to cart with payload:", payload);

      const res = await axios.post(
        `${import.meta.env.VITE_CHECKOUT_SERVICE_URL}/cart/add`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("✅ Added to cart:", res.data);
      alert("✅ Product added to cart!");

      // Update available stock immediately
      setCartQuantity(cartQuantity + 1);
      setAvailableStock(Math.max(0, availableStock - 1));
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert("❌ Failed to add to cart: " + errorMsg);

      // Refresh cart quantity to sync with backend
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_CHECKOUT_SERVICE_URL}/cart/get/${userId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const cartItems = res.data.cartItems || res.data || [];
        const itemInCart = cartItems.find(
          (item) => item.productId === p.id && item.merchantId === merchant?.merchant_id
        );
        const qtyInCart = itemInCart ? itemInCart.quantity : 0;
        setCartQuantity(qtyInCart);
        setAvailableStock(Math.max(0, actualStock - qtyInCart));
      } catch (refreshErr) {
        console.error("Failed to refresh cart:", refreshErr);
      }
    }
  }

  const stock = availableStock; // Use available stock instead of actual stock

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer" onClick={() => onProductClick && onProductClick(p)}>
      {/* Product Image */}
      <div className="relative bg-gray-50 h-64 flex items-center justify-center overflow-hidden">
        <img
          src={
            p.imageUrl
              ? `${import.meta.env.VITE_PRODUCT_SERVICE_URL}${p.imageUrl}`
              : "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={p.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.error("❌ Image failed to load for product:", p.name);
            console.error("❌ Image URL:", e.target.src);
            console.error("❌ Product imageUrl from DB:", p.imageUrl);
            console.error("❌ VITE_PRODUCT_SERVICE_URL:", import.meta.env.VITE_PRODUCT_SERVICE_URL);
            e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
          }}
          onLoad={() => {
            console.log("✅ Image loaded successfully for:", p.name);
            console.log("✅ Image URL:", `${import.meta.env.VITE_PRODUCT_SERVICE_URL}${p.imageUrl}`);
          }}
        />
        {stock < 10 && stock > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Only {stock} left!
          </div>
        )}
        {stock === 0 && (
          <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {p.brand}
        </div>

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12">
          {p.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < Math.floor(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">
            ({rating.toFixed(1)})
          </span>
        </div>

        {/* Price */}
        {merchant && (
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{merchant.price.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-green-700 font-medium mt-1">
              FREE Delivery
            </div>
          </div>
        )}

        {/* Stock Status */}
        {stock > 0 && stock < 50 && (
          <div className="text-sm text-orange-600 mb-2">
            Only {stock} left in stock
          </div>
        )}
        {stock >= 50 && (
          <div className="text-sm text-green-600 mb-2">In Stock</div>
        )}

        {/* Add to Cart Button */}
        {merchant && stock > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        )}
        {stock === 0 && (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

