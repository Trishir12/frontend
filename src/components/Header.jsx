import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header({ onSearch }) {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const { email, role, logout } = useAuth();

  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="text-xl font-bold cursor-pointer" onClick={()=>nav("/products")}>ShopX</div>
        <div className="flex-1">
          <form onSubmit={e=>{e.preventDefault(); onSearch(q);}}>
            <input
              className="w-full rounded-lg px-3 py-2 text-black"
              placeholder="Search products or categories..."
              value={q} onChange={e=>setQ(e.target.value)}
            />
          </form>
        </div>
        <button className="px-3 py-2 rounded hover:bg-gray-800" onClick={()=>alert("Cart coming soon")}>
          🛒 Cart
        </button>
        <div className="text-sm">
          <div className="font-medium">{email || "Guest"}</div>
          <div className="text-gray-300">{role}</div>
        </div>
        <button className="ml-2 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}

