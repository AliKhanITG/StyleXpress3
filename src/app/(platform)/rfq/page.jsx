"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Loader2, Plus, Search } from "lucide-react";
import { api } from "@/Lib/Api";
import { cn, formatCurrency, formatDate } from "@/Lib/Utils";
import { TopBar } from "@/Components/Layout/TopBar";
import { Badge } from "@/Components/Ui/Badge";
import { Button } from "@/Components/Ui/Button";
import { Card, CardContent } from "@/Components/Ui/Card";
import { Input } from "@/Components/Ui/Input";
const RFQ_STATUSES = [
  "",
  "Draft",
  "Submitted",
  "UnderReview",
  "Approved",
  "Rejected",
  "Closed",
];

function unwrapRfqs(data) {
  if (data && typeof data === "object" && "items" in data) {
    return { items: data.items ?? [], total: data.total ?? 0 };
  }
  if (Array.isArray(data)) return { items: data, total: data.length };
  return { items: [], total: 0 };
}

function statusBadgeVariant(status) {
  switch (status) {
    case "Draft":
      return "secondary";
    case "Submitted":
      return "blue";
    case "UnderReview":
      return "warning";
    case "Approved":
      return "success";
    case "Rejected":
      return "destructive";
    case "Closed":
      return "secondary";
    default:
      return "secondary";
  }
}

const PAGE_SIZE = 10;

function RFQPageContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const loadRfqs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/rfq", {
        params: {
          page,
          search: debouncedSearch || undefined,
          status: status || undefined,
        },
      });
      const { items: list, total: t } = unwrapRfqs(data);
      setItems(list);
      setTotal(t);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    void loadRfqs();
  }, [loadRfqs]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE) || 1), [total]);

  const displayRfqNo = (row) => row.rfqNumber ?? row.number ?? row.id.slice(0, 8);

  return (
    <div className="min-h-full bg-slate-50">
      <TopBar title="RFQ Management" />
      <div className="p-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search RFQs..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className={cn(
                    "h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 min-w-[180px]"
                  )}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All statuses</option>
                  {RFQ_STATUSES.filter(Boolean).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Button asChild>
                <Link href="/rfq/new">
                  <Plus className="h-4 w-4" />
                  New RFQ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">RFQ #</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Product style</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Required by</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                        No RFQs found.
                      </td>
                    </tr>
                  ) : (
                    items.map((row) => {
                      const styleLabel =
                        row.product?.styleNo ||
                        row.product?.styleDescription ||
                        "—";
                      const price = row.product?.unitPrice;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">
                            {displayRfqNo(row)}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                          <td className="px-4 py-3 text-slate-600">{row.customer?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{row.supplier?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">
                            <div className="max-w-[200px]">
                              <span className="block truncate">{styleLabel}</span>
                              {price != null && (
                                <span className="text-xs text-slate-500">
                                  List {formatCurrency(price)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-slate-600">{row.quantity}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.requiredBy ? formatDate(row.requiredBy) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/rfq/${row.id}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!loading && items.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                <span>
                  Page {page} of {totalPages} · {total} total
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RFQPage() {
  return <RFQPageContent />;
}
