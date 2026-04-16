"use client";

import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Ui/Card";
import {
  Package, BookOpen, FileText, Workflow, Users, Building2,
  TrendingUp, TrendingDown, ArrowRight, Clock, CheckCircle2,
  AlertCircle, Plus, Zap, BarChart3, Activity, Target
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const monthlyData = [
  { month: "Jan", products: 0, catalogs: 0, rfqs: 0 },
  { month: "Feb", products: 0, catalogs: 0, rfqs: 0 },
  { month: "Mar", products: 0, catalogs: 0, rfqs: 0 },
  { month: "Apr", products: 0, catalogs: 0, rfqs: 0 },
  { month: "May", products: 0, catalogs: 0, rfqs: 0 },
  { month: "Jun", products: 0, catalogs: 0, rfqs: 0 },
];

const statusData = [
  { name: "Done", value: 0, color: "#10b981" },
  { name: "In Progress", value: 0, color: "#6366f1" },
  { name: "To Do", value: 0, color: "#94a3b8" },
  { name: "Review", value: 0, color: "#f59e0b" },
];

const teamData = [
  { name: "Design", tasks: 0, completed: 0 },
  { name: "Merch", tasks: 0, completed: 0 },
  { name: "Sourcing", tasks: 0, completed: 0 },
  { name: "QA", tasks: 0, completed: 0 },
  { name: "Shipping", tasks: 0, completed: 0 },
];

const recentActivity = [
  { id: 1, action: "New product added", item: "Cotton Polo Shirt #2847", time: "2 min ago", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 2, action: "Catalog published", item: "Summer Collection 2026", time: "15 min ago", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 3, action: "RFQ received", item: "Bulk Order — Denim Jackets", time: "1 hour ago", icon: FileText, color: "text-amber-500", bg: "bg-amber-50" },
  { id: 4, action: "Status updated", item: "Order #1842 → Shipped", time: "2 hours ago", icon: CheckCircle2, color: "text-violet-500", bg: "bg-violet-50" },
  { id: 5, action: "New customer onboarded", item: "Nordic Fashion Group", time: "3 hours ago", icon: Users, color: "text-rose-500", bg: "bg-rose-50" },
];

const quickActions = [
  { label: "Add Product", href: "/products/new", icon: Package, desc: "Create new product", gradient: "from-blue-500 to-indigo-500" },
  { label: "Create Catalog", href: "/Marketplace", icon: BookOpen, desc: "Build a catalog", gradient: "from-emerald-500 to-teal-500" },
  { label: "New RFQ", href: "/rfq/new", icon: FileText, desc: "Start a quote", gradient: "from-amber-500 to-orange-500" },
  { label: "New WIP", href: "/wip/new", icon: Workflow, desc: "Track progress", gradient: "from-violet-500 to-purple-500" },
];

function StatCard({ label, value, icon: Icon, trend, trendValue, color, gradient }) {
  const isPositive = trend === "up";
  return (
    <Card className="group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">+{trendValue}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-xs font-semibold">{trendValue}%</span>
                </div>
              )}
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          </div>
          <div className={`rounded-2xl p-3 bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-slate-900 px-4 py-3 shadow-xl border border-slate-700">
      <p className="text-xs font-semibold text-white mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-slate-300">{entry.name}: <span className="font-semibold text-white">{entry.value}</span></span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const stats = [
    { label: "Total Products", value: "00", icon: Package, trend: "up", trendValue: "00", gradient: "from-blue-500 to-indigo-500" },
    { label: "Active Catalogs", value: "00", icon: BookOpen, trend: "up", trendValue: "00", gradient: "from-emerald-500 to-teal-500" },
    { label: "Open RFQs", value: "00", icon: FileText, trend: "up", trendValue: "00", gradient: "from-amber-500 to-orange-500" },
    { label: "Customers", value: "00", icon: Users, trend: "up", trendValue: "00", gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <TopBar title="Dashboard" subtitle="Welcome to StyleLab 3.0" />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 p-4 sm:p-8 text-white animate-fade-in">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-40" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Zap className="h-3 w-3 text-yellow-300" />
                AI-Powered Platform
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Good morning! Here&apos;s your overview</h2>
              <p className="text-indigo-100 text-sm max-w-lg">
                You have <strong className="text-white">00 open tasks</strong> and <strong className="text-white">00 pending RFQs</strong> that need your attention today.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-indigo-200">Effort Remaining</p>
                <p className="text-3xl font-bold">00<span className="text-lg text-indigo-200">h</span></p>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-right">
                <p className="text-xs text-indigo-200">Completion Rate</p>
                <p className="text-3xl font-bold">00<span className="text-lg text-indigo-200">%</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Area Chart - Burndown / Trends */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Growth Overview</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Products, catalogs & RFQs over time</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-500">Products</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Catalogs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-500">RFQs</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradProducts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCatalogs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRfqs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="products" name="Products" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradProducts)" dot={false} activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="catalogs" name="Catalogs" stroke="#10b981" strokeWidth={2} fill="url(#gradCatalogs)" dot={false} activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="rfqs" name="RFQs" stroke="#f59e0b" strokeWidth={2} fill="url(#gradRfqs)" dot={false} activeDot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donut Chart - Task Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Tasks by Status</CardTitle>
              <p className="text-xs text-slate-500">00 total items</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-1 w-full">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-slate-600">{item.name}</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Bar Chart + Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Team Performance */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Tasks per Team</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Assigned vs. completed</p>
                </div>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={teamData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="tasks" name="Assigned" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="completed" name="Completed" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Latest updates across the platform</p>
                </div>
                <Link href="#" className="text-xs font-medium text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {recentActivity.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg} transition-transform duration-200 group-hover:scale-110`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{item.action}</p>
                      <p className="text-xs text-slate-500 truncate">{item.item}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                      <Clock className="h-3 w-3" />
                      <span className="text-[11px]">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Get started quickly with common tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                    <Plus className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
