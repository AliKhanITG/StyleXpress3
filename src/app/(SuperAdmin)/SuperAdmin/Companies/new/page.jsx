"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Building2, Loader2, UserPlus, Package } from "lucide-react";
import { TopBar } from "@/Components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/Ui/Card";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";
import { api } from "@/Lib/Api";

const schema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companySlug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  companyContactEmail: z.string().email("Invalid email"),
  companyPlan: z.number().int().min(0).max(3),
  companyTimeZone: z.string().optional(),
  companyCurrency: z.string().optional(),
  adminName: z.string().min(2, "Admin name is required"),
  adminEmail: z.string().email("Invalid admin email"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const plans = [
  { value: 0, label: "Free" },
  { value: 1, label: "Starter" },
  { value: 2, label: "Professional" },
  { value: 3, label: "Enterprise" },
];

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

export default function NewCompanyPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [enabledModules, setEnabledModules] = useState([
    "Dashboard", "Products", "Catalogs", "RFQ", "WIP", "TNA", "Documents", 
    "Master Data", "Customers", "Retailers", "Suppliers", "Merchandisers",
    "Users", "Roles", "Departments", "Designations", "Permissions"
  ]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyPlan: 0,
      companyTimeZone: "UTC",
      companyCurrency: "USD",
      adminPassword: "Company@1234!",
    },
  });

  const companyName = watch("companyName");

  const generateSlug = () => {
    if (companyName) {
      setValue("companySlug", companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

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
      const payload = {
        CompanyName: data.companyName,
        CompanySlug: data.companySlug,
        CompanyContactEmail: data.companyContactEmail,
        CompanyPlan: data.companyPlan,
        CompanyTimeZone: data.companyTimeZone,
        CompanyCurrency: data.companyCurrency,
        EnabledModules: JSON.stringify(enabledModules),
        AdminName: data.adminName,
        AdminEmail: data.adminEmail,
        AdminPassword: data.adminPassword,
      };
      await api.post("/api/super-admin/companies", payload);
      setSuccess("Company created successfully! Redirecting...");
      setTimeout(() => router.push("/SuperAdmin/Companies"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create company. Please try again.");
    }
  };

  return (
    <div>
      <TopBar title="Create New Company" subtitle="Onboard a new client organization" />

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
                  <CardDescription>Basic information about the organization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Company Name *</label>
                  <Input placeholder="Acme Corporation" {...register("companyName")} onBlur={generateSlug} />
                  {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Slug *</label>
                  <Input placeholder="acme-corporation" {...register("companySlug")} />
                  {errors.companySlug && <p className="text-xs text-red-600">{errors.companySlug.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Contact Email *</label>
                  <Input type="email" placeholder="contact@acme.com" {...register("companyContactEmail")} />
                  {errors.companyContactEmail && <p className="text-xs text-red-600">{errors.companyContactEmail.message}</p>}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Timezone</label>
                  <Input placeholder="UTC" {...register("companyTimeZone")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Currency</label>
                  <Input placeholder="USD" {...register("companyCurrency")} />
                </div>
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

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <UserPlus className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <CardTitle>Company Admin Account</CardTitle>
                  <CardDescription>This user will have full Admin access within the company</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Admin Full Name *</label>
                  <Input placeholder="John Doe" {...register("adminName")} />
                  {errors.adminName && <p className="text-xs text-red-600">{errors.adminName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Admin Email *</label>
                  <Input type="email" placeholder="admin@acme.com" {...register("adminEmail")} />
                  {errors.adminEmail && <p className="text-xs text-red-600">{errors.adminEmail.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Admin Password *</label>
                <Input type="text" {...register("adminPassword")} />
                {errors.adminPassword && <p className="text-xs text-red-600">{errors.adminPassword.message}</p>}
                <p className="text-xs text-slate-500">Share this password with the company admin. They can change it after first login.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/SuperAdmin/Companies")}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Company"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
