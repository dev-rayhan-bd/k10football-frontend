"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Renders children except on the given route prefixes (e.g. hide the navbar on shared CV links). */
const HideOnRoutes = ({ routes, children }: { routes: string[]; children: ReactNode }) => {
  const pathname = usePathname() || "";
  if (routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return null;
  return <>{children}</>;
};

export default HideOnRoutes;
