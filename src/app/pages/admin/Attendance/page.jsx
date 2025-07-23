"use client";
import React, { useState } from "react";
import {
  useGetAllAttendanceQuery,
  useGetTodayAttendanceQuery,
  useGetAttendanceStatsQuery,
  useEditAttendanceMutation,
  useDeleteAttendanceMutation,
} from "@/app/services/apis/attendanceApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import { useGetUsersQuery } from "@/app/services/apis/usersApi";
import toast from "react-hot-toast";
import Aside from "@/app/components/aside/page";
import Loading, { MiniLoading } from "@/app/components/loading/page";

const AttendanceAdmin = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: users } = useGetUsersQuery();

  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [selectedUser, setSelectedUser] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // API Hooks
  const { data: allAttendance, isLoading } = useGetAllAttendanceQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    userId: selectedUser || undefined,
  });

  const { data: todayAttendance } = useGetTodayAttendanceQuery();
  const { data: stats } = useGetAttendanceStatsQuery();
  const [editAttendance, { isLoading: updating }] = useEditAttendanceMutation();
  const [deleteAttendance, { isLoading: deleting }] =
    useDeleteAttendanceMutation();

  const [form, setForm] = useState({
    checkInTime: "",
    checkOutTime: "",
    status: "present",
    note: "",
  });

  const handleEdit = (record) => {
    setSelectedRecord(record);
    const checkInTime = record.checkInTime
      ? new Date(record.checkInTime).toLocaleTimeString("en-GB", {
          hour12: false,
        })
      : "";
    const checkOutTime = record.checkOutTime
      ? new Date(record.checkOutTime).toLocaleTimeString("en-GB", {
          hour12: false,
        })
      : "";

    setForm({
      checkInTime,
      checkOutTime,
      status: record.status || "present",
      note: record.note || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        id: selectedRecord._id,
        checkInTime: form.checkInTime
          ? `${selectedRecord.date.split("T")[0]}T${form.checkInTime}:00.000Z`
          : null,
        checkOutTime: form.checkOutTime
          ? `${selectedRecord.date.split("T")[0]}T${form.checkOutTime}:00.000Z`
          : null,
        status: form.status,
        note: form.note,
      };

      await editAttendance(updateData).unwrap();
      toast.success("Attendance updated successfully!");
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.data?.message || "Failed to update attendance");
    }
  };

  const resetForm = () => {
    setForm({
      checkInTime: "",
      checkOutTime: "",
      status: "present",
      note: "",
    });
    setSelectedRecord(null);
  };

  const handleDelete = async (record) => {
    if (
      window.confirm(`Delete attendance record for ${record.userId?.fullName}?`)
    ) {
      try {
        await deleteAttendance(record._id).unwrap();
        toast.success("Attendance deleted successfully!");
      } catch (error) {
        toast.error(error.data?.message || "Failed to delete attendance");
      }
    }
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "0.0";
    const diff = new Date(checkOut) - new Date(checkIn);
    return (diff / (1000 * 60 * 60)).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "half-day":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return "✅";
      case "absent":
        return "❌";
      case "late":
        return "⏰";
      case "half-day":
        return "🕐";
      default:
        return "❓";
    }
  };

  // Filter attendance based on search term
  const filteredAttendance =
    allAttendance?.filter((record) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        record.userId?.fullName?.toLowerCase().includes(searchLower) ||
        record.userId?.email?.toLowerCase().includes(searchLower) ||
        record.status?.toLowerCase().includes(searchLower)
      );
    }) || [];

  if (isLoading) {
    return (
      <Loading
        type="dashboard"
        message="Loading attendance data..."
        submessage="Fetching employee records"
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
                Attendance Management
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Monitor and manage employee attendance records
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded-full text-white font-medium shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {currentUser?.role === "superadmin"
                    ? "Super Admin"
                    : "HR Manager"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ModernStatsCard
              title="Today Present"
              value={
                todayAttendance?.filter((a) => a.status === "present").length ||
                0
              }
              icon="✅"
              gradient="from-green-500 to-emerald-600"
              change="+5%"
              changeType="positive"
            />
            <ModernStatsCard
              title="Today Absent"
              value={stats?.todayAbsent || 0}
              icon="❌"
              gradient="from-red-500 to-rose-600"
              change="-2%"
              changeType="negative"
            />
            <ModernStatsCard
              title="Late Arrivals"
              value={
                todayAttendance?.filter((a) => a.status === "late").length || 0
              }
              icon="⏰"
              gradient="from-yellow-500 to-orange-500"
              change="+1%"
              changeType="positive"
            />
            <ModernStatsCard
              title="Avg Work Hours"
              value={`${stats?.averageWorkHours?.toFixed(1) || "0.0"}h`}
              icon="📊"
              gradient="from-blue-500 to-indigo-600"
              change="+0.5h"
              changeType="positive"
            />
          </div>

          {/* Modern Filters */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Filter & Search
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Employees
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or status..."
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
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="">All Employees</option>
                  {users
                    ?.filter((user) => user.role !== "superadmin")
                    ?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.fullName} ({user.role})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setDateRange({
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: new Date().toISOString().split("T")[0],
                  });
                  setSelectedUser("");
                  setSearchTerm("");
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-lg"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Modern Attendance Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Attendance Records
                </h3>
                <div className="text-sm text-gray-500">
                  Showing {filteredAttendance.length} records
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Work Hours
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.map((record, index) => (
                    <tr
                      key={record._id}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-medium text-sm">
                              {record.userId?.fullName
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.userId?.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.userId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          {record.checkInTime
                            ? new Date(record.checkInTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour12: false,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          {record.checkOutTime
                            ? new Date(record.checkOutTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour12: false,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-blue-600">
                          {calculateWorkHours(
                            record.checkInTime,
                            record.checkOutTime
                          )}
                          h
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          <span>{getStatusIcon(record.status)}</span>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          {currentUser?.role === "superadmin" && (
                            <button
                              onClick={() => handleDelete(record)}
                              disabled={deleting}
                              className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
                            >
                              {deleting ? "..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAttendance.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Records Found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedUser
                    ? "No attendance records match your current filters."
                    : "No attendance records found for the selected date range."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Attendance
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <p className="text-gray-500 mt-1">
                Editing record for {selectedRecord?.userId?.fullName}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check In Time
                  </label>
                  <input
                    type="time"
                    value={form.checkInTime}
                    onChange={(e) =>
                      setForm({ ...form, checkInTime: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check Out Time
                  </label>
                  <input
                    type="time"
                    value={form.checkOutTime}
                    onChange={(e) =>
                      setForm({ ...form, checkOutTime: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Add any notes or comments..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
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
                  disabled={updating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-medium shadow-lg"
                >
                  {updating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    "Update Record"
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
              {change} from last week
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

export default AttendanceAdmin;
