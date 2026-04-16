"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/Lib/Api";

export default function NewCatalogPage() {
  const router = useRouter();
  const [catalogName, setCatalogName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get("/api/customers").then(({ data }) => setCustomers(Array.isArray(data) ? data : data.items || [])).catch(() => {});
    api.get("/api/products", { params: { pageSize: 100 } }).then(({ data }) => setProducts(data.items || [])).catch(() => {});
  }, []);

  const toggleProduct = (id) => {
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catalogName.trim()) return;
    setCreating(true);
    try {
      await api.post("/api/catalogs", {
        catalogName: catalogName.trim(),
        customerID: customerId ? parseInt(customerId) : null,
        isPublic,
        emailTo: emailTo.trim() || null,
        emailCc: emailCc.trim() || null,
        productIds: selectedProducts,
      });
      router.push("/catalogs");
    } catch {
      alert("Failed to create catalog.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">New Catalog</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catalog Name *</label>
          <input type="text" value={catalogName} onChange={(e) => setCatalogName(e.target.value)} required
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-slate-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-slate-400">
            <option value="">Select customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.customerName}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email To</label>
            <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-slate-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email CC</label>
            <input type="email" value={emailCc} onChange={(e) => setEmailCc(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-slate-400" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
          Make catalog public
        </label>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Products</label>
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 text-sm cursor-pointer">
                <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} className="rounded" />
                <span className="font-medium text-slate-800">{p.productStyleNo}</span>
                <span className="text-slate-400 text-xs">{p.productStyleID}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={creating || !catalogName.trim()}
            className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-40 cursor-pointer">
            {creating ? "Creating..." : "Create Catalog"}
          </button>
          <button type="button" onClick={() => router.push("/catalogs")}
            className="px-5 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
