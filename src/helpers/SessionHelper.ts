/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  userId?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export const getDecodedToken = (token?: string | null): DecodedToken | null => {
  if (!token) return null;
  const clean = token.replace(/^Bearer\s+/i, "").trim();
  if (!clean) return null;
  try {
    return jwtDecode<DecodedToken>(clean);
  } catch {
    return null;
  }
};

export const normalizeRole = (role?: string | null): string => {
  if (!role) return "";
  const r = role.toLowerCase().trim().replace(/[-_]/g, "_");
  if (r === "super_admin" || r === "superadmin" || r === "admin") {
    return "super_admin";
  }
  return r;
};

export const getDashboardPathForRole = (role?: string | null): string => {
  const r = normalizeRole(role);
  if (r === "academy") {
    return "/dashboard/academy/analysis";
  }
  if (r === "super_admin" || r === "admin") {
    return "/dashboard/admin";
  }
  if (r === "coach") return "/dashboard/coach";
  if (r === "club") return "/dashboard/club";
  if (r === "agent") return "/dashboard/agent";
  if (r === "parent") return "/dashboard/parent";
  if (r === "player") return "/dashboard/player";
  return `/dashboard/${r || "player"}`;
};

export const getUserRoleFromToken = (token?: string | null): string => {
  const decoded = getDecodedToken(token);
  const rawRole =
    decoded?.role ||
    decoded?.userRole ||
    decoded?.user?.role ||
    (typeof window !== "undefined"
      ? localStorage.getItem("role") || localStorage.getItem("userRole")
      : "") ||
    "";
  return normalizeRole(rawRole);
};

export const isTokenExpired = (token?: string | null): boolean => {
  if (!token) return true;
  const decoded = getDecodedToken(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 < Date.now();
};

class SessionHelper {
  setToken = (token: string) => {
    if (!token) return;

    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("token", token);
      const decoded = getDecodedToken(token);
      if (decoded?.role) {
        const normalizedRole = normalizeRole(decoded.role);
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("userRole", normalizedRole);
      }
      if (decoded?.email) {
        localStorage.setItem("email", decoded.email);
        localStorage.setItem("userEmail", decoded.email);
      }
      localStorage.setItem("isLoggedIn", "true");
    }
  };

  getToken = (): string => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
    }
    return "";
  };

  removeToken = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
    }
  };

  isLoggedIn = (): boolean => {
    const token = this.getToken();
    if (!token) return false;
    const decoded = getDecodedToken(token);
    if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  };

  getUserRole = (): string => {
    const token = this.getToken();
    return getUserRoleFromToken(token);
  };

  setUserInfo = (userInfo: { fullName: string; email: string; profileImg: string; role: string }) => {
    if (typeof window !== "undefined" && window.localStorage) {
      const normalizedRole = normalizeRole(userInfo.role);
      localStorage.setItem("fullName", userInfo.fullName || "");
      localStorage.setItem("email", userInfo.email || "");
      localStorage.setItem("userEmail", userInfo.email || "");
      localStorage.setItem("profileImg", userInfo.profileImg || "");
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("userRole", normalizedRole);
      localStorage.setItem("isLoggedIn", "true");
    }
  };

  getUserInfo = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = this.getToken();
      const decoded = getDecodedToken(token);
      const roleFromToken = decoded?.role ? normalizeRole(decoded.role) : "";

      return {
        fullName: localStorage.getItem("fullName") || "",
        email: decoded?.email || localStorage.getItem("email") || localStorage.getItem("userEmail") || "",
        profileImg: localStorage.getItem("profileImg") || "",
        role: roleFromToken || normalizeRole(localStorage.getItem("role") || localStorage.getItem("userRole")),
      };
    }
    return { fullName: "", email: "", profileImg: "", role: "" };
  };

  removeUserInfo = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("profileImg");
      localStorage.removeItem("role");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isLoggedIn");
    }
  };
}

const sessionHelperInstance = new SessionHelper();

export const {
  setToken,
  getToken,
  removeToken,
  isLoggedIn,
  getUserRole,
  setUserInfo,
  getUserInfo,
  removeUserInfo,
} = sessionHelperInstance;
