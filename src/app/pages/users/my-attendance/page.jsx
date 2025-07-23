"use client";
import React, { useState } from "react";
import {
  useGetMyAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useGetMyTodayStatusQuery,
} from "@/app/services/apis/attendanceApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import toast from "react-hot-toast";
import Aside from "@/app/components/aside/page";
import Loading, { MiniLoading } from "@/app/components/loading/page";

const MyAttendancePage = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // API Hooks
  const { data: myAttendance, isLoading } = useGetMyAttendanceQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: todayStatus, refetch: refetchTodayStatus } =
    useGetMyTodayStatusQuery();
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: checkingOut }] = useCheckOutMutation();

  const handleCheckIn = async () => {
    try {
      await checkIn({
        note: "Regular check-in",
      }).unwrap();
      toast.success("Checked in successfully! 🎉");
      refetchTodayStatus();
    } catch (error) {
      toast.error(error.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut({
        note: "Regular check-out",
      }).unwrap();
      toast.success("Checked out successfully! Have a great day! 👋");
      refetchTodayStatus();
    } catch (error) {
      toast.error(error.data?.message || "Failed to check out");
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

  // Calculate statistics
  const totalDays = myAttendance?.length || 0;
  const presentDays =
    myAttendance?.filter((a) => a.status === "present").length || 0;
  const lateDays = myAttendance?.filter((a) => a.status === "late").length || 0;
  const absentDays =
    myAttendance?.filter((a) => a.status === "absent").length || 0;
  const totalWorkHours =
    myAttendance?.reduce((sum, record) => {
      return (
        sum +
        (parseFloat(
          calculateWorkHours(record.checkInTime, record.checkOutTime)
        ) || 0)
      );
    }, 0) || 0;

  const canCheckIn = !todayStatus?.checkInTime;
  const canCheckOut = todayStatus?.checkInTime && !todayStatus?.checkOutTime;

  if (isLoading) {
    return (
      <Loading
        type="dashboard"
        message="Loading your attendance..."
        submessage="Fetching your records"
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
                My Attendance
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Track your attendance and work hours
              </p>
            </div>

            {/* Check In/Out Buttons */}
            <div className="flex space-x-4">
              {canCheckIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-3 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {checkingIn ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <span className="text-xl">🕐</span>
                  )}
                  Check In
                </button>
              )}

              {canCheckOut && (
                <button
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:from-red-600 hover:to-rose-700 disabled:opacity-50 flex items-center gap-3 font-medium shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {checkingOut ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <span className="text-xl">🕕</span>
                  )}
                  Check Out
                </button>
              )}

              {todayStatus?.checkInTime && todayStatus?.checkOutTime && (
                <div className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center gap-3 font-medium shadow-xl">
                  <span className="text-xl">🎉</span>
                  Day Complete
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Today Status Card */}
          {todayStatus && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Today's Status
                </h3>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center bg-green-50 rounded-xl p-6">
                  <div className="text-3xl mb-2">🕐</div>
                  <p className="text-sm text-gray-600 font-medium">Check In</p>
                  <p className="text-2xl font-bold text-green-600">
                    {todayStatus.checkInTime
                      ? new Date(todayStatus.checkInTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </p>
                </div>
                <div className="text-center bg-red-50 rounded-xl p-6">
                  <div className="text-3xl mb-2">🕕</div>
                  <p className="text-sm text-gray-600 font-medium">Check Out</p>
                  <p className="text-2xl font-bold text-red-600">
                    {todayStatus.checkOutTime
                      ? new Date(todayStatus.checkOutTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </p>
                </div>
                <div className="text-center bg-blue-50 rounded-xl p-6">
                  <div className="text-3xl mb-2">⏱️</div>
                  <p className="text-sm text-gray-600 font-medium">
                    Work Hours
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {calculateWorkHours(
                      todayStatus.checkInTime,
                      todayStatus.checkOutTime
                    )}
                    h
                  </p>
                </div>
                <div className="text-center bg-purple-50 rounded-xl p-6">
                  <div className="text-3xl mb-2">
                    {getStatusIcon(todayStatus.status)}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                      todayStatus.status || "present"
                    )}`}
                  >
                    {todayStatus.status || "present"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ModernStatsCard
              title="Total Days"
              value={totalDays}
              icon="📅"
              gradient="from-blue-500 to-indigo-600"
            />
            <ModernStatsCard
              title="Present Days"
              value={presentDays}
              icon="✅"
              gradient="from-green-500 to-emerald-600"
            />
            <ModernStatsCard
              title="Late Days"
              value={lateDays}
              icon="⏰"
              gradient="from-yellow-500 to-orange-500"
            />
            <ModernStatsCard
              title="Total Hours"
              value={`${totalWorkHours.toFixed(1)}h`}
              icon="⏱️"
              gradient="from-purple-500 to-violet-600"
            />
          </div>

          {/* Date Range Filter */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Filter Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateRange({
                      startDate: new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1
                      )
                        .toISOString()
                        .split("T")[0],
                      endDate: new Date().toISOString().split("T")[0],
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-medium shadow-lg"
                >
                  This Month
                </button>
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Attendance History
                </h3>
                <div className="text-sm text-gray-500">
                  {myAttendance?.length || 0} records found
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
                  <tr>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myAttendance?.map((record, index) => (
                    <tr
                      key={record._id}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!myAttendance?.length && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Records Found
                </h3>
                <p className="text-gray-500">
                  No attendance records found for the selected period.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
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

export default MyAttendancePage;
