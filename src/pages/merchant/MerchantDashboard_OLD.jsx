// import { useEffect, useState } from "react";
// import { productAPI } from "../api/http";
// import { useAuth } from "../context/AuthContext";
//
// export default function MerchantDashboard() {
//   const { email } = useAuth();
//   const [form, setForm] = useState({
//     name: "", brand: "", category: "", description: "",
//     attributes: { color: "", storage: "" },
//     merchants: [{ merchantId: 1, name: "ShopX", price: 0, stock: 0, rating: 0 }],
//   });
//   const [image, setImage] = useState(null);
//   const [list, setList] = useState([]);
//   const [busy, setBusy] = useState(false);
//
//   async function load() {
//     const { data } = await productAPI.get("/products");
//     setList(data ?? []);
//   }
//
//   useEffect(() => { load(); }, []);
//
//   async function handleAdd(e) {
//     e.preventDefault();
//     if (!image) { alert("Choose an image"); return; }
//     setBusy(true);
//     try {
//       const fd = new FormData();
//       fd.append("product", new Blob([JSON.stringify(form)], { type: "application/json" }));
//       fd.append("image", image);
//       await productAPI.post("/products/add", fd, { headers: { "Content-Type": "multipart/form-data" }});
//       await load();
//       alert("Product added!");
//       setForm({ ...form, name: "", brand: "", category: "", description: "" });
//       setImage(null);
//     } finally { setBusy(false); }
//   }
//
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-gray-900 text-white">
//         <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
//           <div className="text-xl font-semibold">Merchant Dashboard</div>
//           <div className="text-sm opacity-80">{email}</div>
//         </div>
//       </div>
//
//       <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8">
//         <form onSubmit={handleAdd} className="bg-white rounded-xl shadow p-5 space-y-3">
//           <div className="text-lg font-semibold mb-2">Add Product</div>
//           <input className="border rounded px-3 py-2 w-full" placeholder="Name"
//             value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
//           <div className="grid grid-cols-2 gap-3">
//             <input className="border rounded px-3 py-2" placeholder="Brand"
//               value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} />
//             <input className="border rounded px-3 py-2" placeholder="Category"
//               value={form.category} onChange={e=>setForm({...form, category:e.target.value})} required />
//           </div>
//           <textarea className="border rounded px-3 py-2 w-full" rows="3" placeholder="Description"
//             value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
//           <div className="grid grid-cols-2 gap-3">
//             <input className="border rounded px-3 py-2" placeholder="Color"
//               value={form.attributes.color}
//               onChange={e=>setForm({...form, attributes:{...form.attributes, color:e.target.value}})} />
//             <input className="border rounded px-3 py-2" placeholder="Storage"
//               value={form.attributes.storage}
//               onChange={e=>setForm({...form, attributes:{...form.attributes, storage:e.target.value}})} />
//           </div>
//           <div className="grid grid-cols-3 gap-3">
//             <input className="border rounded px-3 py-2" type="number" placeholder="Price"
//               value={form.merchants[0].price}
//               onChange={e=>setForm({...form, merchants:[{...form.merchants[0], price:Number(e.target.value)}]})} />
//             <input className="border rounded px-3 py-2" type="number" placeholder="Stock"
//               value={form.merchants[0].stock}
//               onChange={e=>setForm({...form, merchants:[{...form.merchants[0], stock:Number(e.target.value)}]})} />
//             <input className="border rounded px-3 py-2" type="number" placeholder="Rating"
//               value={form.merchants[0].rating}
//               onChange={e=>setForm({...form, merchants:[{...form.merchants[0], rating:Number(e.target.value)}]})} />
//           </div>
//           <input type="file" onChange={e=>setImage(e.target.files?.[0] ?? null)} />
//           <button className="bg-emerald-600 text-white rounded px-4 py-2 mt-2 disabled:opacity-60" disabled={busy}>
//             {busy ? "Uploading..." : "Add Product"}
//           </button>
//         </form>
//
//         <div>
//           <div className="text-lg font-semibold mb-2">All Products</div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {list.map(p => (
//               <div key={p.id || p._id} className="border bg-white rounded p-3">
//                 <div className="font-medium">{p.name}</div>
//                 <div className="text-sm text-gray-600">{p.category}</div>
//                 {p.imageUrl && <img src={p.imageUrl} className="h-28 w-full object-cover rounded mt-2" />}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { productAPI } from "../../api/http";
import { useAuth } from "../../context/AuthContext";
import MerchantLayout from "../../layouts/MerchantLayout";
import { Package, Upload, DollarSign, Star, Box } from "lucide-react";

export default function MerchantDashboard() {
  const { email } = useAuth();
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    attributes: { color: "", storage: "" },
    merchants: [
      { merchantId: 1, name: "ShopX", price: 0, stock: 0, rating: 0 },
    ],
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await productAPI.get("/products");
    setList(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

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
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append(
        "product",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );
      fd.append("image", image);
      await productAPI.post("/products/add", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await load();
      alert("✅ Product added successfully!");
      setForm({
        name: "",
        brand: "",
        category: "",
        description: "",
        attributes: { color: "", storage: "" },
        merchants: [
          { merchantId: 1, name: "ShopX", price: 0, stock: 0, rating: 0 },
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

  return (
    <MerchantLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-teal-700">Products</h1>
        <div className="text-sm text-gray-500">{email}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3"
        >
          <div className="text-lg font-semibold mb-2">Add Product</div>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows="3"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="Color"
              value={form.attributes.color}
              onChange={(e) =>
                setForm({
                  ...form,
                  attributes: { ...form.attributes, color: e.target.value },
                })
              }
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Storage"
              value={form.attributes.storage}
              onChange={(e) =>
                setForm({
                  ...form,
                  attributes: { ...form.attributes, storage: e.target.value },
                })
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="Price"
              value={form.merchants[0].price}
              onChange={(e) =>
                setForm({
                  ...form,
                  merchants: [
                    { ...form.merchants[0], price: Number(e.target.value) },
                  ],
                })
              }
            />
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="Stock"
              value={form.merchants[0].stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  merchants: [
                    { ...form.merchants[0], stock: Number(e.target.value) },
                  ],
                })
              }
            />
            <input
              className="border rounded px-3 py-2"
              type="number"
              placeholder="Rating"
              value={form.merchants[0].rating}
              onChange={(e) =>
                setForm({
                  ...form,
                  merchants: [
                    { ...form.merchants[0], rating: Number(e.target.value) },
                  ],
                })
              }
            />
          </div>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
          <button
            className="bg-teal-600 text-white rounded px-4 py-2 mt-2 disabled:opacity-60 hover:bg-teal-700 transition"
            disabled={busy}
          >
            {busy ? "Uploading..." : "Add Product"}
          </button>
        </form>

        <div>
          <div className="text-lg font-semibold mb-2">All Products</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map((p) => (
              <div
                key={p.id || p._id}
                className="border bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition"
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.category}</div>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    className="h-28 w-full object-cover rounded mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}
