"use client";
import React, { useState } from "react";
import {
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

const SalariesAdmin = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: salariesData } = useGetSalariesReportQuery();
  const { data: attendanceCosts } = useGetAttendanceCostsQuery();
  const [selectedRole, setSelectedRole] = useState("all");

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

  // Get available roles
  const roles = salariesData?.byRole?.map(role => role._id) || [];
  
  // Filter employees by role
  const filteredEmployees = selectedRole === "all" 
    ? salariesData?.byRole?.flatMap(role => role.employees) || []
    : salariesData?.byRole?.find(role => role._id === selectedRole)?.employees || [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 text-black">
      <Aside userRole={currentUser?.role} key={currentUser?._id} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                👥 Salary Reports
              </h1>
              <p className="text-gray-600 mt-1">Employee salary management and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role} className="capitalize">{role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Salary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Payroll"
              value={`${(salariesData?.totalPayroll || 0).toLocaleString()} EGP`}
              subtitle="Monthly total"
              icon="💰"
              gradient="from-indigo-500 to-blue-600"
            />
            <StatsCard
              title="Total Employees"
              value={salariesData?.totalEmployees || 0}
              subtitle="Active staff"
              icon="👥"
              gradient="from-blue-500 to-cyan-600"
            />
            <StatsCard
              title="Average Salary"
              value={`${Math.round((salariesData?.totalPayroll || 0) / (salariesData?.totalEmployees || 1)).toLocaleString()} EGP`}
              subtitle="Per employee"
              icon="📊"
              gradient="from-purple-500 to-indigo-600"
            />
            <StatsCard
              title="Departments"
              value={salariesData?.byRole?.length || 0}
              subtitle="Active roles"
              icon="🏢"
              gradient="from-cyan-500 to-teal-600"
            />
          </div>

          {/* Salary by Role */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">💼 Salary Distribution by Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salariesData?.byRole?.map((role, index) => (
                <div key={index} className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-indigo-900 capitalize">{role._id}</h4>
                    <span className="text-sm text-indigo-600">{role.employeeCount} employees</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-indigo-700">{role.totalSalary.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-medium text-indigo-600">
                        {Math.round(role.totalSalary / role.employeeCount).toLocaleString()} EGP
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Details */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800">
                👤 Employee Details {selectedRole !== "all" && `- ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Salary</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((employee, index) => (
                    <tr key={employee.userId} className="hover:bg-indigo-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{employee.fullName.charAt(0)}</span>
                          </div>
                          <div className="font-medium text-gray-900">{employee.fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{employee.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                          {selectedRole === "all" ? employee.role || "N/A" : selectedRole}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-indigo-600">{employee.salary.toLocaleString()} EGP</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredEmployees.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-indigo-400 text-5xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Employees Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  {selectedRole === "all" 
                    ? "No employee data available" 
                    : `No employees found for role: ${selectedRole}`}
                </p>
                {selectedRole !== "all" && (
                  <button
                    onClick={() => setSelectedRole("all")}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl hover:from-indigo-600 hover:to-blue-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    View All Employees
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

export default SalariesAdmin;