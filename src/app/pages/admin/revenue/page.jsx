"use client";
import React, { useState } from "react";
import {
  useGetTotalRevenueQuery,
  useGetMonthlyRevenueQuery,
  useGetOrdersReportQuery,
  useGetQuarterlyRevenueQuery,
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

const RevenueAdmin = () => {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: totalRevenue } = useGetTotalRevenueQuery();
  const { data: monthlyRevenue } = useGetMonthlyRevenueQuery();
  const { data: ordersReport } = useGetOrdersReportQuery({ status: 'shipped' });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  if (!currentUser) return <Loading />;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-black">
      <Aside userRole={currentUser?.role} key={currentUser?._id} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                💹 Revenue Reports
              </h1>
              <p className="text-gray-600 mt-1">Detailed revenue analysis and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Revenue"
              value={`${(totalRevenue?.totalRevenue || 0).toLocaleString()} EGP`}
              subtitle="All time"
              icon="💰"
              gradient="from-green-500 to-emerald-600"
            />
            <StatsCard
              title="Orders Count"
              value={totalRevenue?.ordersCount || 0}
              subtitle="Completed orders"
              icon="📦"
              gradient="from-blue-500 to-cyan-600"
            />
            <StatsCard
              title="Items Sold"
              value={totalRevenue?.totalItemsSold || 0}
              subtitle="Total products"
              icon="📊"
              gradient="from-purple-500 to-pink-600"
            />
            <StatsCard
              title="Avg Order Value"
              value={`${Math.round((totalRevenue?.totalRevenue || 0) / (totalRevenue?.ordersCount || 1)).toLocaleString()} EGP`}
              subtitle="Per order"
              icon="💎"
              gradient="from-amber-500 to-orange-600"
            />
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Monthly Revenue ({selectedYear})</h3>
            <div className="space-y-4">
              {monthlyRevenue?.months?.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{month.revenue.toLocaleString()} EGP</div>
                    <div className="text-sm text-gray-500">{month.ordersCount} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Revenue */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800">💳 Recent Revenue Orders</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-200/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Sales Person</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ordersReport?.slice(0, 10)?.map((order, index) => (
                    <tr key={order._id} className="hover:bg-green-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">#{order.orderId.slice(-8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{order.customer}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.salesPerson}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">{order.totalAmount.toLocaleString()} EGP</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{order.itemsCount} items</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
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

export default RevenueAdmin;