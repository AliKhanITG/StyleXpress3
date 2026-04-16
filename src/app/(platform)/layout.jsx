"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ModuleGuard } from "@/components/layout/ModuleGuard";

export default function PlatformLayout({ children }) {
  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar variant="platform" />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-grid min-w-0">
          <ModuleGuard>{children}</ModuleGuard>
        </main>
      </div>
    </AuthGuard>
  );
}
