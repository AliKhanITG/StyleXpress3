"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Copy, Loader2, Plus, Search, BookOpen, Trash2 } from "lucide-react";
import { api } from "@/Lib/Api";
import { formatDate } from "@/Lib/Utils";
import { TopBar } from "@/Components/Layout/TopBar";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
import Swal from "sweetalert2";

function CatalogsPageContent() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [search, customerId]);

  const fetchCatalogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize };
      if (search) params.search = search;
      if (customerId) params.customerId = customerId;
      const res = await api.get("/api/catalogs", { params });
      setData(res.data);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [page, pageSize, search, customerId]);

  useEffect(() => { void fetchCatalogs(); }, [fetchCatalogs]);

  useEffect(() => {
    api.get("/api/customers").then(({ data }) => {
      setCustomers(Array.isArray(data) ? data : data.items || []);
    }).catch(() => {});
  }, []);

  const handleDelete = async (catalog) => {
    const result = await Swal.fire({
      title: "Delete Catalog?",
      html: `Are you sure you want to delete <strong>${catalog.catalogName}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    setDeleting(catalog.id);
    try {
      await api.delete(`/api/catalogs/${catalog.id}`);
      await fetchCatalogs();
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete catalog." });
    } finally { setDeleting(null); }
  };

  const handleCopy = (catalogURL) => {
    const fullUrl = `${window.location.origin}/${catalogURL}`;
    navigator.clipboard.writeText(fullUrl);
    Swal.fire({ icon: "success", title: "Link Copied!", html: `<span class="text-sm text-gray-500 break-all">${fullUrl}</span>`, timer: 2000, showConfirmButton: false });
  };

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="min-h-full bg-slate-50">
      <TopBar title="Catalogs" subtitle="Manage your product catalogs" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search catalogs..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
            </div>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-slate-400">
              <option value="">All Customers</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.customerName}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/Marketplace" target="_blank"><Plus className="h-4 w-4" /> New Catalog</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading catalogs…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/60">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">No catalogs found</p>
              <p className="mt-1 text-sm text-slate-500">Create your first catalog to get started</p>
            </div>
            <Button asChild>
              <Link href="/Marketplace" target="_blank"><Plus className="h-4 w-4" /> New Catalog</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Customer</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">AI</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-slate-900">{c.catalogName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{c.customer?.customerName || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-slate-500">{c.isAIGenerated ? "AI" : "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/${c.catalogURL}`} target="_blank"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="View">
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button onClick={() => handleCopy(c.catalogURL)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Copy Link">
                              <Copy className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(c)} disabled={deleting === c.id}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer" title="Delete">
                              {deleting === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">Showing {items.length} of {data?.total ?? 0} catalogs</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="px-3 text-sm text-slate-600">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CatalogsPage() {
  return <CatalogsPageContent />;
}
