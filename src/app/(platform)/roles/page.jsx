"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, Key } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/Ui/Card";
import { Badge } from "@/Components/Ui/Badge";
import { Button } from "@/Components/Ui/Button";
import { api } from "@/Lib/Api";
import { useRouter } from "next/navigation";

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data) {
    return Array.isArray(data.items) ? data.items : [];
  }
  return [];
}

export default function RolesPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/roles");
      setItems(extractList(data));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Roles" subtitle="View user roles" />
      <div className="p-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Roles</CardTitle>
              <Badge variant="secondary" className="font-normal">{items.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Role Name</th>
                    <th className="px-4 py-3">Role Code</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Actions</th>
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
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                        No roles found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.roleName ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <Badge variant="outline" className="font-mono text-xs">
                            {item.roleCode ?? "—"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.roleDescription ?? item.description ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/roles/${item.id}`)}
                          >
                            <Key className="h-3.5 w-3.5 mr-1" /> Permissions
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
