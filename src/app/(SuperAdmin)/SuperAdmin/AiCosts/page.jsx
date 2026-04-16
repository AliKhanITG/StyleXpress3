"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CalendarRange,
  Coins,
  Hash,
  Layers,
  LineChart,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
import { Badge } from "@/Components/Ui/Badge";
import { api } from "@/Lib/Api";
import { cn, formatCurrency, formatDate, formatNumber } from "@/Lib/Utils";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const FEATURE_ORDER = ["Search", "Chat", "Summarization", "Recommendation"];

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function placeholderSummaries() {
  return [
    {
      tenantId: "demo-tenant",
      totalRequests: 0,
      totalTokens: 0,
      totalCostUsd: 0,
      byFeature: FEATURE_ORDER.map((feature) => ({
        feature,
        requests: 0,
        tokens: 0,
        costUsd: 0,
      })),
    },
  ];
}

function normalizeSummaries(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = row;
    const byFeatureRaw = r.byFeature;
    const byFeature = Array.isArray(byFeatureRaw)
      ? byFeatureRaw.map((f) => {
          const x = f;
          return {
            feature: String(x.feature ?? ""),
            requests: Number(x.requests ?? 0),
            tokens: Number(x.tokens ?? 0),
            costUsd: Number(x.costUsd ?? 0),
          };
        })
      : [];
    return {
      tenantId: String(r.tenantId ?? ""),
      totalRequests: Number(r.totalRequests ?? 0),
      totalTokens: Number(r.totalTokens ?? 0),
      totalCostUsd: Number(r.totalCostUsd ?? 0),
      byFeature,
    };
  });
}

export default function AICostAnalyticsPage() {
  const [{ from, to }, setRange] = useState(defaultRange);
  const [rows, setRows] = useState([]);
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let next = [];
    let placeholder = false;
    try {
      const { data } = await api.get("/api/super-admin/ai-config/cost-summary", {
        params: { from, to },
      });
      next = normalizeSummaries(data);
      if (!next.length) {
        next = placeholderSummaries();
        placeholder = true;
      }
    } catch {
      next = placeholderSummaries();
      placeholder = true;
    }
    setRows(next);
    setUsingPlaceholder(placeholder);

    try {
      const { data: priceData } = await api.get(
        "/api/super-admin/ai-config/model-pricing"
      );
      if (Array.isArray(priceData)) {
        setPricing(priceData);
      } else if (priceData && typeof priceData === "object" && "items" in priceData) {
        const items = priceData.items;
        setPricing(Array.isArray(items) ? items : []);
      } else {
        setPricing([]);
      }
    } catch {
      setPricing([]);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const totalCost = rows.reduce((s, r) => s + r.totalCostUsd, 0);
    const totalRequests = rows.reduce((s, r) => s + r.totalRequests, 0);
    const totalTokens = rows.reduce((s, r) => s + r.totalTokens, 0);
    const avgPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;
    return { totalCost, totalRequests, totalTokens, avgPerRequest };
  }, [rows]);

  const barData = useMemo(
    () =>
      rows.map((r) => ({
        name: r.tenantId.length > 12 ? `${r.tenantId.slice(0, 10)}…` : r.tenantId || "—",
        fullId: r.tenantId,
        cost: r.totalCostUsd,
      })),
    [rows]
  );

  const pieData = useMemo(() => {
    const map = new Map();
    for (const f of FEATURE_ORDER) map.set(f, 0);
    for (const row of rows) {
      for (const bf of row.byFeature) {
        const key = FEATURE_ORDER.includes(bf.feature)
          ? bf.feature
          : bf.feature || "Other";
        map.set(key, (map.get(key) ?? 0) + bf.costUsd);
      }
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const pricingKeys = useMemo(() => {
    if (!pricing.length) return [];
    const keys = new Set();
    for (const row of pricing) {
      Object.keys(row).forEach((k) => keys.add(k));
    }
    return Array.from(keys);
  }, [pricing]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        title="AI Cost Analytics"
        subtitle="Monitor AI usage and costs across all tenants"
      />
      <div className="space-y-6 p-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <CalendarRange className="h-4 w-4 text-slate-500" />
                Date range
              </CardTitle>
              <CardDescription>
                Showing costs from {formatDate(from)} to {formatDate(to)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">From</label>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                  className="h-9 w-40 border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">To</label>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                  className="h-9 w-40 border-slate-200"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Refresh
              </Button>
            </div>
          </CardHeader>
          {usingPlaceholder && (
            <CardContent className="pt-4">
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                No usage recorded for this range (or the request failed). Charts show zeroed
                placeholder data until real traffic appears.
              </p>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total cost",
              value: formatCurrency(totals.totalCost),
              icon: Coins,
              sub: "USD",
            },
            {
              label: "Total requests",
              value: formatNumber(totals.totalRequests),
              icon: Hash,
              sub: "API calls",
            },
            {
              label: "Total tokens",
              value: formatNumber(totals.totalTokens),
              icon: Layers,
              sub: "All tenants",
            },
            {
              label: "Avg cost / request",
              value: formatCurrency(totals.avgPerRequest),
              icon: LineChart,
              sub: "Blended",
            },
          ].map(({ label, value, icon: Icon, sub }) => (
            <Card key={label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="flex items-start justify-between pt-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Cost by tenant</CardTitle>
              <CardDescription>Total spend per tenant in the selected window</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value ?? 0)),
                      "Cost",
                    ]}
                    labelFormatter={(_, payload) => {
                      const p = payload?.[0]?.payload;
                      return p?.fullId ?? "";
                    }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="cost" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Cost by feature</CardTitle>
              <CardDescription>Search, Chat, Summarization, Recommendation</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-slate-200 bg-white shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Tenant breakdown</CardTitle>
              <CardDescription>Requests, tokens, cost, and per-feature usage</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Tenant</th>
                    <th className="px-4 py-3 text-right">Requests</th>
                    <th className="px-4 py-3 text-right">Tokens</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                    <th className="px-4 py-3">Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.tenantId} className="bg-white hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.tenantId}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {formatNumber(row.totalRequests)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {formatNumber(row.totalTokens)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                        {formatCurrency(row.totalCostUsd)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {row.byFeature.length ? (
                            row.byFeature.map((bf) => (
                              <Badge
                                key={`${row.tenantId}-${bf.feature}`}
                                variant="secondary"
                                className={cn(
                                  "max-w-[140px] truncate border-slate-200 bg-slate-100 font-normal text-slate-700"
                                )}
                                title={`${bf.feature}: ${formatCurrency(bf.costUsd)} · ${formatNumber(bf.requests)} req · ${formatNumber(bf.tokens)} tok`}
                              >
                                {bf.feature}: {formatCurrency(bf.costUsd)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                Model pricing
              </CardTitle>
              <CardDescription>Reference rates from the billing configuration</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[420px] space-y-2 overflow-auto text-sm">
              {!pricing.length ? (
                <p className="text-slate-500">No pricing rows returned.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      {pricingKeys.slice(0, 5).map((k) => (
                        <th key={k} className="py-2 pr-2 font-medium capitalize">
                          {k.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pricing.map((row, i) => (
                      <tr key={i}>
                        {pricingKeys.slice(0, 5).map((k) => (
                          <td key={k} className="py-2 pr-2">
                            {row[k] === null || row[k] === undefined
                              ? "—"
                              : String(row[k])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
