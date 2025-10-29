import { useState, useEffect } from "react";
import MerchantLayout from "../../layouts/MerchantLayout";
import { Settings, User, Mail, Phone, MapPin, Save, Edit2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export default function SettingsPage() {
  const { userId } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    businessDescription: "",
  });

  useEffect(() => {
    loadUserInfo();
  }, [userId]);

  async function loadUserInfo() {
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
        businessName: response.data.businessName || "",
        businessDescription: response.data.businessDescription || "",
      });
    } catch (err) {
      console.error("❌ Failed to load user info:", err);
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

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-xl text-gray-600">Loading settings...</div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings size={32} className="text-[#FFD814]" />
          <h1 className="text-3xl font-bold text-gray-900">Merchant Settings</h1>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] text-gray-900 font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} className="text-[#FFD814]" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your business address"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin size={24} className="text-[#FFD814]" />
              Business Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your business name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Describe your business..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FFD814] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4">
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
          )}
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Summary</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">User ID</div>
                  <div className="font-semibold text-gray-900">{userInfo?.userId || userId}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Mail size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Email</div>
                  <div className="font-semibold text-gray-900 text-sm break-all">
                    {userInfo?.email || "Not provided"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Settings size={20} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-600">Account Type</div>
                  <div className="font-semibold text-gray-900">Merchant</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FFD814] to-[#F7CA00] rounded-xl shadow-md p-6 text-gray-900">
            <h3 className="text-lg font-bold mb-2">💡 Pro Tip</h3>
            <p className="text-sm">
              Keep your profile information up to date to build trust with your customers and improve your sales!
            </p>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
}

