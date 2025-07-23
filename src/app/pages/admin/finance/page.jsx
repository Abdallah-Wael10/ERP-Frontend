"use client";
import React, { useState } from "react";
import {
  useGetFinanceDashboardQuery,
  useGetTotalRevenueQuery,
  useGetProfitReportQuery,
  useGetSalesPerformanceQuery,
  useGetMonthlyRevenueQuery,
} from "@/app/services/apis/financeApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import Loading from "@/app/components/loading/page";
import toast from "react-hot-toast";
import Aside from "@/app/components/aside/page";
import Link from "next/link";

// Modern Stats Card
const StatsCard = ({ title, value, icon, gradient, subtitle, trend }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? '↗️' : '↘️'} {trend.value}%
        </span>
        <span className="text-xs text-gray-500">vs last month</span>
      </div>
    )}
  </div>
);

// Quick Action Card
const QuickActionCard = ({ title, description, icon, gradient, href, onClick }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
    {href ? (
      <Link href={href} className="block">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
            <span className="text-xl">→</span>
          </div>
        </div>
      </Link>
    ) : (
      <div onClick={onClick} className="flex items-center gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
          <span className="text-xl">→</span>
        </div>
      </div>
    )}
  </div>
);

// Chart Component (Simple)
const SimpleChart = ({ data, title }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {data?.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{item.label}</span>
          <div className="flex items-center gap-3 flex-1 ml-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-gray-900">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FinanceAdmin = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: dashboardData, isLoading: dashLoading } = useGetFinanceDashboardQuery();
  const { data: revenueData } = useGetTotalRevenueQuery();
  const { data: profitData } = useGetProfitReportQuery();
  const { data: salesData } = useGetSalesPerformanceQuery();
  const { data: monthlyData } = useGetMonthlyRevenueQuery();

  // Role protection
  if (currentUser && !["finance", "superadmin"].includes(currentUser.role)) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        <Aside userRole={currentUser.role} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-4xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h2>
            <p className="text-red-500">Only Finance team and SuperAdmin can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (dashLoading || !currentUser) return <Loading />;

  // Calculate trends (mock data for now)
  const revenueTrend = { positive: true, value: 12.5 };
  const profitTrend = { positive: true, value: 8.3 };

  // Prepare chart data
  const salesChartData = salesData?.slice(0, 5)?.map(person => ({
    label: person.salesPerson,
    value: `${person.totalRevenue.toLocaleString()} EGP`,
    percentage: Math.min(100, (person.totalRevenue / (salesData[0]?.totalRevenue || 1)) * 100)
  })) || [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-black">
      <Aside userRole={currentUser?.role} key={currentUser?._id} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                💰 Finance Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Complete financial overview and management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Role: <span className="font-semibold">{currentUser?.role}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Revenue"
              value={`${(revenueData?.totalRevenue || 0).toLocaleString()} EGP`}
              subtitle={`${revenueData?.ordersCount || 0} orders`}
              icon="💰"
              gradient="from-emerald-500 to-teal-600"
              trend={revenueTrend}
            />
            <StatsCard
              title="Net Profit"
              value={`${(profitData?.netProfit || 0).toLocaleString()} EGP`}
              subtitle={`${profitData?.profitMargin || 0}% margin`}
              icon="📈"
              gradient="from-green-500 to-emerald-600"
              trend={profitTrend}
            />
            <StatsCard
              title="Total Expenses"
              value={`${(profitData?.expenses?.total || 0).toLocaleString()} EGP`}
              subtitle="All operational costs"
              icon="📊"
              gradient="from-amber-500 to-orange-600"
            />
            <StatsCard
              title="Active Orders"
              value={dashboardData?.orders?.total || 0}
              subtitle={`${dashboardData?.orders?.pending || 0} pending`}
              icon="🛒"
              gradient="from-blue-500 to-indigo-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Revenue Reports"
                description="View detailed revenue analytics"
                icon="💹"
                gradient="from-emerald-500 to-teal-600"
                href="/pages/admin/revenue"
              />
              <QuickActionCard
                title="Expense Management"
                description="Track and manage expenses"
                icon="💳"
                gradient="from-amber-500 to-orange-600"
                href="/pages/admin/expenses"
              />
              <QuickActionCard
                title="Salary Reports"
                description="Employee salary analytics"
                icon="👥"
                gradient="from-blue-500 to-indigo-600"
                href="/pages/admin/salaries"
              />

              <QuickActionCard
                title="Profit Analysis"
                description="Profit & loss statements"
                icon="📈"
                gradient="from-green-500 to-emerald-600"
                onClick={() => toast.success("Opening profit analysis...")}
              />
              <QuickActionCard
                title="Export Reports"
                description="Download financial data"
                icon="📥"
                gradient="from-gray-500 to-slate-600"
                onClick={() => toast.success("Preparing exports...")}
              />
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <SimpleChart
              title="🏆 Top Sales Performance"
              data={salesChartData}
            />
            
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Financial Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                  <span className="font-medium text-emerald-700">Revenue</span>
                  <span className="font-bold text-emerald-800">{(revenueData?.totalRevenue || 0).toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl">
                  <span className="font-medium text-amber-700">Expenses</span>
                  <span className="font-bold text-amber-800">{(profitData?.expenses?.total || 0).toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="font-medium text-blue-700">Net Profit</span>
                  <span className="font-bold text-blue-800">{(profitData?.netProfit || 0).toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">📈 Recent Financial Activity</h3>
              <Link href="/pages/admin/financial-reports" className="text-emerald-600 hover:text-emerald-700 font-medium">
                View All →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm text-gray-600">Last Revenue Update</div>
                <div className="font-bold text-emerald-600">Today</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm text-gray-600">Reports Generated</div>
                <div className="font-bold text-blue-600">5 Today</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm text-gray-600">Profit Margin</div>
                <div className="font-bold text-amber-600">{profitData?.profitMargin || 0}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceAdmin;