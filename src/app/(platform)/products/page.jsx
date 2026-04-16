"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Edit, Loader2, Plus, Search, Shirt, Trash2 } from "lucide-react";
import { api } from "@/Lib/Api";
import { formatDate } from "@/Lib/Utils";
import { TopBar } from "@/Components/Layout/TopBar";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
function ProductsPageContent() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize, search };
      const res = await api.get("/api/products", { params });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.productStyleNo}"?\n\nThis action cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      await api.delete(`/api/products/${product.id}`);
      await fetchProducts();
    } catch (err) {
      alert("Failed to delete product. " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(null);
    }
  };

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="min-h-full bg-slate-50">
      <TopBar title="Products" subtitle="Manage your product styles" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search styles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button asChild>
            <Link href="/products/new">
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Loading products…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/60">
              <Shirt className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">No products found</p>
              <p className="mt-1 text-sm text-slate-500">Start by adding your first product style</p>
            </div>
            <Button asChild>
              <Link href="/products/new">
                <Plus className="h-4 w-4" />
                New Product
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Style No</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Style Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Main Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Fabrication</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Supplier</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Author</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Catalog Used</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Upload Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Catalog</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((p) => {
                      const companyId = p.companyID || 1;
                      const imgFile = p.primaryImage;
                      const imgUrl = imgFile ? `/img/products/${companyId}/${imgFile}` : null;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Image */}
                          <td className="px-4 py-3">
                            <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                              {imgUrl ? (
                                <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Shirt className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                          </td>

                          {/* Style No */}
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-slate-900">{p.styleNo || p.productStyleNo}</span>
                          </td>

                          {/* Style Description */}
                          <td className="px-4 py-3 max-w-[200px]">
                            <span className="text-sm text-slate-700 line-clamp-2">
                              {p.styleDescription || p.productStyleDescription || "—"}
                            </span>
                          </td>

                          {/* Main Category */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">{p.category?.categoryName || "—"}</span>
                          </td>

                          {/* Fabrication */}
                          <td className="px-4 py-3 max-w-[150px]">
                            <span className="text-sm text-slate-600 line-clamp-1">{p.mainFabrication || p.fabricComposition || "—"}</span>
                          </td>

                          {/* Supplier */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">{p.supplier?.supplierName || "—"}</span>
                          </td>

                          {/* Author */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600">{p.user?.userName || p.user?.name || "—"}</span>
                          </td>

                          {/* Catalog Used */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-amber-100 text-amber-700 text-xs font-semibold">
                              {p.catalogUsed || 0}
                            </span>
                          </td>

                          {/* Upload Date */}
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-500">{formatDate(p.createdAt)}</span>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link href={`/products/${p.id}`}>
                                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Edit">
                                  <Edit className="h-4 w-4" />
                                </button>
                              </Link>
                              <button 
                                onClick={() => handleDelete(p)}
                                disabled={deleting === p.id}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50" 
                                title="Delete"
                              >
                                {deleting === p.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Catalog */}
                          <td className="px-4 py-3">
                            <button className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium transition-colors">
                              +
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {items.length} of {data?.total ?? 0} products
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="px-3 text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <ProductsPageContent />;
}
