"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, Shield, Zap, Globe, Layers } from "lucide-react";
import { useAuthStore } from "@/store/AuthStore";
import { Button } from "@/Components/Ui/Button";
import { Input } from "@/Components/Ui/Input";

const loginSchema = z.object({
  userEmail: z.string().email("Invalid email address"),
  userPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      await login(data.userEmail, data.userPassword);
      const user = useAuthStore.getState().user;
      if (user?.roleName === "Super Admin") router.push("/SuperAdmin");
      else router.push("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-60" />

        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-40 left-10 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px]" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Brand */}
          <div className="flex items-center gap-3.5 mb-auto animate-fade-in">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-bold text-lg text-white shadow-lg shadow-indigo-500/30">
              SL
            </div>
            <div>
              <p className="font-bold text-lg text-white tracking-tight">StyleLab 3.0</p>
              <p className="text-xs text-slate-400">AI-Powered Catalog Platform</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm border border-white/10">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90">Powered by AI</span>
            </div>
            <h2 className="text-5xl font-bold leading-[1.15] text-white tracking-tight">
              Enterprise Catalog<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Management Platform</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
              Manage products, catalogs, RFQs, and workflows with AI-powered intelligence for the global garment industry.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { label: "Multi-Tenant SaaS", desc: "Isolated per client", icon: Shield },
                { label: "AI-Powered Search", desc: "Natural language queries", icon: Sparkles },
                { label: "Dynamic Schema", desc: "No-code configuration", icon: Layers },
                { label: "Global Regions", desc: "7 countries supported", icon: Globe },
              ].map((feature) => (
                <div key={feature.label} className="group rounded-2xl bg-white/[0.04] p-4 border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300">
                  <feature.icon className="h-5 w-5 text-indigo-400 mb-2.5" />
                  <p className="font-semibold text-sm text-white">{feature.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-auto text-xs text-slate-600">&copy; 2026 ITG Innovators. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-[45%] items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-white relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xl shadow-xl shadow-indigo-500/20 lg:hidden">
              SL
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-2">Sign in to your StyleLab account</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200/60 px-4 py-3 text-sm text-red-700 animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email address</label>
              <Input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="h-11 rounded-xl"
                {...register("userEmail")}
              />
              {errors.userEmail && <p className="text-xs text-red-600">{errors.userEmail.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-11 rounded-xl pr-10"
                  {...register("userPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.userPassword && <p className="text-xs text-red-600">{errors.userPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 font-semibold" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
