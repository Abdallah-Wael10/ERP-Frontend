"use client";
import React, { useState } from "react";
import {
  useGetProfitReportQuery,
  useGetSalariesReportQuery,
  useGetAttendanceCostsQuery,
} from "@/app/services/apis/financeApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import Loading from "@/app/components/loading/page";
import Aside from "@/app/components/aside/page";

// Modern Stats Card
const StatsCard = ({ title, value, icon, gradient, subtitle }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

const ExpensesAdmin = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: profitData } = useGetProfitReportQuery();
  const { data: salariesData } = useGetSalariesReportQuery();
  const { data: attendanceCosts } = useGetAttendanceCostsQuery();

  // Role protection
  if (currentUser && !["finance", "hr", "superadmin"].includes(currentUser.role)) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        <Aside userRole={currentUser.role} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-4xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h2>
            <p className="text-red-500">Only Finance, HR, and SuperAdmin can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Loading />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-black">
      <Aside userRole={currentUser?.role} key={currentUser?._id} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                💳 Expense Management
              </h1>
              <p className="text-gray-600 mt-1">Track and analyze all business expenses</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Expense Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Expenses"
              value={`${(profitData?.expenses?.total || 0).toLocaleString()} EGP`}
              subtitle="All operational costs"
              icon="💳"
              gradient="from-amber-500 to-orange-600"
            />
            <StatsCard
              title="Salary Expenses"
              value={`${(profitData?.expenses?.salaries || 0).toLocaleString()} EGP`}
              subtitle={`${salariesData?.totalEmployees || 0} employees`}
              icon="👥"
              gradient="from-blue-500 to-indigo-600"
            />
            <StatsCard
              title="Product Costs"
              value={`${(profitData?.expenses?.productCosts || 0).toLocaleString()} EGP`}
              subtitle="Cost of goods sold"
              icon="📦"
              gradient="from-purple-500 to-pink-600"
            />
          </div>

          {/* Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Expense Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-700">Salaries</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-800">{(profitData?.expenses?.salaries || 0).toLocaleString()} EGP</div>
                    <div className="text-sm text-blue-600">
                      {((profitData?.expenses?.salaries || 0) / (profitData?.expenses?.total || 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-purple-700">Product Costs</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-800">{(profitData?.expenses?.productCosts || 0).toLocaleString()} EGP</div>
                    <div className="text-sm text-purple-600">
                      {((profitData?.expenses?.productCosts || 0) / (profitData?.expenses?.total || 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary by Role */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">👥 Salary by Role</h3>
              <div className="space-y-3">
                {salariesData?.byRole?.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900 capitalize">{role._id}</div>
                      <div className="text-sm text-gray-500">{role.employeeCount} employees</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{role.totalSalary.toLocaleString()} EGP</div>
                      <div className="text-sm text-gray-500">
                        Avg: {Math.round(role.totalSalary / role.employeeCount).toLocaleString()} EGP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Costs */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800">⏰ Attendance-Based Costs</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-amber-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Attendance Days</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Base Salary</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Earned Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceCosts?.slice(0, 10)?.map((employee, index) => (
                    <tr key={index} className="hover:bg-amber-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{employee.fullName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-700">{employee.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{employee.checkedOutDays}/{employee.attendanceDays}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{employee.salary.toLocaleString()} EGP</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-600">{Math.round(employee.earnedSalary).toLocaleString()} EGP</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesAdmin;