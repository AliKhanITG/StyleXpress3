"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Copy, Trash2, Search, ExternalLink, Calendar, Package, FolderOpen } from "lucide-react";
import { useAuthStore } from "@/store/AuthStore";
import { api } from "@/Lib/Api";
import MarketplaceNav from "@/components/marketplace/MarketplaceNav";
import Swal from "sweetalert2";

export default function MyCatalogsPage() {
  const { isAuthenticated } = useAuthStore();
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/api/marketplace/my-catalogs")
      .then(({ data }) => setCatalogs(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete Catalog?",
      html: `Are you sure you want to delete <strong>${name}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/api/marketplace/my-catalogs/${id}`);
      setCatalogs((prev) => prev.filter((c) => c.id !== id));
      Swal.fire({ icon: "success", title: "Deleted!", text: "Catalog has been deleted.", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete catalog." });
    }
  };

  const handleCopy = (catalogURL) => {
    const fullUrl = `${window.location.origin}/${catalogURL}`;
    navigator.clipboard.writeText(fullUrl);
    Swal.fire({ icon: "success", title: "Link Copied!", html: `<span class="text-sm text-gray-500 break-all">${fullUrl}</span>`, timer: 2500, showConfirmButton: false });
  };

  const filtered = search.trim()
    ? catalogs.filter((c) =>
        c.catalogName.toLowerCase().includes(search.toLowerCase()) ||
        (c.customer || "").toLowerCase().includes(search.toLowerCase())
      )
    : catalogs;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <>
      <MarketplaceNav />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/img/catalog/catalogbg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-indigo-900/60" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">My Catalogs</h1>
            <p className="text-base text-white/60 mt-2 font-light">Save time through Digitization</p>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{catalogs.length}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Total Catalogs</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{catalogs.reduce((s, c) => s + (c.productIDs ? c.productIDs.split(",").filter(Boolean).length : 0), 0)}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Total Products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filtered.length}</span> catalog{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalogs..."
              className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-100 p-5">
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-50 to-slate-50 flex items-center justify-center mb-5">
              <FolderOpen className="h-9 w-9 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No catalogs found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Create your first catalog from the Marketplace by adding products to your cart.</p>
            <Link href="/Marketplace" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
              Go to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const productCount = c.productIDs ? c.productIDs.split(",").filter(Boolean).length : 0;
              return (
                <div key={c.id} className="group relative bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300 overflow-hidden">
                  {/* Top accent */}
                  <div className="h-1 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300" />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate uppercase">{c.catalogName}</h3>
                        {c.customer && (
                          <p className="text-sm text-slate-500 mt-0.5 truncate">{c.customer}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(c.id, c.catalogName)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(c.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {productCount} product{productCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${c.catalogURL}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Catalog
                      </Link>
                      <button
                        onClick={() => handleCopy(c.catalogURL)}
                        className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
