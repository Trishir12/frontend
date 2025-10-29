// src/pages/ProductList.jsx

import { useEffect, useState } from "react";
//import axios from "axios";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { productAPI } from "../api/http";
export default function ProductList() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log("🔍 VITE_PRODUCT_SERVICE_URL =", import.meta.env.VITE_PRODUCT_SERVICE_URL);
  console.log("🔍 productAPI baseURL =", productAPI.defaults.baseURL);


  useEffect(() => {
    async function fetchProducts() {
      try {
       const res = await productAPI.get("/products");
        console.log("✅ Products fetched:", res.data);
        setProducts(res.data || []);
      } catch (err) {
        console.error("❌ Failed to load products:", err);
        setError("Couldn't fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [accessToken]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading products...
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
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-teal-700 mb-6">
          Products
        </h1>

        {products.length === 0 ? (
          <div className="text-gray-600 text-center mt-10 text-lg">
            No products available 😔
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
