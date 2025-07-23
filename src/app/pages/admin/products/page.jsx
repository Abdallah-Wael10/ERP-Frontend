"use client";
import React, { useState } from "react";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useReduceProductQuantityMutation,
} from "@/app/services/apis/ProductsApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import Loading from "@/app/components/loading/page";
import toast from "react-hot-toast";
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

// Product Card Component
const ProductCard = ({ product, onEdit, onReduce, onDelete }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
          <span className="text-white text-lg font-bold">{product.title.charAt(0)}</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">{product.title}</h3>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
        product.qty === 0
          ? "bg-red-100 text-red-700"
          : product.qty < 10
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}>
        📦 {product.qty} in stock
      </div>
    </div>
    
    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
    
    <div className="flex items-center justify-between mb-4">
      <div className="text-2xl font-bold text-green-600">{product.price} EGP</div>
      <div className="text-xs text-gray-500">
        By: {product.createdBy?.fullName || "Unknown"}
      </div>
    </div>
    
    <div className="flex gap-2">
      <button
        onClick={() => onEdit(product)}
        className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
      >
        ✏️ Edit
      </button>
      <button
        onClick={() => onReduce(product)}
        className="flex-1 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
      >
        📉 Reduce
      </button>
      <button
        onClick={() => onDelete(product._id)}
        className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
      >
        🗑️
      </button>
    </div>
  </div>
);

const ProductsAdmin = () => {
  const { data: products, isLoading, isError } = useGetProductsQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();
  const [reduceQty, { isLoading: reducing }] = useReduceProductQuantityMutation();

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    qty: 0,
  });
  const [reduceModal, setReduceModal] = useState(false);
  const [reduceValue, setReduceValue] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or table

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
            <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h2>
            <p className="text-red-500">You do not have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !currentUser) return <Loading />;
  if (isError) return (
    <div className="flex min-h-screen bg-gradient-to-br from-red-50 to-rose-50">
      <Aside userRole={currentUser?.role} />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Failed to load products</h2>
          <p className="text-red-500">Please try refreshing the page</p>
        </div>
      </div>
    </div>
  );

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await updateProduct({ id: editProduct._id, ...form }).unwrap();
        toast.success("Product updated successfully! 🎉");
      } else {
        await createProduct(form).unwrap();
        toast.success("Product created successfully! 🎉");
      }
      handleCloseModal();
    } catch (err) {
      toast.error(err?.data?.message || "Error processing product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted successfully! 🗑️");
    } catch (err) {
      toast.error(err?.data?.message || "Error deleting product");
    }
  };

  const handleReduceQty = async () => {
    try {
      await reduceQty({ id: editProduct._id, quantity: reduceValue }).unwrap();
      toast.success("Quantity reduced successfully! 📉");
      setReduceModal(false);
      setEditProduct(null);
      setReduceValue(1);
    } catch (err) {
      toast.error(err?.data?.message || "Error reducing quantity");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setForm({
      title: "",
      description: "",
      category: "",
      price: 0,
      qty: 0,
    });
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      qty: product.qty,
    });
    setShowModal(true);
  };

  const handleReduce = (product) => {
    setEditProduct(product);
    setReduceModal(true);
  };

  // Filter and search logic
  const categories = [...new Set(products?.map(p => p.category) || [])];
  const filteredProducts = products?.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  // Calculate stats
  const totalProducts = products?.length || 0;
  const outOfStock = products?.filter(p => p.qty === 0).length || 0;
  const lowStock = products?.filter(p => p.qty > 0 && p.qty < 10).length || 0;
  const inStock = products?.filter(p => p.qty >= 10).length || 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-black">
      <Aside userRole={currentUser.role} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                📦 Products Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your inventory and product catalog</p>
            </div>
            <button
              onClick={() => {
                setShowModal(true);
                setEditProduct(null);
                setForm({
                  title: "",
                  description: "",
                  category: "",
                  price: 0,
                  qty: 0,
                });
              }}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl hover:from-green-600 hover:to-teal-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              New Product
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Products"
              value={totalProducts}
              icon="📊"
              gradient="from-green-500 to-emerald-600"
            />
            <StatsCard
              title="In Stock"
              value={inStock}
              icon="✅"
              gradient="from-blue-500 to-cyan-600"
            />
            <StatsCard
              title="Low Stock"
              value={lowStock}
              icon="⚠️"
              gradient="from-yellow-500 to-orange-500"
            />
            <StatsCard
              title="Out of Stock"
              value={outOfStock}
              icon="❌"
              gradient="from-red-500 to-rose-600"
            />
          </div>

          {/* Filters and Search */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                        viewMode === "grid" 
                          ? "bg-white text-green-600 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      🔲 Grid
                    </button>
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                        viewMode === "table" 
                          ? "bg-white text-green-600 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      📋 Table
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, category, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onReduce={handleReduce}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/50">
                <h3 className="text-xl font-bold text-gray-800">
                  Products ({filteredProducts.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-200/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product, index) => (
                      <tr
                        key={product._id}
                        className="hover:bg-green-50/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">{product.title.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-gray-600">{product.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-green-600">{product.price} EGP</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            product.qty === 0
                              ? "bg-red-100 text-red-700"
                              : product.qty < 10
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            📦 {product.qty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{product.createdBy?.fullName || "Unknown"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium shadow-sm transform hover:scale-105 transition-all duration-200 text-xs"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleReduce(product)}
                              className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 font-medium shadow-sm transform hover:scale-105 transition-all duration-200 text-xs"
                            >
                              📉 Reduce
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 font-medium shadow-sm transform hover:scale-105 transition-all duration-200 text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-green-400 text-5xl">📦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm || categoryFilter !== "all" ? "No matching products" : "No products yet"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm || categoryFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Start building your inventory by adding your first product"}
              </p>
              {(searchTerm || categoryFilter !== "all") ? (
                <button
                  onClick={() => { setSearchTerm(""); setCategoryFilter("all"); }}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl hover:from-green-600 hover:to-teal-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl hover:from-green-600 hover:to-teal-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal for create/edit product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">📦</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editProduct ? "Edit Product" : "Create New Product"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {editProduct ? "Update product information" : "Add a new product to inventory"}
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

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Category *</label>
                    <input
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      placeholder="e.g., Electronics, Clothing"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all resize-none"
                    placeholder="Detailed product description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Price (EGP) *</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Initial Quantity *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={form.qty}
                      onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all font-medium shadow-lg transform hover:scale-105"
                  >
                    {creating || updating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {editProduct ? "Updating..." : "Creating..."}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>{editProduct ? "💾" : "✨"}</span>
                        {editProduct ? "Update Product" : "Create Product"}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modal for reduce quantity */}
      {reduceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">📉</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reduce Quantity</h2>
                  <p className="text-gray-500 text-sm">{editProduct?.title}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="font-bold text-lg">{editProduct?.qty}</span>
                  </div>
                </div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Reduce by *</label>
                <input
                  type="number"
                  min={1}
                  max={editProduct?.qty || 1}
                  value={reduceValue}
                  onChange={(e) => setReduceValue(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
                <div className="mt-2 text-sm text-gray-500">
                  New quantity will be: <span className="font-semibold">{(editProduct?.qty || 0) - reduceValue}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReduceModal(false);
                    setEditProduct(null);
                    setReduceValue(1);
                  }}
                  className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReduceQty}
                  disabled={reducing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 transition-all font-medium shadow-lg transform hover:scale-105"
                >
                  {reducing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Reducing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>📉</span>
                      Reduce Quantity
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;