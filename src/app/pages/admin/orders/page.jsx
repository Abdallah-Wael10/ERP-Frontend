"use client";
import React, { useState } from "react";
import {
  useGetOrdersQuery,
  useConfirmOrderMutation,
  useCancelOrderMutation,
  useShipOrderMutation,
  useDeleteOrderMutation,
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
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

// Status Badge Component
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
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
          icon: "✅",
        };
      case "shipped":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
      <span className="mr-1">{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrdersAdmin = () => {
  const { data: orders, isLoading, isError } = useGetOrdersQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [confirmOrder, { isLoading: confirming }] = useConfirmOrderMutation();
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation();
  const [shipOrder, { isLoading: shipping }] = useShipOrderMutation();
  const [deleteOrder, { isLoading: deleting }] = useDeleteOrderMutation();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAction = async (type, id, orderNumber) => {
    const confirmMessage = {
      confirm: `Are you sure you want to confirm order #${orderNumber}?`,
      cancel: `Are you sure you want to cancel order #${orderNumber}?`,
      ship: `Are you sure you want to ship order #${orderNumber}?`,
      delete: `Are you sure you want to delete order #${orderNumber}? This action cannot be undone.`,
    };

    if (!window.confirm(confirmMessage[type])) return;

    try {
      if (type === "confirm") {
        await confirmOrder(id).unwrap();
        toast.success("Order confirmed successfully! 🎉");
      }
      if (type === "cancel") {
        await cancelOrder(id).unwrap();
        toast.success("Order cancelled successfully! ❌");
      }
      if (type === "ship") {
        await shipOrder(id).unwrap();
        toast.success("Order shipped successfully! 🚚");
      }
      if (type === "delete") {
        await deleteOrder(id).unwrap();
        toast.success("Order deleted successfully! 🗑️");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Error processing order");
    }
  };

  // Filter and search logic
  const filteredOrders = orders?.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const confirmedOrders = orders?.filter(o => o.status === "confirmed").length || 0;
  const shippedOrders = orders?.filter(o => o.status === "shipped").length || 0;

  if (isLoading || !currentUser) return <Loading />;
  if (isError) return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      <Aside userRole={currentUser?.role} />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to load orders</h2>
          <p className="text-red-500">Please try refreshing the page</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 text-black">
      <Aside userRole={currentUser?.role} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                📋 All Orders Management
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage all system orders</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Orders"
              value={totalOrders}
              icon="📊"
              gradient="from-orange-500 to-amber-600"
            />
            <StatsCard
              title="Pending"
              value={pendingOrders}
              icon="⏳"
              gradient="from-yellow-500 to-orange-500"
            />
            <StatsCard
              title="Confirmed"
              value={confirmedOrders}
              icon="✅"
              gradient="from-green-500 to-emerald-600"
            />
            <StatsCard
              title="Shipped"
              value={shippedOrders}
              icon="🚚"
              gradient="from-blue-500 to-indigo-600"
            />
          </div>

          {/* Filters and Search */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, or sales person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800">
                Orders ({filteredOrders.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-orange-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order._id}
                      className="hover:bg-orange-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">#{order._id.slice(-4)}</span>
                          </div>
                          <span className="font-mono text-sm text-gray-600">#{order._id.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {order.customerId?.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{order.customerId?.name}</div>
                            <div className="text-sm text-gray-500">{order.customerId?.email}</div>
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
                              {order.createdBy?.fullName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{order.createdBy?.fullName}</div>
                            <div className="text-xs text-gray-500">{order.createdBy?.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {/* Confirm & Cancel for salesManager/superadmin on pending orders */}
                          {order.status === "pending" && ["salesManager", "superadmin"].includes(currentUser?.role) && (
                            <>
                              <button
                                onClick={() => handleAction("confirm", order._id, order._id.slice(-6))}
                                disabled={confirming}
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium shadow-sm transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                              >
                                <span>✅</span>
                                {confirming ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => handleAction("cancel", order._id, order._id.slice(-6))}
                                disabled={cancelling}
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-medium shadow-sm transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                              >
                                <span>❌</span>
                                {cancelling ? "..." : "Cancel"}
                              </button>
                            </>
                          )}
                          
                          {/* Ship for inventory/superadmin on confirmed orders */}
                          {order.status === "confirmed" && ["inventory", "superadmin"].includes(currentUser?.role) && (
                            <button
                              onClick={() => handleAction("ship", order._id, order._id.slice(-6))}
                              disabled={shipping}
                              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium shadow-sm transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                            >
                              <span>🚚</span>
                              {shipping ? "..." : "Ship"}
                            </button>
                          )}
                          
                          {/* Delete for superadmin only */}
                          {["superadmin"].includes(currentUser?.role) && (
                            <button
                              onClick={() => handleAction("delete", order._id, order._id.slice(-6))}
                              disabled={deleting}
                              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 font-medium shadow-sm transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                            >
                              <span>🗑️</span>
                              {deleting ? "..." : "Delete"}
                            </button>
                          )}
                          
                          {/* No actions available */}
                          {(
                            (order.status === "pending" && !["salesManager", "superadmin"].includes(currentUser?.role)) ||
                            (order.status === "confirmed" && !["inventory", "superadmin"].includes(currentUser?.role)) ||
                            (["shipped", "cancelled"].includes(order.status) && currentUser?.role !== "superadmin")
                          ) && (
                            <span className="text-xs text-gray-400 italic">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-orange-400 text-5xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || filterStatus !== "all" ? "No matching orders" : "No orders yet"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm || filterStatus !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "Orders will appear here once sales team starts creating them"}
                </p>
                {(searchTerm || filterStatus !== "all") && (
                  <button
                    onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-600 text-white rounded-xl hover:from-orange-600 hover:to-yellow-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersAdmin;