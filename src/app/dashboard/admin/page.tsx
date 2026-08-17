"use client";

import React from "react";
import { 
  IconUsers, 
  IconCurrencyDollar,
  IconClock,
  IconCreditCard,
  IconCalendarFilled,
  IconPhone,
  IconMail
} from "@tabler/icons-react";

import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { DashboardSidebarPanel, DashboardSidebarItem } from "@/components/dashboard/DashboardSidebar";
import SuperAdminDashboard from "@/components/user-wise-dashboard/super-admin-dashboard/Dashboard";

const AdminDashboard = () => {
  return (
    <SuperAdminDashboard />
  );
};

export default AdminDashboard;
