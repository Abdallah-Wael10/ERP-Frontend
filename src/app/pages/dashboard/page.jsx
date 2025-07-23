"use client";
import React, { useEffect, useState } from "react";
import { useGetDashboardQuery } from "@/app/services/apis/dashboardApi";
import { useGetCurrentUserQuery } from "@/app/services/apis/authApi";
import { getAuthToken } from "@/app/utils/page";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Aside from "@/app/components/aside/page";
import Loading from "@/app/components/loading/page";

const Dashboard = () => {
  const router = useRouter();

  // Get current user data
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  // Get dashboard data
  const {
    data: dashboardData,
    isLoading: dashLoading,
    error: dashError,
  } = useGetDashboardQuery();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/");
      return;
    }
  }, [router]);

  // Loading state
  if (userLoading || dashLoading) {
    return (
      <Loading
        type="dashboard"
        message="Loading your dashboard..."
        submessage="Preparing your personalized experience"
        size="large"
      />
    );
  }

  // Error state
  if (userError || dashError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-2xl border border-red-100 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            {userError?.data?.message ||
              dashError?.data?.message ||
              "Something went wrong while loading your dashboard"}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <Aside userRole={userData?.role} key={userData?._id} />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {getRoleDisplayName(userData?.role)} Dashboard
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Welcome back,{" "}
                <span className="text-blue-600">{userData?.fullName}</span>! 👋
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded-full text-white font-medium shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {getRoleDisplayName(userData?.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {renderDashboardContent(userData?.role, dashboardData)}
        </div>
      </div>
    </div>
  );
};

// Helper function to get role display name
function getRoleDisplayName(role) {
  const roleNames = {
    superadmin: "Super Admin",
    hr: "HR Manager",
    salesManager: "Sales Manager",
    sales: "Sales Representative",
    inventory: "Inventory Manager",
    finance: "Finance Manager",
    employee: "Employee",
  };
  return roleNames[role] || "User";
}

// Helper function to render dashboard content based on role
function renderDashboardContent(role, data) {
  if (!data) {
    return (
      <Loading
        type="simple"
        message="Loading dashboard data..."
        submessage="Fetching latest information"
        size="medium"
      />
    );
  }

  switch (role) {
    case "superadmin":
      return <SuperAdminDashboard data={data} />;
    case "hr":
      return <HRDashboard data={data} />;
    case "salesManager":
      return <SalesManagerDashboard data={data} />;
    case "sales":
      return <SalesDashboard data={data} />;
    case "inventory":
      return <InventoryDashboard data={data} />;
    case "finance":
      return <FinanceDashboard data={data} />;
    case "employee":
      return <EmployeeDashboard data={data} />;
    default:
      return (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">❓</span>
          </div>
          <p className="text-gray-500 text-lg">Unknown role detected</p>
        </div>
      );
  }
}

// SuperAdmin Dashboard Component
function SuperAdminDashboard({ data }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">System Overview</h2>
        <p className="text-blue-100">
          Complete control and monitoring of your ERP system
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total Users"
          value={data.overview?.totalUsers || 0}
          icon="👥"
          gradient="from-blue-500 to-blue-600"
          change="+12%"
          changeType="positive"
        />
        <ModernStatsCard
          title="Total Customers"
          value={data.overview?.totalCustomers || 0}
          icon="🏢"
          gradient="from-green-500 to-green-600"
          change="+8%"
          changeType="positive"
        />
        <ModernStatsCard
          title="Total Products"
          value={data.overview?.totalProducts || 0}
          icon="📦"
          gradient="from-purple-500 to-purple-600"
          change="+5%"
          changeType="positive"
        />
        <ModernStatsCard
          title="Total Revenue"
          value={`$${(data.overview?.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
          gradient="from-yellow-500 to-orange-500"
          change="+15%"
          changeType="positive"
        />
      </div>

      {/* Orders Overview */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Orders Management
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live Data
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <OrderStatusCard
            title="Pending"
            value={data.orders?.pending || 0}
            icon="⏳"
            color="orange"
            percentage={25}
          />
          <OrderStatusCard
            title="Confirmed"
            value={data.orders?.confirmed || 0}
            icon="✅"
            color="green"
            percentage={45}
          />
          <OrderStatusCard
            title="Shipped"
            value={data.orders?.shipped || 0}
            icon="🚚"
            color="blue"
            percentage={25}
          />
          <OrderStatusCard
            title="Cancelled"
            value={data.orders?.cancelled || 0}
            icon="❌"
            color="red"
            percentage={5}
          />
        </div>
      </div>
    </div>
  );
}

// HR Dashboard Component
function HRDashboard({ data }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Human Resources</h2>
        <p className="text-green-100">
          Manage your workforce and employee relations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModernStatsCard
          title="Total Employees"
          value={data.employees?.total || 0}
          icon="👥"
          gradient="from-blue-500 to-blue-600"
        />
        <ModernStatsCard
          title="Present Today"
          value={data.attendance?.today || 0}
          icon="✅"
          gradient="from-green-500 to-green-600"
        />
        <ModernStatsCard
          title="Pending Leaves"
          value={data.leaves?.pending || 0}
          icon="📝"
          gradient="from-orange-500 to-orange-600"
        />
        <ModernStatsCard
          title="Approved Leaves"
          value={data.leaves?.approved || 0}
          icon="✅"
          gradient="from-green-500 to-green-600"
        />
        <ModernStatsCard
          title="Rejected Leaves"
          value={data.leaves?.rejected || 0}
          icon="❌"
          gradient="from-red-500 to-red-600"
        />
        <ModernStatsCard
          title="Total Payroll"
          value={`$${((data.employees?.total || 0) * 5000).toLocaleString()}`}
          icon="💰"
          gradient="from-yellow-500 to-orange-500"
        />
      </div>
    </div>
  );
}

// Sales Manager Dashboard Component
function SalesManagerDashboard({ data }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Sales Management</h2>
        <p className="text-purple-100">Lead your sales team to success</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Team Members"
          value={data.overview?.salesTeamSize || 0}
          icon="👨‍💼"
          gradient="from-blue-500 to-blue-600"
        />
        <ModernStatsCard
          title="Total Customers"
          value={data.overview?.totalCustomers || 0}
          icon="🏢"
          gradient="from-green-500 to-green-600"
        />
        <ModernStatsCard
          title="Total Orders"
          value={data.overview?.totalOrders || 0}
          icon="📋"
          gradient="from-purple-500 to-purple-600"
        />
        <ModernStatsCard
          title="Team Revenue"
          value={`$${(data.overview?.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
          gradient="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Orders to Review */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Orders Requiring Action
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            title="To Confirm"
            value={data.orders?.pending || 0}
            icon="⏳"
            color="orange"
            action="Review Now"
          />
          <ActionCard
            title="To Review"
            value={data.orders?.confirmed || 0}
            icon="👀"
            color="blue"
            action="Take Action"
          />
        </div>
      </div>
    </div>
  );
}

// Sales Dashboard Component
function SalesDashboard({ data }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Sales Performance</h2>
        <p className="text-indigo-100">
          Track your sales activities and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="My Customers"
          value={data.overview?.myCustomers || 0}
          icon="👥"
          gradient="from-blue-500 to-blue-600"
        />
        <ModernStatsCard
          title="My Orders"
          value={data.overview?.myOrders || 0}
          icon="📋"
          gradient="from-green-500 to-green-600"
        />
        <ModernStatsCard
          title="My Revenue"
          value={`$${(data.overview?.myRevenue || 0).toLocaleString()}`}
          icon="💰"
          gradient="from-yellow-500 to-orange-500"
        />
        <ModernStatsCard
          title="Pending Orders"
          value={data.orders?.pending || 0}
          icon="⏳"
          gradient="from-orange-500 to-orange-600"
        />
      </div>
    </div>
  );
}

// Inventory Dashboard Component
function InventoryDashboard({ data }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Inventory Management</h2>
        <p className="text-teal-100">
          Monitor stock levels and warehouse operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total Products"
          value={data.products?.total || 0}
          icon="📦"
          gradient="from-blue-500 to-blue-600"
        />
        <ModernStatsCard
          title="Low Stock"
          value={data.products?.lowStock || 0}
          icon="⚠️"
          gradient="from-orange-500 to-orange-600"
        />
        <ModernStatsCard
          title="Out of Stock"
          value={data.products?.outOfStock || 0}
          icon="❌"
          gradient="from-red-500 to-red-600"
        />
        <ModernStatsCard
          title="Ready to Ship"
          value={data.orders?.toShip || 0}
          icon="🚚"
          gradient="from-green-500 to-green-600"
        />
      </div>
    </div>
  );
}

// Finance Dashboard Component
function FinanceDashboard({ data }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
        <p className="text-emerald-100">
          Monitor revenue, expenses, and financial health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModernStatsCard
          title="Total Revenue"
          value={`$${(data.revenue?.total || 0).toLocaleString()}`}
          icon="💰"
          gradient="from-green-500 to-green-600"
        />
        <ModernStatsCard
          title="This Month"
          value={`$${(data.revenue?.thisMonth || 0).toLocaleString()}`}
          icon="📅"
          gradient="from-blue-500 to-blue-600"
        />
        <ModernStatsCard
          title="Total Expenses"
          value={`$${(data.expenses?.totalPayroll || 0).toLocaleString()}`}
          icon="💸"
          gradient="from-red-500 to-red-600"
        />
      </div>
    </div>
  );
}

// Employee Dashboard Component
function EmployeeDashboard({ data }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-600 to-gray-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">My Workspace</h2>
        <p className="text-slate-100">
          Track your attendance, leaves, and work progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModernStatsCard
          title="My Attendance"
          value={data.attendance?.thisMonth || 0}
          icon="📅"
          gradient="from-blue-500 to-blue-600"
        />
        <ModernStatsCard
          title="My Leaves"
          value={data.leaves?.total || 0}
          icon="🏖️"
          gradient="from-green-500 to-green-600"
        />
        <ModernStatsCard
          title="Pending Leaves"
          value={data.leaves?.pending || 0}
          icon="⏳"
          gradient="from-orange-500 to-orange-600"
        />
        <ModernStatsCard
          title="Approved Leaves"
          value={data.leaves?.approved || 0}
          icon="✅"
          gradient="from-green-500 to-green-600"
        />
      </div>
    </div>
  );
}

// Modern Stats Card Component
function ModernStatsCard({ title, value, icon, gradient, change, changeType }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
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

// Order Status Card Component
function OrderStatusCard({ title, value, icon, color, percentage }) {
  const colorClasses = {
    orange: "bg-orange-100 border-orange-200 text-orange-800",
    green: "bg-green-100 border-green-200 text-green-800",
    blue: "bg-blue-100 border-blue-200 text-blue-800",
    red: "bg-red-100 border-red-200 text-red-800",
  };

  const barColors = {
    orange: "bg-orange-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
  };

  return (
    <div className={`${colorClasses[color]} rounded-2xl p-6 border-2`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h4 className="font-medium mb-3">{title}</h4>
      <div className="w-full bg-white/50 rounded-full h-2">
        <div
          className={`${barColors[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ title, value, icon, color, action }) {
  const colorClasses = {
    orange: "from-orange-500 to-orange-600",
    blue: "from-blue-500 to-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-3`}
        >
          <span className="text-xl text-white">{icon}</span>
        </div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <h4 className="font-medium text-gray-800 mb-3">{title}</h4>
      <button
        className={`w-full bg-gradient-to-r ${colorClasses[color]} text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200`}
      >
        {action}
      </button>
    </div>
  );
}

export default Dashboard;
