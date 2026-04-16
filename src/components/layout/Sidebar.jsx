"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, BookOpen, FileText, Settings,
  Users, Building2, Bot, DollarSign, Globe, ShieldCheck,
  Workflow, Boxes, BarChart3, ChevronRight, LogOut, Zap, Database,
  UserCheck, UserCog, Briefcase, Award, Key, ShoppingBag, PanelLeftClose, PanelLeft,
  Store, Menu, ExternalLink
} from "lucide-react";
import { cn } from "@/Lib/Utils";
import { useAuthStore } from "@/store/AuthStore";

const superAdminNav = [
  { label: "Overview", href: "/SuperAdmin", icon: LayoutDashboard },
  { label: "Companies", href: "/SuperAdmin/Companies", icon: Building2 },
  { label: "AI Configuration", href: "/SuperAdmin/AiConfig", icon: Bot },
  { label: "AI Cost Analytics", href: "/SuperAdmin/AiCosts", icon: DollarSign },
  { label: "Geo Database", href: "/SuperAdmin/Geo", icon: Globe },
  { label: "Security", href: "/SuperAdmin/Security", icon: ShieldCheck },
  { label: "System Settings", href: "/SuperAdmin/Settings", icon: Settings },
];

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users & Roles", href: "/admin/users", icon: Users },
  { label: "Schema Builder", href: "/admin/schema", icon: Boxes },
  { label: "Workflow Builder", href: "/admin/workflows", icon: Workflow },
  { label: "AI Usage", href: "/admin/ai-usage", icon: Bot },
  { label: "Integrations", href: "/admin/integrations", icon: Zap },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const platformNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "Dashboard" },
  { label: "Products", href: "/products", icon: Package, module: "Products" },
  { label: "Catalogs", href: "/catalogs", icon: BookOpen, module: "Catalogs" },
  { label: "RFQ", href: "/rfq", icon: FileText, module: "RFQ" },
  { label: "Master Data", href: "/MasterData", icon: Database, module: "Master Data" },
  { label: "Customers", href: "/customers", icon: Users, module: "Customers" },
  { label: "Retailers", href: "/retailers", icon: ShoppingBag, module: "Retailers" },
  { label: "Suppliers", href: "/suppliers", icon: Building2, module: "Suppliers" },
  { label: "Merchandisers", href: "/merchandisers", icon: UserCheck, module: "Merchandisers" },
  { label: "Users", href: "/users", icon: UserCog, module: "Users" },
  { label: "Roles", href: "/roles", icon: ShieldCheck, module: "Roles" },
  { label: "Departments", href: "/departments", icon: Briefcase, module: "Departments" },
  { label: "Designations", href: "/designations", icon: Award, module: "Designations" },
  { label: "Permissions", href: "/permissions", icon: Key, module: "Permissions" },
  { label: "Marketplace Settings", href: "/marketplace-settings", icon: Store, module: "Marketplace Settings" },
];

export function Sidebar({ variant }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showLabels = isMobile || !isCollapsed;

  // Refresh platform users on mount so sidebar modules stay in sync
  useEffect(() => {
    const syncUser = async () => {
      const { refreshUser } = useAuthStore.getState();
      const currentUser = useAuthStore.getState().user;

      if (!currentUser || currentUser.roleName === "Super Admin" || variant !== "platform") {
        return;
      }

      try {
        await refreshUser();
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    };
    syncUser();
  }, [variant, user?.companyID, user?.roleName]);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  // Get navigation items based on variant
  let navItems = [];
  
  if (variant === "super-admin") {
    navItems = superAdminNav;
  } else if (variant === "admin") {
    navItems = adminNav;
  } else if (variant === "platform") {
    const enabledModules = user?.enabledModules || [];

    // Super Admin bypasses filtering
    if (user?.roleName === "Super Admin") {
      navItems = platformNav;
    } else if (!enabledModules || enabledModules.length === 0) {
      // Fallback to Dashboard only if no modules
      navItems = [platformNav[0]]; // Just Dashboard
    } else {
      // Filter based on enabled modules
      navItems = platformNav.filter(item => {
        if (!item.module) return true; // No module requirement
        const hasAccess = enabledModules.includes(item.module);
        return hasAccess;
      });
    }
  }

  const initials = user?.userName ? user.userName.slice(0, 2).toUpperCase() : "??";

  return (
    <>
    {/* Mobile top bar */}
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between h-12 px-3 bg-slate-950 border-b border-slate-800">
      <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
        <Menu className="h-5 w-5" />
      </button>
      <Image src="/img/logo/logo.png" alt="StyleLab" width={100} height={28} className="h-6 w-auto object-contain brightness-0 invert" />
      <Link href="/Marketplace" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
    {/* Mobile overlay */}
    {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
    <aside
      className={cn(
        "flex h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden transition-all duration-300",
        "fixed z-50 w-[272px] md:relative",
        !mobileOpen && "max-md:-translate-x-full",
        "md:translate-x-0",
        isCollapsed ? "md:w-[72px]" : "md:w-[272px]"
      )}
      data-mobile-open={mobileOpen}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 flex items-center justify-between gap-3.5 px-4 py-6">
        {showLabels && (
          <Image src="/img/logo/logo.png" alt="StyleLab" width={150} height={40} className="h-9 w-auto object-contain brightness-0 invert" priority />
        )}
        <button
          onClick={toggleCollapsed}
          className={cn(
            "p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all",
            isCollapsed && "mx-auto",
            "hidden md:block"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {navItems && navItems.length > 0 ? navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Component = item.disabled ? 'div' : Link;
          
          return (
            <Component
              key={`${item.label}-${item.href}-${index}`}
              {...(!item.disabled && { href: item.href })}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200 relative",
                item.disabled 
                  ? "opacity-40 cursor-not-allowed text-slate-500"
                  : isActive
                    ? "bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-cyan-400" />
              )}
              <item.icon className={cn(
                "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                item.disabled 
                  ? "text-slate-600" 
                  : isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
              {showLabels && (
                <>
                  <span className="truncate">{item.label}</span>
                  {isActive && !item.disabled && <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-500" />}
                </>
              )}
            </Component>
          );
        }) : (
          <div className="px-3 py-4 text-center text-slate-400 text-sm">
            No menu items available
          </div>
        )}
      </nav>

      {/* Separator */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* User Footer */}
      <div className="relative z-10 p-4">
        <div className={cn(
          "flex items-center gap-3 rounded-xl bg-white/5 p-3 border border-white/5",
          !showLabels && "flex-col gap-2"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
            {initials}
          </div>
          {showLabels && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.userName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.userEmail}</p>
              </div>
              <button
                onClick={() => logout()}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-red-400 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
          {!showLabels && (
            <button
              onClick={() => logout()}
              className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-red-400 transition-all duration-200 w-full"
              title="Logout"
            >
              <LogOut className="h-4 w-4 mx-auto" />
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
