"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";

export default function MarketplaceLayout({ children }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </AuthGuard>
  );
}
