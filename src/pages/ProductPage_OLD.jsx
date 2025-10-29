import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { ChevronRight, TrendingUp, Zap, Gift } from "lucide-react";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  console.log("🧩 Product service URL =", import.meta.env.VITE_PRODUCT_SERVICE_URL);

  // 🧠 Fetch products
  useEffect(() => {
    fetchProducts();
  }, [category]);

async function fetchProducts() {
  try {
    const url = `${import.meta.env.VITE_PRODUCT_SERVICE_URL}/products${
      category ? `?category=${category}` : ""
    }`;
    console.log("🌐 Fetching from:", url);
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ Products fetched:", data);
    setProducts(data);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
  }
}



  // 🔍 Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // 🛒 Add to cart
  async function handleAddToCart(product) {
    if (!accessToken) {
      alert("Please log in to add items to cart.");
      return;
    }

    if (role !== "END_USER") {
      alert("Only END_USER can add products to cart.");
      return;
    }

    if (!userId) {
      alert("User ID missing — please log in again.");
      return;
    }

    // ✅ Use merchant_id (with underscore) from backend
    const merchant = product.merchants?.[0] || {
      merchant_id: product.merchant_id || product.merchantId, // fallback
      price: product.price || 0,
    };

    if (merchant.merchant_id === undefined && merchant.merchant_id === null) {
      alert("⚠ Product does not have merchant data — check product data.");
      return;
    }

    const body = {
      userId,
      productId: product.id,
      merchantId: merchant.merchant_id, // ✅ Use merchant_id from backend
      quantity: 1,
      price: merchant.price,
    };
    console.log("🧾 Sending to backend:", body);
    try {
      const res = await checkoutAPI.post("/cart/add", body);
      console.log("✅ Added to cart:", res.data);
      alert("✅ Product added to cart!");
    } catch (err) {
        console.error("❌ Add to cart failed:");
        console.error("➡️ Status:", err.response?.status);
        console.error("➡️ Data:", err.response?.data);
        console.error("➡️ Headers:", err.response?.headers);
        alert(err.response?.data?.error || "Failed to add to cart.");
      }

  }

  // 🧮 Filtering + Pagination
  const filteredProducts = products.filter((p) =>
    [p.name, p.brand, p.category].some((f) =>
      f?.toLowerCase().includes(searchTerm)
    )
  );

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // 🧩 Render UI
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 🔍 Search & Category */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1 border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">All Categories</option>
            <option value="Mobiles">Mobiles</option>
            <option value="Laptops">Laptops</option>
            <option value="Clothes">Clothes</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>

        {/* 🛍 Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-48 w-full object-contain mb-3"
              />
              <h3 className="font-semibold text-gray-800 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">{product.brand}</p>
              <p className="text-lg font-bold text-amber-600 mt-auto">
                ₹{product.merchants?.[0]?.price ?? "N/A"}
              </p>
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold py-1 rounded transition"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* ⏩ Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === i + 1
                    ? "bg-amber-400 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
