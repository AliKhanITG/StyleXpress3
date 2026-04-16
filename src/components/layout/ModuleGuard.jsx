"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/AuthStore";
import { AlertCircle } from "lucide-react";

const ROUTE_MODULE_MAP = {
  "/products":      "Products",
  "/catalogs":      "Catalogs",
  "/rfq":           "RFQ",
  "/MasterData":    "Master Data",
  "/fabric-codes":  "Master Data",
  "/customers":     "Customers",
  "/retailers":     "Retailers",
  "/suppliers":     "Suppliers",
  "/merchandisers": "Merchandisers",
  "/users":         "Users",
  "/roles":         "Roles",
  "/departments":   "Departments",
  "/designations":  "Designations",
  "/permissions":   "Permissions",
  "/marketplace-settings": "Marketplace Settings",
};

export function getModuleForPath(pathname) {
  for (const [route, mod] of Object.entries(ROUTE_MODULE_MAP)) {
    if (pathname === route || pathname.startsWith(route + "/")) return mod;
  }
  return null;
}

export function ModuleGuard({ moduleName, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasModuleAccess } = useAuthStore();

  const resolvedModule = moduleName || getModuleForPath(pathname);

  if (!resolvedModule || !user) return <>{children}</>;

  if (hasModuleAccess(resolvedModule)) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600 mb-6">
              This module is not enabled for your company. Please contact your administrator if you need access to <span className="font-semibold">{resolvedModule}</span>.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
