"use client";
import React, { useState } from "react";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useBulkDeleteCustomersMutation,
} from "@/app/services/apis/customersApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import { useGetUsersQuery } from "@/app/services/apis/usersApi";
import toast from "react-hot-toast";
import Aside from "@/app/components/aside/page";
import Loading, { MiniLoading } from "@/app/components/loading/page";

const CustomersAdmin = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: users } = useGetUsersQuery();
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // API Hooks
  const { data: customers, isLoading } = useGetCustomersQuery();
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [bulkDeleteCustomers] = useBulkDeleteCustomersMutation();

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

  const handleDelete = async (customer) => {
    if (window.confirm(`Delete customer "${customer.name}"?`)) {
      try {
        await deleteCustomer(customer._id).unwrap();
        toast.success("Customer deleted successfully! 🗑️");
      } catch (error) {
        toast.error(error.data?.message || "Failed to delete customer");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select customers to delete");
      return;
    }

    if (
      window.confirm(`Delete ${selectedCustomers.length} selected customers?`)
    ) {
      try {
        await bulkDeleteCustomers(selectedCustomers).unwrap();
        toast.success(
          `${selectedCustomers.length} customers deleted successfully! 🗑️`
        );
        setSelectedCustomers([]);
      } catch (error) {
        toast.error(error.data?.message || "Failed to delete customers");
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((c) => c._id));
    }
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Filter and sort customers
  const filteredCustomers = (() => {
    let filtered =
      customers?.filter((customer) => {
        if (!customer) return false;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = [
          customer.name,
          customer.email,
          customer.phone,
          customer.userId?.fullName,
        ].some(
          (field) =>
            field && field.toString().toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;

        // Filter by sales person
        if (filterBy === "all") return true;
        return customer.userId?._id === filterBy;
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
        case "sales":
          return (a.userId?.fullName || "").localeCompare(
            b.userId?.fullName || ""
          );
        default:
          return 0;
      }
    });

    return filtered;
  })();

  const salesUsers =
    users?.filter((user) => ["sales", "salesManager"].includes(user.role)) ||
    [];

  // Stats calculations
  const totalCustomers = customers?.length || 0;
  const customersWithPhone = customers?.filter((c) => c?.phone).length || 0;
  const thisMonthCustomers =
    customers?.filter((c) => {
      if (!c?.createdAt) return false;
      const createdAt = new Date(c.createdAt);
      const thisMonth = new Date();
      return (
        createdAt.getMonth() === thisMonth.getMonth() &&
        createdAt.getFullYear() === thisMonth.getFullYear()
      );
    }).length || 0;

  if (isLoading) {
    return (
      <Loading
        type="dashboard"
        message="Loading customers..."
        submessage="Fetching customer data"
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                All Customers
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Manage all customers across your sales team
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded-full text-white font-medium shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {currentUser?.role === "superadmin"
                    ? "Super Admin"
                    : "Sales Manager"}
                </span>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 flex items-center gap-3 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
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
              title="Total Customers"
              value={totalCustomers}
              icon="🏢"
              gradient="from-blue-500 to-indigo-600"
              change="+12%"
              changeType="positive"
            />
            <ModernStatsCard
              title="With Phone"
              value={customersWithPhone}
              icon="📞"
              gradient="from-green-500 to-emerald-600"
              change="+8%"
              changeType="positive"
            />
            <ModernStatsCard
              title="This Month"
              value={thisMonthCustomers}
              icon="📅"
              gradient="from-purple-500 to-violet-600"
              change="+15%"
              changeType="positive"
            />
            <ModernStatsCard
              title="Sales Team"
              value={salesUsers.length}
              icon="👨‍💼"
              gradient="from-yellow-500 to-orange-500"
            />
          </div>

          {/* Modern Filters */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Filter & Search
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Customers
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or sales person..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Sales Person
                </label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="all">All Sales People</option>
                  {salesUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Customer Name A-Z</option>
                  <option value="email">Email A-Z</option>
                  <option value="sales">Sales Person A-Z</option>
                </select>
              </div>
            </div>

            {selectedCustomers.length > 0 && (
              <div className="flex items-center justify-between mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <span className="text-red-700 font-medium flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">
                    {selectedCustomers.length}
                  </span>
                  customers selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          {/* Modern Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Customers Database
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Showing {filteredCustomers.length} of {totalCustomers}{" "}
                  customers
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedCustomers.length ===
                            filteredCustomers.length &&
                          filteredCustomers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Sales Person
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
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
                      className="hover:bg-blue-50/50 transition-colors duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer._id)}
                          onChange={() => handleSelectCustomer(customer._id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all">
                            <span className="text-white font-bold text-lg">
                              {customer.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-1">
                              {customer.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              ID: {customer._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs">📧</span>
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-xs">
                              {customer.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xs">📞</span>
                            </div>
                            <span className="text-gray-600">
                              {customer.phone || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.userId ? (
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                              <span className="text-white font-medium text-sm">
                                {customer.userId.fullName
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {customer.userId.fullName}
                              </div>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                    customer.userId.role === "superadmin"
                                      ? "bg-red-100 text-red-700 border border-red-200"
                                      : customer.userId.role === "salesManager"
                                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                                      : "bg-blue-100 text-blue-700 border border-blue-200"
                                  }`}
                                >
                                  {customer.userId.role === "superadmin"
                                    ? "Super Admin"
                                    : customer.userId.role === "salesManager"
                                    ? "Sales Manager"
                                    : "Sales Rep"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
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
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg font-medium transition-all text-sm"
                          >
                            <span>✏️</span>
                            Edit
                          </button>
                          {currentUser?.role === "superadmin" && (
                            <button
                              onClick={() => handleDelete(customer)}
                              className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg font-medium transition-all text-sm"
                            >
                              <span>🗑️</span>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-gray-400 text-4xl">🏢</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {searchTerm || filterBy !== "all"
                    ? "No customers found"
                    : "No customers yet"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm || filterBy !== "all"
                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                    : "Start building your customer database by adding your first customer."}
                </p>
                {!searchTerm && filterBy === "all" && (
                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Add First Customer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                  ? "Update customer information"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-medium shadow-lg"
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

// Modern Stats Card Component
function ModernStatsCard({ title, value, icon, gradient, change, changeType }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <p
              className={`text-xs font-medium flex items-center gap-1 ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              <span>{changeType === "positive" ? "↗️" : "↘️"}</span>
              {change} from last month
            </p>
          )}
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

export default CustomersAdmin;
