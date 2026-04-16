"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";

export default function SuperAdminLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar variant="super-admin" />
        <main className="flex-1 overflow-y-auto bg-grid">{children}</main>
      </div>
    </AuthGuard>
  );
}
