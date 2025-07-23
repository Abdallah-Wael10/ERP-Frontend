"use client";
import React, { useState } from "react";
import {
  useGetMyLeavesQuery,
  useCreateLeaveRequestMutation,
} from "@/app/services/apis/leavesApi";
import Loading from "@/app/components/loading/page";
import toast from "react-hot-toast";
import Aside from "@/app/components/aside/page";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";

// Modern Stats Card Component
const ModernStatsCard = ({ title, value, icon, gradient, description }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div
          className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const MyLeavesPage = () => {
  const { data: leaves, isLoading, isError } = useGetMyLeavesQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [createLeave, { isLoading: creating }] =
    useCreateLeaveRequestMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLeave(form).unwrap();
      toast.success("Leave request submitted successfully! 🎉");
      setShowModal(false);
      setForm({ startDate: "", endDate: "", reason: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Error submitting leave request");
    }
  };

  const resetForm = () => {
    setForm({ startDate: "", endDate: "", reason: "" });
    setShowModal(false);
  };

  // Calculate stats
  const totalLeaves = leaves?.length || 0;
  const pendingLeaves =
    leaves?.filter((leave) => leave.status === "pending").length || 0;
  const approvedLeaves =
    leaves?.filter((leave) => leave.status === "approved").length || 0;
  const rejectedLeaves =
    leaves?.filter((leave) => leave.status === "rejected").length || 0;

  // Filter leaves
  const filteredLeaves =
    leaves?.filter((leave) => {
      const matchesSearch = leave.reason
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || leave.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  if (isLoading) return <Loading />;
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
              Failed to load leaves
            </h2>
            <p className="text-red-500">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Aside userRole={currentUser?.role} />

      <div className="flex-1 ml-64 text-black">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Leave Requests
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Manage your time off and track leave status
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-full text-white font-medium shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {currentUser?.fullName}
                </span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 flex items-center gap-3 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-xl">🏖️</span>
                Request Leave
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ModernStatsCard
              title="Total Requests"
              value={totalLeaves}
              icon="📊"
              gradient="from-blue-500 to-indigo-600"
              description="All time requests"
            />
            <ModernStatsCard
              title="Pending"
              value={pendingLeaves}
              icon="⏳"
              gradient="from-yellow-500 to-orange-500"
              description="Awaiting approval"
            />
            <ModernStatsCard
              title="Approved"
              value={approvedLeaves}
              icon="✅"
              gradient="from-green-500 to-emerald-600"
              description="Confirmed leaves"
            />
            <ModernStatsCard
              title="Rejected"
              value={rejectedLeaves}
              icon="❌"
              gradient="from-red-500 to-rose-600"
              description="Declined requests"
            />
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Search & Filter
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Leaves
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by reason..."
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
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leaves Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Leave Requests History
                </h3>
                <div className="text-sm text-gray-500">
                  {filteredLeaves.length} of {totalLeaves} requests
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Leave Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Review Note
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.map((leave, index) => (
                    <tr
                      key={leave._id}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📅</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(leave.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              to{" "}
                              {new Date(leave.endDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {leave.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            leave.status === "approved"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : leave.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {leave.status === "approved" && "✅ "}
                          {leave.status === "pending" && "⏳ "}
                          {leave.status === "rejected" && "❌ "}
                          {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🗓️</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {leave.totalDays} day
                            {leave.totalDays !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 max-w-xs">
                          {leave.reviewNote ? (
                            <div className="bg-gray-50 p-2 rounded-lg">
                              {leave.reviewNote}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              No review note
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500">
                          {new Date(leave.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                          <br />
                          {new Date(leave.createdAt).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredLeaves.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-blue-400 text-5xl">🏖️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No leaves found"
                    : "No leave requests yet"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Start planning your time off by submitting your first leave request. Work-life balance is important!"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Request Your First Leave
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 transform transition-all scale-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">🏖️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Request Leave
                    </h2>
                    <p className="text-gray-500 text-sm">Plan your time off</p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Leave *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                  placeholder="Please provide a detailed reason for your leave request..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium shadow-lg transform hover:scale-105"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>🚀</span>
                      Submit Request
                    </div>
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

export default MyLeavesPage;
