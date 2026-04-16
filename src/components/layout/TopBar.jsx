"use client";

import Link from "next/link";
import { Bell, Search, Command, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/AuthStore";
import { Badge } from "@/Components/Ui/Badge";
import { useEffect, useState } from "react";

export function TopBar({ title, subtitle }) {
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(true);
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.userName ||
    user?.email?.split("@")?.[0] ||
    "User";

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-3 sm:px-6 overflow-hidden">
      <div className="flex min-h-[3.5rem] sm:min-h-[4rem] items-center justify-between gap-2">
      <div className="animate-fade-in min-w-0 flex-shrink-0">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {isMobile ? (
          <p className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Hi, {userName}
          </p>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/Marketplace"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Marketplace in new tab"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200"
          >
            <ExternalLink className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </Link>
          
          {/* Search */}
          <div className="relative hidden lg:block group">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search anything..."
              className="h-9 w-60 rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400 font-medium border border-slate-200/80">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>

          {/* Notification Bell */}
          <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200">
            <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
          </button>

          {user?.isSuperAdmin && (
            <Badge variant="purple" className="text-xs hidden sm:inline-flex">SuperAdmin</Badge>
          )}

          <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          {/* User Avatar */}
          <div className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] sm:text-xs font-bold text-white shadow-sm shadow-indigo-500/20">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-400">{user?.roleName || "User"}</p>
            </div>
          </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
