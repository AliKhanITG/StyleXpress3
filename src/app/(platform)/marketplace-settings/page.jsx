"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Image as ImageIcon, Loader2, Pencil, Plus, Trash2, X,
  Settings, GripVertical, Eye, EyeOff, Upload,
} from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
import { Badge } from "@/Components/Ui/Badge";
import { api } from "@/Lib/Api";
import { cn } from "@/Lib/Utils";

const TABS = [
  { id: "sliders", label: "Slider Settings", icon: ImageIcon },
];

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data)
    return Array.isArray(data.items) ? data.items : [];
  return [];
}

const selectClass =
  "flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400";

export default function MarketplaceSettingsPage() {
  const [activeTab, setActiveTab] = useState("sliders");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/sliders");
      setItems(extractList(data));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openNew = () => {
    setEditingItem(null);
    setFormData({ sliderName: "", file: null, sortOrder: 0, isActive: true });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      sliderName: item.sliderName ?? "",
      file: null,
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true,
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const saveItem = async () => {
    if (!String(formData.sliderName ?? "").trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("sliderName", formData.sliderName.trim());
      fd.append("sortOrder", String(Number(formData.sortOrder) || 0));
      fd.append("isActive", String(formData.isActive));
      if (formData.file) fd.append("file", formData.file);

      if (editingItem) {
        await api.put(`/api/sliders/${editingItem.id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/api/sliders", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      await loadItems();
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete slider "${item.sliderName}"?`)) return;
    try {
      await api.delete(`/api/sliders/${item.id}`);
      await loadItems();
    } catch {
      window.alert("Delete failed.");
    }
  };

  const updateField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        title="Marketplace Settings"
        subtitle="Configure your marketplace storefront"
      />
      <div className="p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-white border border-slate-200 p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add / Edit Form */}
        {formOpen && (
          <Card className="border-indigo-200 bg-white shadow-md ring-1 ring-indigo-100">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base text-slate-900">
                  {editingItem ? "Edit Slider" : "Add Slider"}
                </CardTitle>
                <CardDescription>
                  Fill in the slider details below.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Slider Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.sliderName ?? ""}
                    onChange={(e) => updateField("sliderName", e.target.value)}
                    placeholder="e.g. Summer Collection 2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Slider Image {!editingItem && <span className="text-red-500">*</span>}
                  </label>
                  <label className="flex items-center gap-2 h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-500 shadow-xs cursor-pointer hover:border-indigo-300 transition-colors">
                    <Upload className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate">{formData.file?.name || (editingItem?.sliderImageUrl ? "Change image..." : "Choose image...")}</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif"
                      className="hidden"
                      onChange={(e) => updateField("file", e.target.files?.[0] || null)}
                    />
                  </label>
                  {editingItem?.sliderImageUrl && !formData.file && (
                    <p className="text-xs text-slate-400 truncate">Current: {editingItem.sliderImageUrl}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    value={formData.sortOrder ?? 0}
                    onChange={(e) =>
                      updateField("sortOrder", Number(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      updateField("isActive", e.target.value === "true")
                    }
                    className={selectClass}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button onClick={() => void saveItem()} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slider List */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">
                Sliders
              </CardTitle>
              <Badge variant="secondary" className="font-normal">
                {items.length}
              </Badge>
            </div>
            <Button size="sm" onClick={openNew} disabled={formOpen}>
              <Plus className="h-3.5 w-3.5" />
              Add Slider
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Slider Name</th>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3 w-20">Order</th>
                    <th className="px-4 py-3 w-24">Status</th>
                    <th className="px-4 py-3 text-right w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No sliders yet. Click &quot;Add Slider&quot; to create
                        one.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 group"
                      >
                        <td className="px-4 py-3 text-slate-400">
                          <GripVertical className="h-3.5 w-3.5 inline" />{" "}
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.sliderName ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.sliderImageUrl ? (
                            <img
                              src={item.sliderImageUrl}
                              alt={item.sliderName}
                              className="h-10 w-20 object-cover rounded border border-slate-200"
                            />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.sortOrder}
                        </td>
                        <td className="px-4 py-3">
                          {item.isActive ? (
                            <Badge variant="success">
                              <Eye className="h-3 w-3 mr-1" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" /> Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => openEdit(item)}
                          >
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
