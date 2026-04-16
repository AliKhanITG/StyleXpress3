"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Grid3x3 } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { api } from "@/Lib/Api";

export default function RolePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data } = await api.get(`/api/roles/${roleId}/menu-permissions`);
        setRoleName(data.roleName);
        setPermissions(data.permissions || []);
      } catch (err) {
        setError("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      fetchPermissions();
    }
  }, [roleId]);

  const togglePermission = (menuId, permType) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.menuID === menuId ? { ...p, [permType]: !p[permType] } : p
      )
    );
  };

  const toggleAll = (menuId) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.menuID === menuId) {
          const allChecked = p.canView && p.canCreate && p.canEdit && p.canDelete && p.canApprove && p.canExport;
          return {
            ...p,
            canView: !allChecked,
            canCreate: !allChecked,
            canEdit: !allChecked,
            canDelete: !allChecked,
            canApprove: !allChecked,
            canExport: !allChecked,
          };
        }
        return p;
      })
    );
  };

  const grantAll = () => {
    setPermissions((prev) =>
      prev.map((p) => ({
        ...p,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canExport: true,
      }))
    );
  };

  const clearAll = () => {
    setPermissions((prev) =>
      prev.map((p) => ({
        ...p,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canApprove: false,
        canExport: false,
      }))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        Permissions: permissions.map((p) => ({
          MenuID: p.menuID,
          CanView: p.canView,
          CanCreate: p.canCreate,
          CanEdit: p.canEdit,
          CanDelete: p.canDelete,
          CanApprove: p.canApprove,
          CanExport: p.canExport,
        })),
      };

      await api.post(`/api/roles/${roleId}/menu-permissions`, payload);
      setSuccess("Permissions saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <TopBar title="Role Permissions" subtitle="Manage menu access" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  // Group permissions by parent menu
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.menuLabel?.includes("Master Data") ? "Master Data" : 
                     perm.menuLabel?.includes("User") || perm.menuLabel?.includes("Role") || 
                     perm.menuLabel?.includes("Department") || perm.menuLabel?.includes("Designation") ? "User Management" : "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {});

  const visibleMenus = permissions.length;

  return (
    <div>
      <TopBar 
        title={`Permissions: ${roleName}`} 
        subtitle="Manage module access and actions for the role" 
      />

      <div className="p-6 max-w-7xl">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 text-slate-500" 
          onClick={() => router.push("/roles")}
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
        </Button>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 mb-4">
            {success}
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5">
                <Grid3x3 className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <CardTitle>Menu Permissions</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{visibleMenus} of {permissions.length} menus visible</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={grantAll}>
                Grant All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-red-500 hover:bg-red-600">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Permissions</>}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      MENU / MODULE
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider">
                      VIEW
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-600 uppercase tracking-wider">
                      CREATE
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-amber-600 uppercase tracking-wider">
                      EDIT
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider">
                      DELETE
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-purple-600 uppercase tracking-wider">
                      APPROVE
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-cyan-600 uppercase tracking-wider">
                      EXPORT
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                      ALL
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(groupedPermissions).map(([category, menus]) => (
                    <>
                      <tr key={category} className="bg-slate-50">
                        <td colSpan={8} className="px-6 py-2 font-semibold text-slate-700 text-sm">
                          {category}
                        </td>
                      </tr>
                      {menus.map((perm) => (
                        <tr key={perm.menuID} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{perm.menuLabel}</p>
                              <p className="text-xs text-slate-500">{perm.menuRoute}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canView}
                              onChange={() => togglePermission(perm.menuID, "canView")}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canCreate}
                              onChange={() => togglePermission(perm.menuID, "canCreate")}
                              className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canEdit}
                              onChange={() => togglePermission(perm.menuID, "canEdit")}
                              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canDelete}
                              onChange={() => togglePermission(perm.menuID, "canDelete")}
                              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canApprove}
                              onChange={() => togglePermission(perm.menuID, "canApprove")}
                              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={perm.canExport}
                              onChange={() => togglePermission(perm.menuID, "canExport")}
                              className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={
                                perm.canView &&
                                perm.canCreate &&
                                perm.canEdit &&
                                perm.canDelete &&
                                perm.canApprove &&
                                perm.canExport
                              }
                              onChange={() => toggleAll(perm.menuID)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                  {permissions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        No menus found
                      </td>
                    </tr>
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
