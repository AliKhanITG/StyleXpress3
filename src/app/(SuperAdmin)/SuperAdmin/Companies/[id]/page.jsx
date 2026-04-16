"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Building2, Loader2, Save, Package } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
import { api } from "@/Lib/Api";

const schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyContactEmail: z.string().email("Invalid email"),
  companyStatus: z.number().int().min(0).max(3),
  companyPlan: z.number().int().min(0).max(3),
  subscriptionEndsAt: z.string().optional(),
});

const statusOptions = [
  { value: 0, label: "Active", name: "Active" },
  { value: 2, label: "Trial", name: "Trial" },
  { value: 1, label: "Suspended", name: "Suspended" },
  { value: 3, label: "Expired", name: "Expired" },
];

const plans = [
  { value: 0, label: "Free", name: "Free" },
  { value: 1, label: "Starter", name: "Starter" },
  { value: 2, label: "Professional", name: "Professional" },
  { value: 3, label: "Enterprise", name: "Enterprise" },
];

// Helper functions to convert between enum names and values
const getStatusValue = (status) => {
  if (typeof status === 'number') return status;
  const option = statusOptions.find(s => s.name === status);
  return option ? option.value : 0;
};

const getPlanValue = (plan) => {
  if (typeof plan === 'number') return plan;
  const option = plans.find(p => p.name === plan);
  return option ? option.value : 0;
};

const availableModules = [
  { id: "Dashboard", label: "Dashboard", description: "Overview and analytics" },
  { id: "Products", label: "Products", description: "Manage product catalog" },
  { id: "Catalogs", label: "Catalogs", description: "Create and manage catalogs" },
  { id: "RFQ", label: "RFQ", description: "Request for Quotation" },
  { id: "WIP", label: "WIP", description: "Work in Progress tracking" },
  { id: "TNA", label: "TNA", description: "Time and Action calendar" },
  { id: "Documents", label: "Documents", description: "Document management" },
  { id: "Master Data", label: "Master Data", description: "Manage master data entities" },
  { id: "Customers", label: "Customers", description: "Customer management" },
  { id: "Retailers", label: "Retailers", description: "Retailer management" },
  { id: "Suppliers", label: "Suppliers", description: "Supplier management" },
  { id: "Merchandisers", label: "Merchandisers", description: "Merchandiser management" },
  { id: "Users", label: "Users", description: "User management" },
  { id: "Roles", label: "Roles", description: "Role management" },
  { id: "Departments", label: "Departments", description: "Department management" },
  { id: "Designations", label: "Designations", description: "Designation management" },
  { id: "Permissions", label: "Permissions", description: "Permission management" },
  { id: "Marketplace Settings", label: "Marketplace Settings", description: "Manage marketplace sliders and storefront" },
];

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [enabledModules, setEnabledModules] = useState([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await api.get(`/api/super-admin/companies/${companyId}`);
        console.log("Company data received:", data);
        
        const statusValue = getStatusValue(data.companyStatus ?? data.CompanyStatus);
        const planValue = getPlanValue(data.companyPlan ?? data.CompanyPlan);
        
        console.log("Status value:", statusValue, "Plan value:", planValue);
        
        reset({
          companyName: data.companyName || data.CompanyName,
          companyContactEmail: data.companyContactEmail || data.CompanyContactEmail,
          companyStatus: statusValue,
          companyPlan: planValue,
          subscriptionEndsAt: (data.subscriptionEndsAt || data.SubscriptionEndsAt) ? new Date(data.subscriptionEndsAt || data.SubscriptionEndsAt).toISOString().split('T')[0] : "",
        });
        
        try {
          const modulesData = data.enabledModules || data.EnabledModules || "[]";
          const modules = JSON.parse(modulesData);
          setEnabledModules(modules);
        } catch {
          setEnabledModules([]);
        }
      } catch (err) {
        console.error("Failed to load company:", err);
        setError("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId, reset]);

  const toggleModule = (moduleId) => {
    setEnabledModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");
    try {
      console.log("📝 Form data:", data);
      console.log("📦 Enabled modules (array):", enabledModules);
      console.log("📦 Enabled modules (JSON):", JSON.stringify(enabledModules));
      
      const payload = {
        CompanyName: data.companyName,
        CompanyContactEmail: data.companyContactEmail,
        CompanyStatus: data.companyStatus,
        CompanyPlan: data.companyPlan,
        SubscriptionEndsAt: data.subscriptionEndsAt ? new Date(data.subscriptionEndsAt).toISOString() : null,
        EnabledModules: JSON.stringify(enabledModules),
        FeatureFlags: null,
      };
      
      console.log("🚀 Submitting payload:", payload);
      
      const response = await api.put(`/api/super-admin/companies/${companyId}`, payload);
      console.log("✅ Update response:", response.data);
      
      setSuccess("Company updated successfully! Redirecting...");
      setTimeout(() => router.push("/SuperAdmin/Companies"), 1500);
    } catch (err) {
      console.error("❌ Update error:", err);
      console.error("❌ Error response:", err?.response);
      setError(err?.response?.data?.message || "Failed to update company. Please try again.");
    }
  };

  if (loading) {
    return (
      <div>
        <TopBar title="Edit Company" subtitle="Update company information" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Edit Company" subtitle="Update company information" />

      <div className="p-6 max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-4 text-slate-500" onClick={() => router.push("/SuperAdmin/Companies")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Companies
        </Button>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
        )}
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 mb-4">{success}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <Building2 className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Update basic information about the organization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Company Name *</label>
                  <Input placeholder="Acme Corporation" {...register("companyName")} />
                  {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Contact Email *</label>
                  <Input type="email" placeholder="contact@acme.com" {...register("companyContactEmail")} />
                  {errors.companyContactEmail && <p className="text-xs text-red-600">{errors.companyContactEmail.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select
                    {...register("companyStatus", { valueAsNumber: true })}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Plan</label>
                  <select
                    {...register("companyPlan", { valueAsNumber: true })}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                  >
                    {plans.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Subscription Ends At</label>
                <Input type="date" {...register("subscriptionEndsAt")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5">
                  <Package className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <CardTitle>Enabled Modules</CardTitle>
                  <CardDescription>Select which modules this company can access</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {availableModules.map((module) => (
                  <div
                    key={module.id}
                    className={`relative flex items-start gap-2.5 rounded-lg border p-3 transition-all cursor-pointer ${
                      enabledModules.includes(module.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        checked={enabledModules.includes(module.id)}
                        onChange={() => toggleModule(module.id)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-sm font-medium text-slate-900 cursor-pointer block truncate">
                        {module.label}
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/SuperAdmin/Companies")}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
