"use client";

import { useEffect, useState } from "react";
import { Building2, Users, Bot, DollarSign, TrendingUp, Activity, Globe, ShieldCheck } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/Ui/Card";
import { Badge } from "@/Components/Ui/Badge";
import { formatCurrency, formatNumber } from "@/Lib/Utils";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats({
      totalCompanies: 1,
      activeCompanies: 0,
      trialCompanies: 1,
      totalUsers: 1,
      totalAICostUsd: 0,
      totalAIRequests: 0,
    });
  }, []);

  const cards = [
    { label: "Total Companies", value: formatNumber(stats?.totalCompanies ?? 0), icon: Building2, color: "text-blue-600", bg: "bg-blue-50", change: "+2 this month" },
    { label: "Active Companies", value: formatNumber(stats?.activeCompanies ?? 0), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", change: "0 suspended" },
    { label: "Trial Companies", value: formatNumber(stats?.trialCompanies ?? 0), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", change: "Expiring soon: 0" },
    { label: "Total Users", value: formatNumber(stats?.totalUsers ?? 0), icon: Users, color: "text-violet-600", bg: "bg-violet-50", change: "Across all companies" },
    { label: "AI Cost (30d)", value: formatCurrency(stats?.totalAICostUsd ?? 0), icon: DollarSign, color: "text-rose-600", bg: "bg-rose-50", change: "vs last month" },
    { label: "AI Requests (30d)", value: formatNumber(stats?.totalAIRequests ?? 0), icon: Bot, color: "text-indigo-600", bg: "bg-indigo-50", change: "Total API calls" },
  ];

  return (
    <div>
      <TopBar title="SuperAdmin Dashboard" subtitle="Platform overview — ITG StyleLab 3.0" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 rounded-xl bg-violet-50 border border-violet-200 px-5 py-4">
          <ShieldCheck className="h-5 w-5 text-violet-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-violet-900">SuperAdmin Access</p>
            <p className="text-xs text-violet-700">You have full platform control. All company data, AI configurations, and system settings are accessible.</p>
          </div>
          <Badge variant="purple" className="ml-auto">SUPER ADMIN</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{card.change}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.bg}`}>
                    <card.icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Create Company", href: "/SuperAdmin/Companies/new", icon: Building2, desc: "Onboard a new client" },
            { label: "Configure AI", href: "/SuperAdmin/AiConfig", icon: Bot, desc: "Set LLM provider & model" },
            { label: "View AI Costs", href: "/SuperAdmin/AiCosts", icon: DollarSign, desc: "Monitor token usage" },
            { label: "Geo Database", href: "/SuperAdmin/Geo", icon: Globe, desc: "Countries & cities data" },
          ].map((action) => (
            <a key={action.label} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <action.icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Information</CardTitle>
            <CardDescription>StyleLab 3.0 — Enterprise AI-Powered SaaS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              {[
                { label: "Version", value: "3.0.0" },
                { label: "Backend", value: ".NET 10" },
                { label: "Frontend", value: "Next.js 16" },
                { label: "Database", value: "SQL Server 2022" },
              ].map((info) => (
                <div key={info.label} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <p className="text-slate-500 text-xs">{info.label}</p>
                  <p className="font-semibold text-slate-900 mt-1">{info.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
