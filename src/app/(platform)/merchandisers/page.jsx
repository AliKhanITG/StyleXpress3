"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Loader2, Pencil,
  Plus, Search, Trash2, UserCheck, X,
} from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Button } from "@/Components/Ui/Button";
import { api } from "@/Lib/Api";

const extractList = (d) =>
  Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : [];

const labelCls = "block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1";
const inputCls =
  "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all";

const PAGE_SIZE = 15;
const emptyForm = () => ({ merchandiserName: "" });

export default function MerchandisersPage() {
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyForm());
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState("");

  const load = useCallback(async (pg = 1, q = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/merchandisers", {
        params: { page: pg, pageSize: PAGE_SIZE, search: q || undefined },
      });
      setItems(extractList(data));
      setTotal(data?.total ?? extractList(data).length);
      setPage(pg);
    } catch { setItems([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1, ""); }, [load]);

  const handleSearch = (e) => { const q = e.target.value; setSearch(q); load(1, q); };

  const openNew = () => { setEditing(null); setForm(emptyForm()); setFormErr(""); setFormOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ merchandiserName: item.merchandiserName ?? "" });
    setFormErr(""); setFormOpen(true);
  };
  const closeForm = () => { setFormOpen(false); setEditing(null); setForm(emptyForm()); setFormErr(""); };
  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    const name = form.merchandiserName.trim();
    if (!name) { setFormErr("Merchandiser Name is required."); return; }
    setFormErr(""); setSaving(true);
    try {
      /* UserID & CompanyID are set automatically by the backend from JWT session */
      const body = { MerchandiserName: name };
      if (editing) { await api.put(`/api/merchandisers/${editing.id}`, body); }
      else          { await api.post("/api/merchandisers", body); }
      await load(editing ? page : 1, search);
      closeForm();
    } catch (err) { setFormErr(err?.response?.data?.message ?? "Save failed."); }
    finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.merchandiserName}"?`)) return;
    try { await api.delete(`/api/merchandisers/${item.id}`); await load(page, search); }
    catch { window.alert("Delete failed."); }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Merchandisers" subtitle="Manage merchandiser accounts" />
      <div className="p-6 space-y-4">

        {/* Form */}
        {formOpen && (
          <div className="rounded-xl border border-indigo-200 bg-white shadow-lg ring-1 ring-indigo-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">
                  {editing ? "Edit Merchandiser" : "Add New Merchandiser"}
                </h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  UserID &amp; CompanyID are linked automatically from your session.
                </p>
              </div>
              <button onClick={closeForm} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              {formErr && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{formErr}</div>
              )}
              <div>
                <label className={labelCls}>Merchandiser Name <span className="text-red-500">*</span></label>
                <input className={inputCls} placeholder="e.g. John Smith" value={form.merchandiserName} onChange={setField("merchandiserName")} autoFocus />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                {editing ? "Update" : "Save"} Merchandiser
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <UserCheck className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">Merchandisers</h2>
                <p className="text-[11px] text-slate-500">{total} records</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 transition-all"
                  placeholder="Search merchandisers…" value={search} onChange={handleSearch} />
              </div>
              <Button size="sm" onClick={openNew} disabled={formOpen}>
                <Plus className="h-4 w-4 mr-1" /> Add New
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-3 w-20">#ID</th>
                  <th className="px-6 py-3">Merchandiser Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-500" /></td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    {search ? `No results for "${search}"` : 'No merchandisers yet. Click "Add New" to create one.'}
                  </td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-3.5">
                      <span className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-[11px] font-semibold text-slate-600">#{item.id}</span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{item.merchandiserName}</td>
                    <td className="px-6 py-3.5">
                      {item.isActive !== false
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active</span>
                        : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Inactive</span>}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[12px] text-slate-500">Page {page} of {totalPages} · {total} total</p>
              <div className="flex items-center gap-1">
                <button onClick={() => load(page - 1, search)} disabled={page === 1} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return <button key={pg} onClick={() => load(pg, search)} className={`min-w-[32px] h-8 rounded-lg text-[13px] font-medium transition-colors ${pg === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{pg}</button>;
                })}
                <button onClick={() => load(page + 1, search)} disabled={page === totalPages} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
