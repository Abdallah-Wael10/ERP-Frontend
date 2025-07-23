"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { removeAuthToken } from "@/app/utils/page";
import toast from "react-hot-toast";

const Aside = ({ userRole }) => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleLogout = () => {
    removeAuthToken();
    toast.success("Logged out successfully!");
    router.push("/");
  };

  const handleNavigation = (path, item) => {
    setActiveItem(item);
    router.push(path);
  };

  // Define navigation items based on user role
  const getNavigationItems = (role) => {
    const commonItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "🏠",
        path: "/pages/dashboard",
      },
    ];

    switch (role) {
      case "superadmin":
        return [
          ...commonItems,
          { id: "users", label: "Users", icon: "👥", path: "/pages/users" },
          {
            id: "customers",
            label: "Customers",
            icon: "🏢",
            path: "/pages/admin/customers", // Admin Customers
          },
          {
            id: "products",
            label: "Products",
            icon: "📦",
            path: "/pages/admin/products",
          },
          { id: "orders", label: "Orders", icon: "📋", path: "/pages/admin/orders" },
                    {
            id: "ordersShipping",
            label: "Orders to Ship",
            icon: "🚚",
            path: "/pages/admin/shipping",
          },
          {
            id: "attendance",
            label: "Attendance",
            icon: "⏰",
            path: "/pages/admin/Attendance",
          },
          { id: "leaves", label: "Leaves", icon: "🏖️", path: "/pages/admin/leaves" },
          {
            id: "finance",
            label: "Finance",
            icon: "💰",
            path: "/pages/admin/finance",
          },
        ];

      case "hr":
        return [
          ...commonItems,
          { id: "users", label: "Users", icon: "👥", path: "/pages/users" },
          {
            id: "attendance",
            label: "Attendance",
            icon: "⏰",
            path: "/pages/admin/Attendance",
          },
          {
            id: "attendance",
            label: "My Attendance",
            icon: "⏰",
            path: "/pages/users/my-attendance",
          },
          { id: "leaves", label: "Leaves", icon: "🏖️", path: "/pages/admin/leaves" },
                    {
            id: "leaves",
            label: "My Leaves",
            icon: "🏖️",
            path: "/pages/users/my-leaves",
          },
        ];

      case "salesManager":
        return [
          ...commonItems,
          {
            id: "customers",
            label: "Customers",
            icon: "🏢",
            path: "/pages/admin/customers", // Admin Customers
          },
          { id: "orders", label: "Orders", icon: "📋", path: "/pages/admin/orders" },
                    {
            id: "myOrders",
            label: "My Orders",
            icon: "📋",
            path: "/pages/users/my-orders",
          },
          {
            id: "attendance",
            label: "My Attendance",
            icon: "⏰",
            path: "/pages/users/my-attendance",
          },
          {
            id: "leaves",
            label: "My Leaves",
            icon: "🏖️",
            path: "/pages/users/my-leaves",
          },
        ];

      case "sales":
        return [
          ...commonItems,
          {
            id: "customers",
            label: "My Customers",
            icon: "🏢",
            path: "/pages/users/my-customers", // My Customers
          },
          {
            id: "orders",
            label: "My Orders",
            icon: "📋",
            path: "/pages/users/my-orders",
          },
          {
            id: "attendance",
            label: "My Attendance",
            icon: "⏰",
            path: "/pages/users/my-attendance",
          },
          {
            id: "leaves",
            label: "My Leaves",
            icon: "🏖️",
            path: "/pages/users/my-leaves",
          },
        ];

      case "inventory":
        return [
          ...commonItems,
          {
            id: "products",
            label: "Products",
            icon: "📦",
            path: "/pages/admin/products",
          },
          {
            id: "ordersShipping",
            label: "Orders to Ship",
            icon: "🚚",
            path: "/pages/admin/shipping",
          },
          {
            id: "attendance",
            label: "My Attendance",
            icon: "⏰",
            path: "/pages/users/my-attendance",
          },
          {
            id: "leaves",
            label: "My Leaves",
            icon: "🏖️",
            path: "/pages/users/my-leaves",
          },
        ];

      case "finance":
        return [
          ...commonItems,
          {
            id: "revenue",
            label: "Revenue",
            icon: "💰",
            path: "/pages/admin/revenue",
          },
          {
            id: "expenses",
            label: "Expenses",
            icon: "💸",
            path: "/pages/admin/expenses",
          },
          {
            id: "reports",
            label: "Financial Reports",
            icon: "📊",
            path: "/pages/admin/financial-reports",
          },
          {
            id: "salaries",
            label: "Salaries",
            icon: "💼",
            path: "/pages/admin/salaries",
          },
          {
            id: "attendance",
            label: "My Attendance",
            icon: "⏰",
            path: "/pages/users/my-attendance",
          },
          {
            id: "leaves",
            label: "My Leaves",
            icon: "🏖️",
            path: "/pages/users/my-leaves",
          },
        ];

      case "employee":
        return [
          ...commonItems,
          {
            id: "attendance",
            label: "My Attendance",
            icon: "⏰",
            path: "/pages/users/my-attendance",
          },
          {
            id: "leaves",
            label: "My Leaves",
            icon: "🏖️",
            path: "/pages/users/my-leaves",
          },
        ];

      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems(userRole);

  return (
    <div className="fixed text-black left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">ERP</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">ERP System</h2>
            <p className="text-xs text-gray-500">
              {getRoleDisplayName(userRole)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path, item.id)}
            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
              activeItem === item.id
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="text-lg mr-3">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
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
    sales: "Sales Rep",
    inventory: "Inventory Manager",
    finance: "Finance Manager",
    employee: "Employee",
  };
  return roleNames[role] || "User";
}

export default Aside;
