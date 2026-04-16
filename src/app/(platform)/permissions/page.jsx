"use client";

import { useCallback, useEffect, useState } from "react";
import { Key, Loader2 } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/Ui/Card";
import { Badge } from "@/Components/Ui/Badge";
import { api } from "@/Lib/Api";

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data) {
    return Array.isArray(data.items) ? data.items : [];
  }
  return [];
}

export default function PermissionsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/permissions");
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

  const columns = items.length > 0
    ? Object.keys(items[0]).filter((k) => k !== "id" && !k.endsWith("At"))
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Permissions" subtitle="View permission matrix" />
      <div className="p-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base text-slate-900">Permissions</CardTitle>
              <Badge variant="secondary" className="font-normal">{items.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {columns.length > 0 ? (
                      columns.map((col) => (
                        <th key={col} className="px-4 py-3">
                          {col.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim()}
                        </th>
                      ))
                    ) : (
                      <>
                        <th className="px-4 py-3">Permission</th>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3">Action</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={Math.max(columns.length, 3)} className="px-4 py-10 text-center text-slate-500">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={Math.max(columns.length, 3)} className="px-4 py-10 text-center text-slate-500">
                        No permissions found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id ?? idx} className="hover:bg-slate-50/80">
                        {columns.map((col, ci) => {
                          const val = item[col];
                          const isBool = typeof val === "boolean";
                          return (
                            <td key={col} className="px-4 py-3 text-slate-700">
                              {isBool ? (
                                <Badge variant={val ? "success" : "secondary"} className="font-normal">
                                  {val ? "Yes" : "No"}
                                </Badge>
                              ) : ci === 0 ? (
                                <span className="font-medium text-slate-900">{val ?? "—"}</span>
                              ) : (
                                <span>{val ?? "—"}</span>
                              )}
                            </td>
                          );
                        })}
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
