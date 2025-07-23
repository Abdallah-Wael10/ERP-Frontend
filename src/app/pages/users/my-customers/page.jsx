"use client";
import React, { useState } from "react";
import {
  useGetMyCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "@/app/services/apis/customersApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import toast from "react-hot-toast";
import Aside from "@/app/components/aside/page";
import Loading, { MiniLoading } from "@/app/components/loading/page";

const MyCustomersPage = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or table

  // API Hooks
  const { data: myCustomers, isLoading } = useGetMyCustomersQuery();
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer({ id: editingCustomer._id, ...form }).unwrap();
        toast.success("Customer updated successfully! 🎉");
      } else {
        await createCustomer(form).unwrap();
        toast.success("Customer created successfully! 🎉");
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
    });
    setEditingCustomer(null);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setShowModal(true);
  };

  // Filter and sort customers
  const filteredCustomers = (() => {
    let filtered =
      myCustomers?.filter((customer) => {
        if (!customer) return false;

        const searchLower = searchTerm.toLowerCase();
        const fieldsToSearch = [customer.name, customer.email, customer.phone];

        return fieldsToSearch.some(
          (field) =>
            field && field.toString().toLowerCase().includes(searchLower)
        );
      }) || [];

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        default:
          return 0;
      }
    });

    return filtered;
  })();

  // Stats calculations
  const totalCustomers = myCustomers?.length || 0;
  const customersWithPhone = myCustomers?.filter((c) => c?.phone).length || 0;
  const thisMonthCustomers =
    myCustomers?.filter((c) => {
      if (!c?.createdAt) return false;
      const createdAt = new Date(c.createdAt);
      const thisMonth = new Date();
      return (
        createdAt.getMonth() === thisMonth.getMonth() &&
        createdAt.getFullYear() === thisMonth.getFullYear()
      );
    }).length || 0;
  const thisWeekCustomers =
    myCustomers?.filter((c) => {
      if (!c?.createdAt) return false;
      const createdAt = new Date(c.createdAt);
      const thisWeek = new Date();
      const weekAgo = new Date(thisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
      return createdAt >= weekAgo;
    }).length || 0;

  if (isLoading) {
    return (
      <Loading
        type="dashboard"
        message="Loading your customers..."
        submessage="Fetching your customer data"
        size="large"
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Aside userRole={currentUser?.role} />

      <div className="flex-1 ml-64 text-black">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                My Customers
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Build lasting relationships with your customers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full text-white font-medium shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {currentUser?.role === "salesManager"
                    ? "Sales Manager"
                    : "Sales Rep"}
                </span>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-3 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-xl">➕</span>
                Add Customer
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ModernStatsCard
              title="My Customers"
              value={totalCustomers}
              icon="🏢"
              gradient="from-blue-500 to-indigo-600"
            />
            <ModernStatsCard
              title="With Phone"
              value={customersWithPhone}
              icon="📞"
              gradient="from-green-500 to-emerald-600"
            />
            <ModernStatsCard
              title="This Month"
              value={thisMonthCustomers}
              icon="📅"
              gradient="from-purple-500 to-violet-600"
            />
            <ModernStatsCard
              title="This Week"
              value={thisWeekCustomers}
              icon="⭐"
              gradient="from-yellow-500 to-orange-500"
            />
          </div>

          {/* Modern Search & Filter */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Search & Sort
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Your Customers
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="email">Email A-Z</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Mode
                </label>
                <div className="flex rounded-xl border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      viewMode === "grid"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2">⊞</span>
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      viewMode === "table"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2">☰</span>
                    Table
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer, index) => (
                <div
                  key={customer._id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all">
                        <span className="text-white font-bold text-xl">
                          {customer.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {customer.name || "N/A"}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono">
                          ID: {customer._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-3 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all transform hover:scale-110"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
                      <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-700">📧</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {customer.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                      <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                        <span className="text-green-700">📞</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Phone
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {customer.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Added
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-bold">
                        My Customer
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    My Customers List
                  </h3>
                  <div className="text-sm text-gray-500">
                    {filteredCustomers.length} customers
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Added Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCustomers.map((customer, index) => (
                      <tr
                        key={customer._id}
                        className="hover:bg-green-50/50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                              <span className="text-white font-bold text-lg">
                                {customer.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {customer.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {customer._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <span>📧</span>
                              <span className="font-medium truncate max-w-xs">
                                {customer.email || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>📞</span>
                              <span>{customer.phone || "N/A"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="flex items-center gap-1 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg font-medium transition-all"
                          >
                            <span>✏️</span>
                            Edit
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
          {filteredCustomers.length === 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-gray-400 text-5xl">🏢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {searchTerm ? "No customers found" : "No customers yet"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {searchTerm
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "Start building your customer base by adding your first customer. Great relationships begin here!"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Add Your First Customer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modern Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all scale-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              <p className="text-gray-500 mt-1">
                {editingCustomer
                  ? `Editing ${editingCustomer.name}'s information`
                  : "Create a new customer record"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="Enter customer full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="customer@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
                  placeholder="01234567890"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all font-medium shadow-lg"
                >
                  {creating || updating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingCustomer ? "Updating..." : "Creating..."}
                    </div>
                  ) : editingCustomer ? (
                    "Update Customer"
                  ) : (
                    "Create Customer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Modern Stats Card Component (reused)
function ModernStatsCard({ title, value, icon, gradient }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 shadow-lg`}
        >
          <span className="text-2xl text-white">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default MyCustomersPage;
