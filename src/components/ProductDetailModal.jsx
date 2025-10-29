import { X, Star, ShoppingCart, Package, Truck, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ProductDetailModal({ product, onClose }) {
  const { userId, accessToken } = useAuth();

  if (!product) return null;

  const merchant = product.merchants?.[0];
  const rating = merchant?.rating || 0;
  const stock = merchant?.stock || 0;

  async function handleAddToCart() {
    if (!userId || !accessToken) {
      alert("User ID missing — please log in again.");
      return;
    }

    if (!merchant) {
      alert("Product does not have merchant data. Please contact support.");
      return;
    }

    try {
      const payload = {
        userId,
        productId: product.id,
        merchantId: merchant.merchant_id,
        price: merchant.price,
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
      onClose();
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
      alert("Failed to add to cart: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Image */}
            <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
              <img
                src={
                  product.imageUrl
                    ? `${import.meta.env.VITE_PRODUCT_SERVICE_URL}${product.imageUrl}`
                    : "https://via.placeholder.com/600x600?text=No+Image"
                }
                alt={product.name}
                className="max-w-full max-h-[500px] object-contain"
                onError={(e) => {
                  console.error("❌ Image failed to load:", e.target.src);
                  e.target.src = "https://via.placeholder.com/600x600?text=Image+Not+Found";
                }}
              />
            </div>

            {/* Right: Details */}
            <div className="flex flex-col">
              {/* Brand */}
              <div className="text-sm text-blue-600 font-medium mb-2">
                {product.brand}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-lg text-gray-600">
                  {rating.toFixed(1)} out of 5
                </span>
              </div>

              {/* Price */}
              {merchant && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{merchant.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    FREE Delivery
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {stock > 0 && stock < 50 && (
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Package size={20} />
                    <span className="font-medium">Only {stock} left in stock - order soon</span>
                  </div>
                )}
                {stock >= 50 && (
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <Package size={20} />
                    <span className="font-medium">In Stock</span>
                  </div>
                )}
                {stock === 0 && (
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <Package size={20} />
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this item</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Attributes */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(product.attributes).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Truck size={20} className="text-blue-600" />
                  <span>Free delivery on orders over ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Shield size={20} className="text-green-600" />
                  <span>1 year warranty included</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              {merchant && stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 text-lg"
                >
                  <ShoppingCart size={24} />
                  Add to Cart
                </button>
              )}
              {stock === 0 && (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-bold py-4 px-6 rounded-lg cursor-not-allowed text-lg"
                >
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

