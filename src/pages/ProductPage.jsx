import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import { ChevronRight, TrendingUp, Zap, Gift, Tag } from "lucide-react";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [category, setCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [category]);

  async function fetchProducts() {
    try {
      const url = `${import.meta.env.VITE_PRODUCT_SERVICE_URL}/products${
        category ? `?category=${category}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  }

  // Filter products based on search
  const filteredProducts = products.filter((p) =>
    [p.name, p.brand, p.category].some((f) =>
      f?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const categories = [
    { name: "All", value: "", icon: "🏪" },
    { name: "Electronics", value: "Electronics", icon: "📱" },
    { name: "Footwear", value: "Footwear", icon: "👟" },
    { name: "Books", value: "Books", icon: "📚" },
    { name: "Toys", value: "Toys", icon: "🎮" },
    { name: "Accessories", value: "Accessories", icon: "👜" },
    { name: "Watches", value: "Watches", icon: "⌚" },
    { name: "Bags", value: "Bags", icon: "🎒" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-[1500px] mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome to ShopHub</h1>
              <p className="text-xl mb-4">Your one-stop shop for everything you need</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Zap className="text-yellow-300" size={20} />
                  <span>Lightning Deals</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Gift className="text-pink-300" size={20} />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Tag className="text-green-300" size={20} />
                  <span>Best Prices</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop"
                alt="Shopping"
                className="rounded-lg shadow-2xl w-80 h-60 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-[120px] z-40 shadow-sm">
        <div className="max-w-[1500px] mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  category === cat.value
                    ? "bg-[#131921] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1500px] mx-auto px-4 py-8">
        {/* Products Count */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {category
              ? `${categories.find((c) => c.value === category)?.name} Products`
              : "All Products"}
          </h2>
          <span className="text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
          </span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                p={product}
                onProductClick={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer Banner */}
      <div className="bg-[#232F3E] text-white mt-12">
        <div className="max-w-[1500px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About ShopHub</h3>
              <p className="text-gray-300">
                Your trusted online marketplace for quality products at the best prices.
                Shop with confidence and enjoy fast, free delivery.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-white cursor-pointer">About Us</li>
                <li className="hover:text-white cursor-pointer">Contact</li>
                <li className="hover:text-white cursor-pointer">Help Center</li>
                <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-white cursor-pointer">Track Order</li>
                <li className="hover:text-white cursor-pointer">Returns</li>
                <li className="hover:text-white cursor-pointer">Shipping Info</li>
                <li className="hover:text-white cursor-pointer">FAQs</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ShopHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

