"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRoleFromToken } from "@/helpers/SessionHelper";
import NotificationsView from "@/components/notifications/NotificationsView";

const UniversalNotificationsPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const role = getUserRoleFromToken(token);

      if (role === "coach") {
        router.replace("/dashboard/coach/notifications");
      } else if (role === "player") {
        router.replace("/dashboard/player/notifications");
      } else if (role === "club") {
        router.replace("/dashboard/club/notifications");
      } else if (role === "academy") {
        router.replace("/dashboard/academy/management/notifications");
      } else if (role === "parent") {
        router.replace("/dashboard/parent/notifications");
      } else if (role === "super_admin" || role === "admin") {
        router.replace("/dashboard/admin/notifications");
      }
    }
  }, [router]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      <NotificationsView />
    </div>
  );
};

export default UniversalNotificationsPage;

