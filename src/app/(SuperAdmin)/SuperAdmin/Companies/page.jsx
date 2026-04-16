"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Building2, RefreshCw } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
import { Badge } from "@/Components/Ui/Badge";
import { api } from "@/Lib/Api";
import { formatDate } from "@/Lib/Utils";

const statusVariant = {
  Active: "success", Trial: "warning", Suspended: "destructive", Expired: "secondary",
};

const planVariant = {
  Free: "secondary", Starter: "blue", Professional: "purple", Enterprise: "default",
};

export default function CompaniesPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/api/super-admin/companies", {
        params: { page, pageSize: 20, search: search || undefined },
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleSuspend = async (id) => {
    await api.patch(`/api/super-admin/companies/${id}/suspend`);
    fetchCompanies();
  };

  const handleActivate = async (id) => {
    await api.patch(`/api/super-admin/companies/${id}/activate`);
    fetchCompanies();
  };

  return (
    <div>
      <TopBar title="Company Management" subtitle="Manage all client organizations" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCompanies}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" asChild>
              <Link href="/SuperAdmin/Companies/new"><Plus className="h-3.5 w-3.5" /> New Company</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: data?.total ?? 0, color: "text-slate-900" },
            { label: "Active", value: data?.items?.filter(c => c.companyStatus === "Active").length ?? 0, color: "text-emerald-600" },
            { label: "Trial", value: data?.items?.filter(c => c.companyStatus === "Trial").length ?? 0, color: "text-amber-600" },
            { label: "Suspended", value: data?.items?.filter(c => c.companyStatus === "Suspended").length ?? 0, color: "text-red-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="py-4 px-5">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Companies</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.items?.map((company) => (
                      <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <Building2 className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{company.companyName}</p>
                              <p className="text-xs text-slate-500">{company.companySlug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariant[company.companyStatus]}>{company.companyStatus}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={planVariant[company.companyPlan]}>{company.companyPlan}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{company.companyContactEmail}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(company.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/SuperAdmin/Companies/${company.id}`}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            {company.companyStatus === "Active" ? (
                              <Button variant="outline" size="sm" onClick={() => handleSuspend(company.id)} className="text-red-600 hover:text-red-700">Suspend</Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleActivate(company.id)} className="text-emerald-600 hover:text-emerald-700">Activate</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!data?.items?.length) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No companies found. Create your first company to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
