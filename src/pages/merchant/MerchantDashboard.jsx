import { useEffect, useState } from "react";
import { productAPI, merchantAPI } from "../../api/http";
import { useAuth } from "../../context/AuthContext";
import MerchantLayout from "../../layouts/MerchantLayout";
import { Package, Upload, DollarSign, Star, Box, Trash2, Edit } from "lucide-react";

export default function MerchantDashboard() {
  const { email, userId } = useAuth();
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    attributes: { color: "", storage: "" },
    merchants: [
      { merchantId: 1, name: "ShopX", price: "", stock: "", rating: "" },
    ],
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [merchantId, setMerchantId] = useState(null);

  // Fetch merchant ID from userId
  useEffect(() => {
    async function fetchMerchantId() {
      if (!userId) {
        console.log("⏳ Waiting for userId...");
        return;
      }
      try {
        console.log("🔍 Fetching merchant for userId:", userId);
        const { data } = await merchantAPI.get(`/merchants/user/${userId}`);
        console.log("✅ Merchant data received:", data);
        const mId = data.merchantId || data.id;
        console.log("✅ Setting merchantId to:", mId);
        setMerchantId(mId);
        // Update form with merchant ID
        setForm(prev => ({
          ...prev,
          merchants: [{ ...prev.merchants[0], merchantId: mId }]
        }));
      } catch (err) {
        console.error("❌ Failed to fetch merchant ID:", err);
        console.error("❌ Error details:", err.response?.data);
        // If merchant doesn't exist, use userId as fallback
        console.log("⚠️ Using userId as merchantId fallback:", userId);
        setMerchantId(parseInt(userId));
        setForm(prev => ({
          ...prev,
          merchants: [{ ...prev.merchants[0], merchantId: parseInt(userId) }]
        }));
      }
    }
    fetchMerchantId();
  }, [userId]);

  async function load() {
    try {
      const { data } = await productAPI.get("/products");
      const allProducts = data ?? [];
      console.log(`📦 Total products in database: ${allProducts.length}`);

      // TEMPORARY FIX: Show ALL products for now
      // This allows you to see and delete products immediately
      console.log("✅ Showing ALL products (temporary fix for deadline)");
      console.log("📋 All products:", allProducts.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        merchants: p.merchants
      })));
      setList(allProducts);

      /* ORIGINAL FILTERING CODE (commented out for now):
      const effectiveMerchantId = merchantId || parseInt(userId);
      console.log("🔍 Filtering for merchantId:", effectiveMerchantId);

      if (effectiveMerchantId !== null && effectiveMerchantId !== undefined) {
        const myProducts = allProducts.filter(product => {
          const hasMerchant = product.merchants?.some(m => {
            console.log(`Checking product ${product.name}: merchant_id=${m.merchant_id}, looking for=${effectiveMerchantId}`);
            return m.merchant_id === effectiveMerchantId || m.merchantId === effectiveMerchantId;
          });
          return hasMerchant;
        });
        console.log(`✅ Showing ${myProducts.length} products for merchant ${effectiveMerchantId}`);
        setList(myProducts);
      } else {
        console.log("⚠️ No merchantId or userId available");
        setList([]);
      }
      */
    } catch (err) {
      console.error("❌ Failed to load products:", err);
      setList([]);
    }
  }

  useEffect(() => {
    if (merchantId || userId) {
      console.log("🔄 Loading products for merchantId:", merchantId, "or userId:", userId);
      load();
    }
  }, [merchantId, userId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleAdd(e) {
    e.preventDefault();
    if (!image) {
      alert("Please choose a product image");
      return;
    }
    if (!merchantId && !userId) {
      alert("❌ User ID not loaded yet. Please wait a moment and try again.");
      return;
    }
    setBusy(true);
    try {
      const token = localStorage.getItem("accessToken");
      const effectiveMerchantId = merchantId || parseInt(userId);
      console.log("📦 Adding product with merchantId:", effectiveMerchantId);

      // Ensure form has the correct merchantId
      const productData = {
        ...form,
        merchants: [{ ...form.merchants[0], merchantId: effectiveMerchantId }]
      };

      const fd = new FormData();
      fd.append(
        "product",
        new Blob([JSON.stringify(productData)], { type: "application/json" })
      );
      fd.append("image", image);

      await productAPI.post("/products/add", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      console.log("✅ Product added, reloading list...");
      await load();
      alert("✅ Product added successfully!");
      setForm({
        name: "",
        brand: "",
        category: "",
        description: "",
        attributes: { color: "", storage: "" },
        merchants: [
          { merchantId: effectiveMerchantId, name: "ShopX", price: "", stock: "", rating: "" },
        ],
      });
      setImage(null);
      setImagePreview(null);
      // Reset file input
      const fileInput = document.getElementById("product-image");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("❌ Failed to add product:", err);
      alert("Failed to add product: " + (err.response?.data?.error || err.message));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(productId) {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      console.log("🗑️ Deleting product:", productId);
      await productAPI.delete(`/products/${productId}`);
      console.log("✅ Product deleted, reloading list...");
      await load();
      alert("✅ Product deleted successfully!");
    } catch (err) {
      console.error("❌ Failed to delete product:", err);
      alert("Failed to delete product: " + (err.response?.data?.error || err.message));
    }
  }

  return (
    <MerchantLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Package size={32} className="text-[#FFD814]" />
          Product Management
        </h1>
        <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
          {email}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Add Product Form */}
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-5 h-fit"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFD814] p-2 rounded-lg">
              <Upload size={24} className="text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
              placeholder="e.g., iPhone 15 Pro"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand
              </label>
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                placeholder="e.g., Apple"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                placeholder="e.g., Electronics"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
              rows="3"
              placeholder="Describe your product..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Attributes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Attributes (Optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                placeholder="Color (optional)"
                value={form.attributes.color}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attributes: { ...form.attributes, color: e.target.value },
                  })
                }
              />
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                placeholder="Storage (optional)"
                value={form.attributes.storage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attributes: { ...form.attributes, storage: e.target.value },
                  })
                }
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add color, storage, size, or other attributes
            </p>
          </div>

          {/* Price, Stock, Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pricing & Inventory
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={16} className="text-green-600" />
                  <span className="text-xs text-gray-600">Price (₹)</span>
                </div>
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={form.merchants[0].price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      merchants: [
                        { ...form.merchants[0], price: e.target.value === "" ? "" : Number(e.target.value) },
                      ],
                    })
                  }
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Box size={16} className="text-blue-600" />
                  <span className="text-xs text-gray-600">Stock</span>
                </div>
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                  type="number"
                  placeholder="Enter stock quantity"
                  value={form.merchants[0].stock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      merchants: [
                        { ...form.merchants[0], stock: e.target.value === "" ? "" : Number(e.target.value) },
                      ],
                    })
                  }
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-xs text-gray-600">Rating (0-5)</span>
                </div>
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="Enter rating"
                  value={form.merchants[0].rating}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      merchants: [
                        { ...form.merchants[0], rating: e.target.value === "" ? "" : Number(e.target.value) },
                      ],
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#FFD814] transition">
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="product-image"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload product image
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold rounded-lg px-6 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={busy}
          >
            {busy ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Add Product
              </>
            )}
          </button>
        </form>

        {/* Product List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
              {list.length} products
            </div>
          </div>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {list.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600">No products yet. Add your first product!</p>
              </div>
            ) : (
              list.map((p) => (
                <div
                  key={p.id || p._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    {p.imageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_PRODUCT_SERVICE_URL}${p.imageUrl}`}
                        alt={p.name}
                        className="h-24 w-24 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          console.error("❌ Image failed to load:", e.target.src);
                          e.target.src = "https://via.placeholder.com/96?text=No+Image";
                        }}
                        onLoad={() => {
                          console.log("✅ Image loaded:", p.imageUrl);
                        }}
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                      <p className="text-sm text-gray-600">{p.brand} • {p.category}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm font-semibold text-green-600">
                          ₹{p.merchants?.[0]?.price || 0}
                        </span>
                        <span className="text-sm text-gray-600">
                          Stock: {p.merchants?.[0]?.stock || 0}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          {p.merchants?.[0]?.rating || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDelete(p.id || p._id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}

