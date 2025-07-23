"use client";
import React, { useState } from "react";
import {
  useGetOrdersByStatusQuery,
  useShipOrderMutation,
} from "@/app/services/apis/ordersApi";
import Loading from "@/app/components/loading/page";
import toast from "react-hot-toast";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import Aside from "@/app/components/aside/page";

// Modern Stats Card
const StatsCard = ({ title, value, icon, gradient }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}
      >
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

// Status Badge Component - Enhanced with all statuses
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          icon: "⏳",
        };
      case "confirmed":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-200",
          icon: "✅",
        };
      case "shipped":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
          icon: "🚚",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          icon: "❌",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: "❓",
        };
    }
  };

  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="mr-1">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Order Card Component for mobile view
const OrderCard = ({ order, onShip, shipping }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            #{order._id.slice(-4)}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            Order #{order._id.slice(-8)}
          </h3>
          <p className="text-sm text-gray-500">Ready for shipping</p>
        </div>
      </div>
      <StatusBadge status={order.status} />
    </div>

    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {order.customerId?.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {order.customerId?.name}
          </div>
          <div className="text-sm text-gray-500">{order.customerId?.email}</div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Products:</p>
        <div className="flex flex-wrap gap-1">
          {order.lines.map((line) => (
            <span
              key={line._id}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {line.productId.title} ×{line.qty}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">
            {order.createdBy?.fullName?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {order.createdBy?.fullName}
          </div>
          <div className="text-xs text-gray-500">{order.createdBy?.role}</div>
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onShip(order._id, order._id.slice(-6))}
        disabled={shipping}
        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
      >
        {shipping ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Shipping...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>🚚</span>
            Ship Order
          </div>
        )}
      </button>
    </div>
  </div>
);

const ShippingAdmin = () => {
  const {
    data: orders,
    isLoading,
    isError,
  } = useGetOrdersByStatusQuery("confirmed");
  const { data: currentUser } = useGetCurrentUserQuery();
  const [shipOrder, { isLoading: shipping }] = useShipOrderMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or cards

  // Role protection
  if (currentUser && !["inventory", "superadmin"].includes(currentUser.role)) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        <Aside userRole={currentUser.role} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-4xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Unauthorized Access
            </h2>
            <p className="text-red-500">
              You do not have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleShip = async (id, orderNumber) => {
    if (!window.confirm(`Are you sure you want to ship order #${orderNumber}?`))
      return;

    try {
      await shipOrder(id).unwrap();
      toast.success("Order shipped successfully! 🚚");
    } catch (err) {
      toast.error(err?.data?.message || "Error shipping order");
    }
  };

  // Filter orders based on search
  const filteredOrders =
    orders?.filter((order) => {
      if (!searchTerm) return true;
      return (
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerId?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.createdBy?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.lines.some((line) =>
          line.productId.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }) || [];

  if (isLoading || !currentUser) return <Loading />;
  if (isError)
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
        <Aside userRole={currentUser?.role} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Failed to load orders
            </h2>
            <p className="text-red-500">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-black">
      <Aside userRole={currentUser?.role} />

      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                🚚 Shipping Management
              </h1>
              <p className="text-gray-600 mt-1">
                Ship confirmed orders to customers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Role: <span className="font-semibold">{currentUser?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Orders to Ship"
              value={filteredOrders.length}
              icon="📦"
              gradient="from-blue-500 to-indigo-600"
            />
            <StatsCard
              title="Total Orders"
              value={orders?.length || 0}
              icon="📊"
              gradient="from-indigo-500 to-purple-600"
            />
            <StatsCard
              title="Ready for Pickup"
              value={filteredOrders.length}
              icon="🚚"
              gradient="from-green-500 to-emerald-600"
            />
          </div>

          {/* Search and View Controls */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    View Mode
                  </label>
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                        viewMode === "table"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      📋 Table
                    </button>
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                        viewMode === "cards"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      🔲 Cards
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Display */}
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onShip={handleShip}
                  shipping={shipping}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/50">
                <h3 className="text-xl font-bold text-gray-800">
                  Orders to Ship ({filteredOrders.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order, index) => (
                      <tr
                        key={order._id}
                        className="hover:bg-blue-50/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                #{order._id.slice(-4)}
                              </span>
                            </div>
                            <span className="font-mono text-sm text-gray-600">
                              #{order._id.slice(-8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {order.customerId?.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {order.customerId?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {order.lines.map((line) => (
                              <span
                                key={line._id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {line.productId.title} ×{line.qty}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {order.createdBy?.fullName
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {order.createdBy?.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.createdBy?.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleShip(order._id, order._id.slice(-6))
                            }
                            disabled={shipping}
                            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                          >
                            {shipping ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Shipping...
                              </>
                            ) : (
                              <>
                                <span>🚚</span>
                                Ship
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-blue-400 text-5xl">🚚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? "No matching orders" : "No orders to ship"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "All confirmed orders have been shipped. New orders will appear here when they're confirmed by the sales manager."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingAdmin;
