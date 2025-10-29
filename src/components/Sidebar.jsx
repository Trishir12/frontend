import { Package, BarChart3, Settings, Store, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const { email } = useAuth();
  const navigate = useNavigate();

  const links = [
    {
      to: "/merchant/dashboard",
      label: "Products",
      icon: <Package size={20} />,
      description: "Manage your product inventory"
    },
    {
      to: "/merchant/settings",
      label: "Settings",
      icon: <Settings size={20} />,
      description: "Edit your merchant profile"
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="bg-[#131921] text-white w-64 min-h-screen flex flex-col shadow-xl">
      {/* ShopHub Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Store size={28} className="text-[#FFD814]" />
          <div className="text-2xl font-bold">
            Shop<span className="text-[#FFD814]">Hub</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">Merchant Dashboard</div>
      </div>

      {/* Merchant Info */}
      <div className="p-4 border-b border-gray-700 bg-[#232F3E]">
        <div className="text-xs text-gray-400 mb-1">Logged in as</div>
        <div className="text-sm font-medium truncate">{email || "Merchant"}</div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg transition-all group ${
              pathname === link.to
                ? "bg-[#FFD814] text-gray-900 shadow-lg"
                : "text-gray-300 hover:bg-[#232F3E] hover:text-white"
            }`}
          >
            <div className={`mt-0.5 ${pathname === link.to ? "text-gray-900" : "text-[#FFD814]"}`}>
              {link.icon}
            </div>
            <div className="flex-1">
              <div className={`font-semibold ${pathname === link.to ? "text-gray-900" : "text-white"}`}>
                {link.label}
              </div>
              <div className={`text-xs mt-0.5 ${pathname === link.to ? "text-gray-700" : "text-gray-400"}`}>
                {link.description}
              </div>
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
