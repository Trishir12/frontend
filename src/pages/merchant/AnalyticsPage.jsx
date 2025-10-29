import MerchantLayout from "../../layouts/MerchantLayout";
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react";

export default function AnalyticsPage() {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: "Total Revenue",
      value: "$12,450",
      change: "+12.5%",
      icon: <DollarSign size={24} />,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Products Sold",
      value: "342",
      change: "+8.2%",
      icon: <ShoppingCart size={24} />,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: "48",
      change: "+3",
      icon: <Package size={24} />,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Customers",
      value: "1,234",
      change: "+15.3%",
      icon: <Users size={24} />,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  return (
    <MerchantLayout>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={32} className="text-[#FFD814]" />
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <div className={stat.textColor}>{stat.icon}</div>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <TrendingUp size={16} />
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
        <div className="bg-[#FFD814] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 size={40} className="text-gray-900" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Advanced Analytics Coming Soon
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We're working on bringing you detailed analytics including sales trends, customer insights,
          product performance metrics, and much more. Stay tuned!
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
          <div className="bg-gray-100 px-4 py-2 rounded-lg">📊 Sales Trends</div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">📈 Revenue Charts</div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">🎯 Customer Insights</div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">📦 Product Performance</div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">💰 Profit Margins</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "New order received", time: "2 minutes ago", icon: <ShoppingCart size={18} /> },
            { action: "Product added to inventory", time: "1 hour ago", icon: <Package size={18} /> },
            { action: "Customer review posted", time: "3 hours ago", icon: <Users size={18} /> },
            { action: "Payment received", time: "5 hours ago", icon: <DollarSign size={18} /> },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="bg-[#FFD814] p-2 rounded-lg text-gray-900">
                {activity.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.action}</div>
                <div className="text-sm text-gray-600">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MerchantLayout>
  );
}

