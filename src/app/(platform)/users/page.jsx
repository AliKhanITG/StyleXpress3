"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, UserCog, X } from "lucide-react";
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

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users");
      setItems(extractList(data));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
    Promise.all([
      api.get("/api/roles").then((r) => setRoles(extractList(r.data))).catch(() => setRoles([])),
      api.get("/api/departments").then((r) => setDepartments(extractList(r.data))).catch(() => setDepartments([])),
      api.get("/api/designations").then((r) => setDesignations(extractList(r.data))).catch(() => setDesignations([])),
      api.get("/api/users/statuses").then((r) => setStatuses(Array.isArray(r.data) ? r.data : [])).catch(() => setStatuses([])),
    ]);
  }, [loadItems]);

  const roleName = (id) => roles.find((r) => String(r.id) === String(id))?.roleName ?? id ?? "—";
  const deptName = (id) => departments.find((d) => String(d.id) === String(id))?.departmentName ?? id ?? "—";
  const desigName = (id) => designations.find((d) => String(d.id) === String(id))?.designationName ?? id ?? "—";

  const openNew = () => {
    setEditingItem(null);
    setFormData({
      userName: "",
      userEmail: "",
      userPassword: "",
      roleID: "",
      departmentID: "",
      designationID: "",
      userStatusID: "",
    });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      userName: item.userName ?? "",
      userEmail: item.userEmail ?? "",
      userPassword: "",
      roleID: item.roleID ?? item.roleId ?? "",
      departmentID: item.departmentID ?? item.departmentId ?? "",
      designationID: item.designationID ?? item.designationId ?? "",
      userStatusID: item.userStatusID ?? item.userStatusId ?? "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const saveItem = async () => {
    if (!String(formData.userName ?? "").trim()) return;
    if (!String(formData.userEmail ?? "").trim()) return;
    setSaving(true);
    try {
      const body = {
        userName: formData.userName.trim(),
        userEmail: formData.userEmail.trim(),
      };
      if (formData.roleID) body.roleID = formData.roleID;
      if (formData.departmentID) body.departmentID = formData.departmentID;
      if (formData.designationID) body.designationID = formData.designationID;
      if (formData.userStatusID) body.userStatusID = formData.userStatusID;

      if (!editingItem && formData.userPassword.trim()) {
        body.userPassword = formData.userPassword.trim();
      }

      if (editingItem) {
        await api.put(`/api/users/${editingItem.id}`, body);
      } else {
        await api.post("/api/users", body);
      }
      await loadItems();
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete user "${item.userName}"?`)) return;
    try {
      await api.delete(`/api/users/${item.id}`);
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
      <TopBar title="Users" subtitle="Manage user accounts and access" />
      <div className="p-6 space-y-4">
        {formOpen && (
          <Card className="border-indigo-200 bg-white shadow-md ring-1 ring-indigo-100">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base text-slate-900">
                  {editingItem ? "Edit User" : "Add User"}
                </CardTitle>
                <CardDescription>Fill in the user details below.</CardDescription>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    User Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.userName ?? ""}
                    onChange={(e) => updateField("userName", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.userEmail ?? ""}
                    onChange={(e) => updateField("userEmail", e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                {!editingItem && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600">Password</label>
                    <Input
                      type="password"
                      value={formData.userPassword ?? ""}
                      onChange={(e) => updateField("userPassword", e.target.value)}
                      placeholder="Set password"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Role</label>
                  <select
                    value={formData.roleID ?? ""}
                    onChange={(e) => updateField("roleID", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Select —</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.roleName}</option>
                    ))}
                  </select>
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Designation</label>
                  <select
                    value={formData.designationID ?? ""}
                    onChange={(e) => updateField("designationID", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Select —</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>{d.designationName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Status</label>
                  <select
                    value={formData.userStatusID ?? ""}
                    onChange={(e) => updateField("userStatusID", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Select —</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.statusName}</option>
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
              <UserCog className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Users</CardTitle>
              <Badge variant="secondary" className="font-normal">{items.length}</Badge>
            </div>
            <Button size="sm" onClick={openNew} disabled={formOpen}>
              <Plus className="h-3.5 w-3.5" />
              Add New
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        No users yet. Click &quot;Add New&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.userName ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-700">{item.userEmail ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <Badge variant="blue" className="font-normal">
                            {roleName(item.roleID ?? item.roleId)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{deptName(item.departmentID ?? item.departmentId)}</td>
                        <td className="px-4 py-3 text-slate-700">{desigName(item.designationID ?? item.designationId)}</td>
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
