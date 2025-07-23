"use client";
import React, { useState } from "react";
import {
  useGetAllLeavesQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
} from "@/app/services/apis/leavesApi";
import Loading from "@/app/components/loading/page";
import toast from "react-hot-toast";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import Aside from "@/app/components/aside/page";

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

const LeavesAdmin = () => {
  const { data: leaves, isLoading, isError } = useGetAllLeavesQuery();
  const { data: currentUser } = useGetCurrentUserQuery();
  const [approveLeave, { isLoading: approving }] = useApproveLeaveMutation();
  const [rejectLeave, { isLoading: rejecting }] = useRejectLeaveMutation();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Open modal for approve or reject
  const handleReviewClick = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setReviewNote("");
    setShowReviewModal(true);
  };

  // Unified submit for approve/reject
  const handleReviewSubmit = async () => {
    if (!reviewNote.trim()) {
      toast.error("Please provide a review note");
      return;
    }
    try {
      if (actionType === "approve") {
        await approveLeave({ id: selectedLeave._id, reviewNote }).unwrap();
        toast.success("Leave approved successfully! ✅");
      } else {
        await rejectLeave({ id: selectedLeave._id, reviewNote }).unwrap();
        toast.success("Leave rejected successfully! ❌");
      }
      setShowReviewModal(false);
      setReviewNote("");
      setSelectedLeave(null);
      setActionType("");
    } catch (err) {
      toast.error(err?.data?.message || "Error processing leave");
    }
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
      const matchesSearch =
        leave.userId?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Aside userRole={currentUser?.role} />

      <div className="flex-1 ml-64 text-black">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                🏖️ Leaves Management
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Review and manage employee leave requests
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2 rounded-full text-white font-medium shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {currentUser?.role === "superadmin"
                    ? "Super Admin"
                    : "HR Manager"}
                </span>
              </div>
              <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                <span className="text-sm font-medium text-gray-700">
                  {totalLeaves} Total Requests
                </span>
              </div>
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
              description="All leave requests"
            />
            <ModernStatsCard
              title="Pending Review"
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
              description="Approved leaves"
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
                    placeholder="Search by employee name, email, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
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
                  Leave Requests
                </h3>
                <div className="text-sm text-gray-500">
                  {filteredLeaves.length} of {totalLeaves} requests
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-orange-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Employee
                    </th>
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
                      Reviewed By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.map((leave, index) => (
                    <tr
                      key={leave._id}
                      className="hover:bg-orange-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {leave.userId?.fullName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {leave.userId?.fullName || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {leave.userId?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
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
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="bg-gray-50 p-3 rounded-xl">
                            {leave.reason}
                          </div>
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
                        {leave.reviewNote && (
                          <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                            <strong>Note:</strong> {leave.reviewNote}
                          </div>
                        )}
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
                        {leave.reviewedBy ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {leave.reviewedBy.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {leave.reviewedAt &&
                                new Date(leave.reviewedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Not reviewed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {leave.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleReviewClick(leave, "approve")
                              }
                              disabled={approving}
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                            >
                              <span>✅</span>
                              {approving ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReviewClick(leave, "reject")}
                              disabled={rejecting}
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                            >
                              <span>❌</span>
                              {rejecting ? "..." : "Reject"}
                            </button>
                          </div>
                        )}
                        {leave.status !== "pending" && (
                          <div className="text-xs text-gray-400">
                            {leave.status === "approved"
                              ? "✅ Approved"
                              : "❌ Rejected"}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredLeaves.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-orange-400 text-5xl">🏖️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No leaves found"
                    : "No leave requests yet"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "When employees submit leave requests, they will appear here for your review."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 text-black bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 transform transition-all scale-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${
                      actionType === "approve"
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-red-500 to-rose-600"
                    } rounded-2xl flex items-center justify-center`}
                  >
                    <span className="text-white text-xl">
                      {actionType === "approve" ? "✅" : "❌"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {actionType === "approve"
                        ? "Approve Leave Request"
                        : "Reject Leave Request"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {selectedLeave?.userId?.fullName}'s leave request
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNote("");
                    setSelectedLeave(null);
                    setActionType("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Note *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                  placeholder={
                    actionType === "approve"
                      ? "Why did you approve this leave?"
                      : "Please provide a clear reason for rejecting this leave request..."
                  }
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNote("");
                    setSelectedLeave(null);
                    setActionType("");
                  }}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={
                    (actionType === "approve" ? approving : rejecting) ||
                    !reviewNote.trim()
                  }
                  className={`px-8 py-3 ${
                    actionType === "approve"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  } text-white rounded-xl disabled:opacity-50 transition-all font-medium shadow-lg transform hover:scale-105`}
                >
                  {(actionType === "approve" ? approving : rejecting) ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {actionType === "approve"
                        ? "Approving..."
                        : "Rejecting..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{actionType === "approve" ? "✅" : "❌"}</span>
                      {actionType === "approve"
                        ? "Approve Leave"
                        : "Reject Leave"}
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

export default LeavesAdmin;
