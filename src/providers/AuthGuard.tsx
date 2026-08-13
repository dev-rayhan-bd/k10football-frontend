"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
const router = useRouter();
const pathname = usePathname();
const [checking, setChecking] = useState(true);

useEffect(() => {
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const userRole = localStorage.getItem("userRole") || "player";
const dashboardPath = userRole === "academy" ? "/dashboard/academy/analysis" : `/dashboard/${userRole}`;

const isAuthPage =
  pathname.startsWith("/login") ||
  pathname.startsWith("/register") ||
  pathname.startsWith("/forgot-password") ||
  pathname.startsWith("/reset-password") ||
  pathname.startsWith("/change-password");

const isDashboardPage = pathname.startsWith("/dashboard");

// 1. If trying to access dashboard but NOT logged in -> Redirect to login
if (isDashboardPage && !isLoggedIn) {
  router.replace("/login");
}

// 2. If logged in and on an auth page -> Redirect to their specific dashboard
else if (isLoggedIn && isAuthPage) {
  router.replace(dashboardPath);
}

// 3. Role-based protection: If logged in but trying to access another role's dashboard
else if (isLoggedIn && isDashboardPage && !pathname.startsWith(dashboardPath)) {
  const roles = ["player", "coach", "academy", "club", "agent", "admin", "parent"];
  // Allow parent and player to access each other's dashboards
  const allowedRoles = [userRole];
  if (userRole === "parent") allowedRoles.push("player");
  if (userRole === "player") allowedRoles.push("parent");

  const tryingToAccessOtherRole = roles.some((role) => {
    if (allowedRoles.includes(role)) return false;
    return pathname.startsWith(`/dashboard/${role}`);
  });

  if (tryingToAccessOtherRole) {
    router.replace(dashboardPath);
  }
}

// All other cases (like accessing / or /about when not logged in) are allowed
setChecking(false);
}, [pathname, router]);

if (checking) return null;

return <>{children}</>;
}
export default AuthGuard;
