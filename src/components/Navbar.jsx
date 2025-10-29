import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShoppingCart, User, Package, LogOut, Search, Menu } from "lucide-react";
import { checkoutAPI } from "../api/http";

export default function Navbar() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserId = localStorage.getItem("userId");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.sub || "");
      setRole(payload.role || "");
      setUserId(storedUserId);
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, []);

  // Fetch cart count
  useEffect(() => {
    if (!userId) return;

    async function fetchCartCount() {
      try {
        const res = await checkoutAPI.get(`/cart/get/${userId}`);
        const cartItems = res.data.cartItems || res.data || [];
        setCartCount(cartItems.length);
      } catch (err) {
        console.error("Failed to fetch cart count:", err);
        setCartCount(0);
      }
    }

    fetchCartCount();

    // Poll cart count every 3 seconds to keep it updated
    const interval = setInterval(fetchCartCount, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/products");
    }
  };

  const isLoggedIn = !!email;

  return (
    <nav className="bg-[#131921] text-white sticky top-0 z-50 shadow-lg">
      {/* Top Bar */}
      <div className="px-4 py-2">
        <div className="max-w-[1500px] mx-auto flex items-center gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-1 hover:border border-white px-2 py-1 cursor-pointer transition-all"
            onClick={() => navigate("/")}
          >
            <span className="text-2xl font-bold tracking-tight">ShopHub</span>
            <span className="text-orange-400 text-3xl leading-none">.</span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="flex-1 px-4 py-2.5 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                className="bg-[#FEBD69] hover:bg-[#F3A847] px-6 rounded-r-md transition-colors"
              >
                <Search size={20} className="text-gray-900" />
              </button>
            </div>
          </form>

          {/* Right Side Links */}
          <div className="flex items-center gap-4">
            {/* User Account */}
            {isLoggedIn ? (
              <div
                onClick={() => navigate("/profile")}
                className="hover:border border-white px-2 py-1 cursor-pointer transition-all"
              >
                <div className="text-xs">Hello, {email.split("@")[0]}</div>
                <div className="text-sm font-bold flex items-center gap-1">
                  <User size={16} />
                  Account
                </div>
              </div>
            ) : (
              <div
                onClick={() => navigate("/login")}
                className="hover:border border-white px-2 py-1 cursor-pointer transition-all"
              >
                <div className="text-xs">Hello, Guest</div>
                <div className="text-sm font-bold">Sign In</div>
              </div>
            )}

            {/* Orders */}
            {isLoggedIn && (
              <div
                onClick={() => navigate("/orders")}
                className="hover:border border-white px-2 py-1 cursor-pointer transition-all"
              >
                <div className="text-xs">Returns</div>
                <div className="text-sm font-bold flex items-center gap-1">
                  <Package size={16} />
                  Orders
                </div>
              </div>
            )}

            {/* Cart */}
            <div
              onClick={() => navigate("/cart")}
              className="hover:border border-white px-2 py-1 cursor-pointer transition-all flex items-center gap-2"
            >
              <div className="relative">
                <ShoppingCart size={28} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold mt-3">Cart</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#232F3E] px-4 py-2">
        <div className="max-w-[1500px] mx-auto flex items-center gap-6 text-sm">
          <button className="flex items-center gap-1 hover:border border-white px-2 py-1 transition-all font-medium">
            <Menu size={18} />
            All
          </button>
          <div
            onClick={() => navigate("/products")}
            className="hover:border border-white px-2 py-1 cursor-pointer transition-all"
          >
            Today's Deals
          </div>
          <div
            onClick={() => navigate("/products")}
            className="hover:border border-white px-2 py-1 cursor-pointer transition-all"
          >
            Best Sellers
          </div>
          <div
            onClick={() => navigate("/products")}
            className="hover:border border-white px-2 py-1 cursor-pointer transition-all"
          >
            New Releases
          </div>
          {role === "MERCHANT" && (
            <div
              onClick={() => navigate("/merchant/dashboard")}
              className="hover:border border-white px-2 py-1 cursor-pointer transition-all"
            >
              Merchant Dashboard
            </div>
          )}
          <div className="flex-1"></div>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 hover:border border-white px-2 py-1 transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
