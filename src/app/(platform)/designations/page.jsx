"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
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

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data) {
    return Array.isArray(data.items) ? data.items : [];
  }
  return [];
}

const selectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400";

export default function DesignationsPage() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/designations");
      setItems(extractList(data));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
    api.get("/api/departments")
      .then((r) => setDepartments(extractList(r.data)))
      .catch(() => setDepartments([]));
  }, [loadItems]);

  const deptName = (id) => departments.find((d) => String(d.id) === String(id))?.departmentName ?? id ?? "—";

  const openNew = () => {
    setEditingItem(null);
    setFormData({ designationName: "", departmentID: "" });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      designationName: item.designationName ?? "",
      departmentID: item.departmentID ?? item.departmentId ?? "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const saveItem = async () => {
    if (!String(formData.designationName ?? "").trim()) return;
    setSaving(true);
    try {
      const body = { designationName: formData.designationName.trim() };
      if (formData.departmentID) body.departmentID = formData.departmentID;

      if (editingItem) {
        await api.put(`/api/designations/${editingItem.id}`, body);
      } else {
        await api.post("/api/designations", body);
      }
      await loadItems();
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete designation "${item.designationName}"?`)) return;
    try {
      await api.delete(`/api/designations/${item.id}`);
      await loadItems();
    } catch {
      window.alert("Delete failed.");
    }
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Designations" subtitle="Manage job designations" />
      <div className="p-6 space-y-4">
        {formOpen && (
          <Card className="border-indigo-200 bg-white shadow-md ring-1 ring-indigo-100">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base text-slate-900">
                  {editingItem ? "Edit Designation" : "Add Designation"}
                </CardTitle>
                <CardDescription>Fill in the designation details below.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Designation Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.designationName ?? ""}
                    onChange={(e) => updateField("designationName", e.target.value)}
                    placeholder="Designation name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Department</label>
                  <select
                    value={formData.departmentID ?? ""}
                    onChange={(e) => updateField("departmentID", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Select —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="button" onClick={() => void saveItem()} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Designations</CardTitle>
              <Badge variant="secondary" className="font-normal">{items.length}</Badge>
            </div>
            <Button size="sm" onClick={openNew} disabled={formOpen}>
              <Plus className="h-3.5 w-3.5" />
              Add New
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Designation Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                        No designations yet. Click &quot;Add New&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.designationName ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <Badge variant="secondary" className="font-normal">
                            {deptName(item.departmentID ?? item.departmentId)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => openEdit(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600 hover:text-red-700"
                            onClick={() => void deleteItem(item)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
