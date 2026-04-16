"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, X, ChevronDown, LayoutDashboard, BookOpen } from "lucide-react";
import { useAuthStore } from "@/store/AuthStore";
import { api } from "@/Lib/Api";
import MegaMenu from "@/components/marketplace/MegaMenu";

export default function MarketplaceNav({ cartCount: cartCountProp }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [ownCartCount, setOwnCartCount] = useState(0);
  const userMenuRef = useRef(null);
  const initials = user?.userName ? user.userName.slice(0, 2).toUpperCase() : "SL";

  const cartCount = cartCountProp ?? ownCartCount;

  useEffect(() => {
    if (cartCountProp !== undefined || !isAuthenticated) return;
    api.get("/api/marketplace/cart/count")
      .then(({ data }) => setOwnCartCount(data.count || 0))
      .catch(() => {});
  }, [isAuthenticated, cartCountProp]);

  useEffect(() => {
    const h = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] flex h-14 items-center justify-between px-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Image src="/img/logo/logo.png" alt="StyleLab" width={140} height={40} className="h-7 sm:h-8 w-auto object-contain" priority />
        </Link>

        <div className="hidden lg:flex items-stretch h-14 absolute left-1/2 -translate-x-1/2">
          <Link href="/Marketplace" className="flex items-center px-4 text-[13px] font-semibold tracking-wide text-slate-900 border-b-2 border-slate-900 transition-colors duration-150">
            MARKETPLACE
          </Link>
          <MegaMenu />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/catalog-cart" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
            <BookOpen className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="relative hidden sm:block" ref={userMenuRef}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] font-bold text-white shadow-sm">{initials}</div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.userName || "Guest"}</p>
                <p className="text-[10px] text-slate-400">{user?.roleName || "User"}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400 hidden lg:block" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-200/50 z-50">
                <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link href="/my-catalogs" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  <BookOpen className="h-4 w-4" /> My Catalogs
                </Link>
                <div className="mx-3 my-1.5 h-px bg-slate-100" />
                <button onClick={async () => { setUserMenuOpen(false); await logout(); window.location.href = "/login"; }} className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
          <button className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
          <Link href="/Marketplace" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">MARKETPLACE</Link>
          <MegaMenu />
          <div className="border-t border-slate-100 mt-2 pt-2 space-y-1">
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/my-catalogs" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              <BookOpen className="h-4 w-4" /> My Catalogs
            </Link>
            <button onClick={async () => { setMobileOpen(false); await logout(); window.location.href = "/login"; }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
