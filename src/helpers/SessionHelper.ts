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
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const getUserRoleFromToken = (token?: string | null): string => {
  const decoded = getDecodedToken(token);
  return decoded?.role ? decoded.role.toLowerCase() : "";
};

export const isTokenExpired = (token?: string | null): boolean => {
  const decoded = getDecodedToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

class SessionHelper {
  setToken(token: string) {
    if (!token) return;

    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("token", token);
      const decoded = getDecodedToken(token);
      if (decoded?.role) {
        const normalizedRole = decoded.role.toLowerCase();
        localStorage.setItem("role", normalizedRole);
        localStorage.setItem("userRole", normalizedRole);
      }
      if (decoded?.email) {
        localStorage.setItem("email", decoded.email);
        localStorage.setItem("userEmail", decoded.email);
      }
      localStorage.setItem("isLoggedIn", "true");
    }
  }

  getToken() {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("token") || "";
    }
    return "";
  }

  removeToken() {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("token");
    }
  }

  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;
    const decoded = getDecodedToken(token);
    if (!decoded) return false;
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }
    return true;
  }

  getUserRole() {
    const token = this.getToken();
    return getUserRoleFromToken(token);
  }

  setUserInfo(userInfo: { fullName: string; email: string; profileImg: string; role: string }) {
    if (typeof window !== "undefined" && window.localStorage) {
      const normalizedRole = (userInfo.role || "").toLowerCase();
      localStorage.setItem("fullName", userInfo.fullName || "");
      localStorage.setItem("email", userInfo.email || "");
      localStorage.setItem("userEmail", userInfo.email || "");
      localStorage.setItem("profileImg", userInfo.profileImg || "");
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("userRole", normalizedRole);
      localStorage.setItem("isLoggedIn", "true");
    }
  }

  getUserInfo() {
    if (typeof window !== "undefined" && window.localStorage) {
      const token = this.getToken();
      const decoded = getDecodedToken(token);
      const roleFromToken = decoded?.role ? decoded.role.toLowerCase() : "";

      return {
        fullName: localStorage.getItem("fullName") || "",
        email: decoded?.email || localStorage.getItem("email") || localStorage.getItem("userEmail") || "",
        profileImg: localStorage.getItem("profileImg") || "",
        role: roleFromToken || (localStorage.getItem("role") || localStorage.getItem("userRole") || "").toLowerCase(),
      };
    }
    return { fullName: "", email: "", profileImg: "", role: "" };
  }

  removeUserInfo() {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("profileImg");
      localStorage.removeItem("role");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isLoggedIn");
    }
  }
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
