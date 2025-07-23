"use client";
import React, { useState } from "react";
import {
  useGetMyOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "@/app/services/apis/ordersApi";
import { useGetProductsQuery } from "@/app/services/apis/ProductsApi";
import {
  useGetCustomersQuery,
} from "@/app/services/apis/customersApi";
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

// Modern Product Card
const ProductCard = ({ product, selectedLine, onAdd, onRemove, onQtyChange }) => (
  <div className={`relative border-2 rounded-3xl p-6 transition-all duration-300 cursor-pointer group ${
    selectedLine
      ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg"
      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
  }`}>
    {/* Selected Badge */}
    {selectedLine && (
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white text-sm font-bold">✓</span>
      </div>
    )}

    {/* Product Image Placeholder */}
    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <span className="text-white text-2xl font-bold">{product.title.charAt(0)}</span>
    </div>

    {/* Product Info */}
    <div className="text-center">
      <h3 className="font-bold text-lg text-gray-900 mb-1">{product.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-2xl font-bold text-green-600">{product.price}</span>
        <span className="text-gray-500">EGP</span>
      </div>
      
      {/* Stock Status */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-4 ${
        product.qty === 0 
          ? "bg-red-100 text-red-700"
          : product.qty < 10
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}>
        📦 {product.qty} in stock
      </div>

      {/* Quantity and Actions */}
      <div className="flex items-center justify-center gap-3">
        {selectedLine ? (
          <>
            <button
              type="button"
              onClick={() => onQtyChange(Math.max(1, selectedLine.qty - 1))}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={product.qty}
              value={selectedLine.qty}
              onChange={(e) => onQtyChange(Number(e.target.value))}
              className="w-16 text-center border border-gray-300 rounded-lg py-1 font-bold"
            />
            <button
              type="button"
              onClick={() => onQtyChange(Math.min(product.qty, selectedLine.qty + 1))}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              +
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="ml-2 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
            >
              ×
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={product.qty === 0}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.qty === 0 ? "Out of Stock" : "Add to Order"}
          </button>
        )}
      </div>
    </div>
  </div>
);

const MyOrdersPage = () => {
  const { data: orders, isLoading, isError } = useGetMyOrdersQuery();
  const { data: products } = useGetProductsQuery();
  const { data: customers } = useGetCustomersQuery();
  const { data: currentUser } = useGetCurrentUserQuery();

  const [createOrder, { isLoading: creating }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: updating }] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [form, setForm] = useState({ customerId: "", lines: [], note: "" });
  const [searchTerm, setSearchTerm] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.customerId) {
      toast.error("Please select a customer");
      return;
    }
    
    if (form.lines.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    try {
      if (editOrder) {
        await updateOrder({ id: editOrder._id, ...form }).unwrap();
        toast.success("Order updated successfully! 🎉");
      } else {
        await createOrder(form).unwrap();
        toast.success("Order created successfully! 🎉");
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err?.data?.message || "Error processing order");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id).unwrap();
      toast.success("Order deleted successfully!");
    } catch (err) {
      toast.error(err?.data?.message || "Error deleting order");
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditOrder(null);
    setForm({ customerId: "", lines: [], note: "" });
    setSearchTerm("");
  };

  // Handle edit order
  const handleEditOrder = (order) => {
    setEditOrder(order);
    setForm({
      customerId: order.customerId,
      lines: order.lines.map(line => ({
        productId: line.productId._id,
        qty: line.qty
      })),
      note: order.note || ""
    });
    setShowModal(true);
  };

  // Product management functions
  const addProduct = (productId) => {
    setForm(f => ({
      ...f,
      lines: [...f.lines, { productId, qty: 1 }]
    }));
  };

  const removeProduct = (productId) => {
    setForm(f => ({
      ...f,
      lines: f.lines.filter(l => l.productId !== productId)
    }));
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) return;
    setForm(f => ({
      ...f,
      lines: f.lines.map(l =>
        l.productId === productId ? { ...l, qty } : l
      )
    }));
  };

  // Filter products based on search
  const filteredProducts = products?.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const confirmedOrders = orders?.filter(o => o.status === "confirmed").length || 0;
  const shippedOrders = orders?.filter(o => o.status === "shipped").length || 0;

  if (isLoading) return <Loading />;
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
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-black">
      <Aside userRole={currentUser?.role} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🛒 My Orders
              </h1>
              <p className="text-gray-600 mt-1">Manage your sales orders efficiently</p>
            </div>
            <button
              onClick={() => {
                setShowModal(true);
                setEditOrder(null);
                setForm({ customerId: "", lines: [], note: "" });
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              New Order
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Orders"
              value={totalOrders}
              icon="📊"
              gradient="from-blue-500 to-indigo-600"
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
              gradient="from-purple-500 to-pink-600"
            />
          </div>

          {/* Orders Table */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800">Your Orders</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders?.map((order, index) => (
                    <tr
                      key={order._id}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : order.status === "confirmed"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                          {order.status === "pending" && "⏳ "}
                          {order.status === "confirmed" && "✅ "}
                          {order.status === "shipped" && "🚚 "}
                          {order.status === "cancelled" && "❌ "}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
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
                        {order.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <span>✏️</span>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(order._id)}
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              <span>🗑️</span>
                              Delete
                            </button>
                          </div>
                        )}
                        {order.status !== "pending" && (
                          <div className="text-xs text-gray-400">
                            {order.status === "confirmed" ? "✅ Confirmed" : 
                             order.status === "shipped" ? "🚚 Shipped" : 
                             "❌ Cancelled"}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {orders?.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-blue-400 text-5xl">🛒</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Start creating your first order by clicking the "New Order" button above.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Create Your First Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">🛒</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editOrder ? "Edit Order" : "Create New Order"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {editOrder ? "Update your existing order" : "Add products and select a customer"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Left Panel - Customer & Summary */}
              <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Select Customer *
                    </label>
                    <select
                      required
                      value={form.customerId}
                      onChange={(e) => setForm(f => ({ ...f, customerId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    >
                      <option value="">Choose a customer...</option>
                      {customers?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Products Summary */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Selected Products ({form.lines.length})
                    </label>
                    <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                      {form.lines.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No products selected</p>
                      ) : (
                        <div className="space-y-3">
                          {form.lines.map((line) => {
                            const prod = products?.find(p => p._id === line.productId);
                            return (
                              <div key={line.productId} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                <div>
                                  <div className="font-medium text-gray-900">{prod?.title}</div>
                                  <div className="text-sm text-gray-500">
                                    {prod?.price} EGP × {line.qty} = {(prod?.price * line.qty)} EGP
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeProduct(line.productId)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                          {/* Total */}
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center font-bold text-lg">
                              <span>Total:</span>
                              <span className="text-green-600">
                                {form.lines.reduce((total, line) => {
                                  const prod = products?.find(p => p._id === line.productId);
                                  return total + (prod?.price || 0) * line.qty;
                                }, 0)} EGP
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Order Note
                    </label>
                    <textarea
                      rows={4}
                      value={form.note}
                      onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      placeholder="Add any special instructions or notes..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || updating || !form.customerId || form.lines.length === 0}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium shadow-lg transform hover:scale-105"
                    >
                      {creating || updating ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {editOrder ? "Updating..." : "Creating..."}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>{editOrder ? "💾" : "✨"}</span>
                          {editOrder ? "Update Order" : "Create Order"}
                        </div>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Panel - Products Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products by name or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-xl">🔍</span>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const selectedLine = form.lines.find(l => l.productId === product._id);
                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        selectedLine={selectedLine}
                        onAdd={() => addProduct(product._id)}
                        onRemove={() => removeProduct(product._id)}
                        onQtyChange={(qty) => updateQuantity(product._id, qty)}
                      />
                    );
                  })}
                </div>

                {/* No Products Found */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-4xl">📦</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? "Try adjusting your search terms" : "No products available"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;