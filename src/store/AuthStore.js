import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/Lib/Api";

function parseEnabledModules(rawModules) {
  if (rawModules === null || rawModules === undefined) return [];
  if (Array.isArray(rawModules)) return rawModules;
  if (typeof rawModules === "string") {
    try {
      const parsed = JSON.parse(rawModules);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (userEmail, userPassword) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/api/auth/login", { userEmail, userPassword });

          localStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

          let enabledModules = parseEnabledModules(data.enabledModules ?? data.EnabledModules);
          if (enabledModules.length === 0 && data.companyID) {
            try {
              const modulesResponse = await api.get("/api/auth/enabled-modules");
              enabledModules = parseEnabledModules(modulesResponse.data?.enabledModules);
            } catch {}
          }
          
          set({
            user: {
              userID: data.userID,
              userName: data.userName,
              userEmail: data.userEmail,
              roleName: data.roleName,
              roleID: data.roleID,
              companyID: data.companyID,
              departmentName: data.departmentName,
              designationName: data.designationName,
              permissions: data.permissions || [],
              menuPermissions: data.menuPermissions || [],
              enabledModules: enabledModules,
            },
            accessToken: data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/api/auth/logout");
        } catch {}
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get("/api/auth/me");

          let enabledModules = parseEnabledModules(data.enabledModules ?? data.EnabledModules);
          if (enabledModules.length === 0 && data.companyID) {
            try {
              const modulesResponse = await api.get("/api/auth/enabled-modules");
              enabledModules = parseEnabledModules(modulesResponse.data?.enabledModules);
            } catch {}
          }
          
          set({
            user: {
              userID: data.userID,
              userName: data.userName,
              userEmail: data.userEmail,
              roleName: data.roleName,
              roleCode: data.roleCode,
              roleID: data.roleID,
              companyID: data.companyID,
              departmentName: data.departmentName,
              designationName: data.designationName,
              statusName: data.statusName,
              permissions: data.permissions || [],
              enabledModules: enabledModules,
            },
            isAuthenticated: true,
          });
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      hasPermission: (permissionCode) => {
        const user = get().user;
        if (!user?.permissions) return false;
        if (user.roleName === "Super Admin") return true;
        return user.permissions.includes(permissionCode);
      },

      hasModuleAccess: (moduleName) => {
        const user = get().user;
        if (!user) return false;
        // Only Super Admin bypasses module restrictions
        if (user.roleName === "Super Admin") return true;
        // If no module specified, allow access (for non-module pages like Dashboard, Master Data, etc.)
        if (!moduleName) return true;
        // Check if the module is in the company's enabled modules
        return (user.enabledModules || []).includes(moduleName);
      },

      setToken: (token) => {
        localStorage.setItem("accessToken", token);
        set({ accessToken: token });
      },
    }),
    {
      name: "stylelab-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
