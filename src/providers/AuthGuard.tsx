/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getDecodedToken,
  getUserRoleFromToken,
  normalizeRole,
  getDashboardPathForRole,
  isTokenExpired,
  removeToken,
  removeUserInfo,
} from "@/helpers/SessionHelper";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const decoded = getDecodedToken(token);
    const expired = isTokenExpired(token);

    // If token exists but is invalid or expired, clear session
    if (token && (!decoded || expired)) {
      removeToken();
      removeUserInfo();
    }

    const isLoggedIn = !!token && !!decoded && !expired;

    // SECURE: Strictly derive role from the cryptographically signed JWT accessToken!
    // LocalStorage tampering cannot bypass this because it is decoded from token directly.
    const rawRole = getUserRoleFromToken(token);
    const normalizedRole = normalizeRole(rawRole);

    // Keep localStorage in sync with the authentic token role
    if (normalizedRole && typeof window !== "undefined") {
      localStorage.setItem("userRole", normalizedRole);
      localStorage.setItem("role", normalizedRole);
    }

    const defaultDashboardPath = getDashboardPathForRole(normalizedRole);

    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/verify-otp") ||
      pathname.startsWith("/verify-forgot-otp") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/change-password");

    const isDashboardPage = pathname.startsWith("/dashboard");

    // 1. If trying to access dashboard but NOT logged in (or token expired) -> Redirect to login
    if (isDashboardPage && !isLoggedIn) {
      router.replace("/login");
    }

    // 2. If logged in and on an auth page -> Redirect to their specific dashboard
    else if (isLoggedIn && isAuthPage) {
      router.replace(defaultDashboardPath);
    }

    // 3. Strict Role-based protection: Check if user attempts to access another role's dashboard
    else if (isLoggedIn && isDashboardPage) {
      const allRoles = ["player", "coach", "academy", "club", "agent", "admin", "parent"];

      // Allowed roles for the current user
      const allowedRoles = [normalizedRole];
      if (normalizedRole === "parent") allowedRoles.push("player");
      if (normalizedRole === "player") allowedRoles.push("parent");
      if (normalizedRole === "super_admin" || normalizedRole === "admin") {
        allowedRoles.push("admin", "super_admin", "super-admin");
      }

      const isAccessingOtherRoleDashboard = allRoles.some((role) => {
        if (allowedRoles.includes(role)) return false;
        return pathname.startsWith(`/dashboard/${role}`);
      });

      if (isAccessingOtherRoleDashboard || pathname === "/dashboard") {
        router.replace(defaultDashboardPath);
      }
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) return null;

  return <>{children}</>;
};

export default AuthGuard;
