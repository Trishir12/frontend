import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Calendar, Package, ShoppingCart, LogOut, Edit, Save, Phone, MapPin } from "lucide-react";
import axios from "axios";

export default function ProfilePage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadUserInfo();
  }, [userId]);

  async function loadUserInfo() {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${import.meta.env.VITE_USER_SERVICE_URL}/auth/validate`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserInfo(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
    } catch (err) {
      console.error("❌ Failed to load user info:", err);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // Call API to update user profile
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${import.meta.env.VITE_USER_SERVICE_URL}/users/${userId}`,
        {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update userInfo state for instant UI update
      setUserInfo({
        ...userInfo,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      alert("✅ Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Failed to save profile:", err);
      alert("Failed to save profile: " + (err.response?.data?.error || err.message));
      // Reload user info on error
      await loadUserInfo();
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <User size={80} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">{error}</h2>
          <button
            onClick={loadUserInfo}
            className="bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <User size={32} />
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition"
                    placeholder="Enter your address"
                    rows="3"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadUserInfo(); // Reset form data
                    }}
                    disabled={saving}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Name */}
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Full Name</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {userInfo?.name || "Not provided"}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Mail size={24} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Email Address</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {userInfo?.email || "Not provided"}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Phone size={24} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formData.phone || "Not provided"}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <MapPin size={24} className="text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Address</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formData.address || "Not provided"}
                    </div>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Shield size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">User ID</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {userInfo?.userId || userId}
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Shield size={24} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Account Type</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {userInfo?.role === "MERCHANT" ? "Merchant Account" : "Customer Account"}
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Calendar size={24} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Member Since</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <Package size={20} className="text-blue-600" />
                  <span className="font-medium text-gray-900">My Orders</span>
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <ShoppingCart size={20} className="text-green-600" />
                  <span className="font-medium text-gray-900">My Cart</span>
                </button>
                <button
                  onClick={() => navigate("/products")}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <Package size={20} className="text-purple-600" />
                  <span className="font-medium text-gray-900">Browse Products</span>
                </button>
              </div>
            </div>

            {/* Logout Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

