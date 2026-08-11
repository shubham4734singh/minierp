import { useState, useEffect } from 'react';
import { Users, Package, FileText, TrendingUp, Download, BarChart as BarChartIcon } from 'lucide-react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [statsData, setStatsData] = useState({ 
    totalCustomers: 0, 
    totalProducts: 0, 
    totalChallans: 0, 
    totalRevenue: 0,
    lowStockProducts: [],
    topCustomers: [],
    chartData: [
      { name: 'Mon', sales: 0 },
      { name: 'Tue', sales: 0 },
      { name: 'Wed', sales: 0 },
      { name: 'Thu', sales: 0 },
      { name: 'Fri', sales: 0 },
      { name: 'Sat', sales: 0 },
      { name: 'Sun', sales: 0 }
    ] 
  });

  useEffect(() => {

    api.get('/dashboard')
      .then(res => {
        // Merge the backend response with defaults to prevent crashes
        setStatsData(prev => ({ ...prev, ...res.data }));
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Overview Dashboard</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Your role-based operations overview.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-[#fafafa] dark:bg-[#111] text-zinc-900 dark:text-white border border-black/5 dark:border-white/10 rounded-lg hover:bg-zinc-800 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Customers', stat: statsData.totalCustomers.toString(), icon: Users, color: 'text-zinc-700 dark:text-zinc-300', bg: 'bg-[#fafafa] dark:bg-[#111]' },
          { name: 'Total Products', stat: statsData.totalProducts.toString(), icon: Package, color: 'text-zinc-700 dark:text-zinc-300', bg: 'bg-[#fafafa] dark:bg-[#111]' },
          { name: 'Sales Challans', stat: statsData.totalChallans.toString(), icon: FileText, color: 'text-zinc-700 dark:text-zinc-300', bg: 'bg-[#fafafa] dark:bg-[#111]' },
          { name: 'Total Revenue', stat: `₹${(statsData.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-zinc-700 dark:text-zinc-300', bg: 'bg-[#fafafa] dark:bg-[#111]' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="relative bg-white dark:bg-[#0a0a0a] pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-xl dark:shadow-2xl rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden transition-all hover:shadow-black hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <dt>
                <div className={`absolute rounded-xl ${item.bg} p-3 border border-black/5 dark:border-white/5 shadow-inner`}>
                  <Icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-semibold text-zinc-500 dark:text-zinc-500 truncate">{item.name}</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">{item.stat}</p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Recent Sales Activity</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">Daily transaction volume</p>
            </div>
            <div className="p-2 bg-[#fafafa] dark:bg-[#111] rounded-lg border border-black/5 dark:border-white/5">
              <BarChartIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData.chartData && statsData.chartData.length > 0 ? statsData.chartData : statsData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{fill: '#111'}}
                  contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="sales" fill="#fff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Operations Insights */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 p-6 relative flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Operations Insights
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">Automated weekly analysis</p>
            </div>
            <div className="px-2 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-xs font-bold animate-pulse">
              LIVE
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#111] border border-black/5 dark:border-white/5">
              <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">Revenue Trend</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total revenue is holding steady at ₹{(statsData.totalRevenue || 0).toLocaleString()}. Focus on increasing high-margin product sales this week to hit quarterly targets.</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-1">Customer Acquisition</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">You have {statsData.totalCustomers} active accounts. Top tier customers are ordering consistently. Consider a wholesale discount campaign for dormant accounts.</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300 mb-1">Inventory Health</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Catalog contains {statsData.totalProducts} items. {statsData.lowStockProducts?.length || 0} items require immediate restocking. Pipeline is stable.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#111] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Low Stock Alerts</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">Products at or below minimum stock</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/50">
              <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {statsData.lowStockProducts?.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-500 font-medium">Inventory is healthy. No low stock items.</div>
            ) : (
              statsData.lowStockProducts?.map((product: any) => (
                <div key={product.id} className="p-4 px-6 flex items-center justify-between hover:bg-[#fafafa] dark:hover:bg-white/5 transition-colors">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{product.name}</p>
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-500">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-red-600 dark:text-red-400">{product.currentStock}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Min: {product.minStockAlert}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#111] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Top Customers</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">By lifetime purchase volume</p>
            </div>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {statsData.topCustomers?.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-500 font-medium">No customer data available yet.</div>
            ) : (
              statsData.topCustomers?.map((data: any, idx: number) => (
                <div key={data.customer.id} className="p-4 px-6 flex items-center justify-between hover:bg-[#fafafa] dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-[#fafafa] dark:bg-[#111] border border-black/5 dark:border-white/5 flex items-center justify-center font-bold text-zinc-900 dark:text-white">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{data.customer.businessName || data.customer.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">{data.customer.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{data.totalQuantity}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">Items Bought</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
