"use client";

import DashboardLayout from "@/components/dashboard-layout";
import {
  IconDashboard,
  IconUsers,
  IconReportAnalytics,
  IconCreditCard,
  IconCalendarCheck,
  IconBuildingStore
} from "@tabler/icons-react";
import { ReactNode } from "react";

const parentSidebarItems = [
  { name: "Overview", url: "/dashboard/parent", icon: IconDashboard },
  { name: "Child Profiles", url: "/dashboard/parent/profiles", icon: IconUsers },
  { name: "Match Reports", url: "/dashboard/parent/game-reports", icon: IconReportAnalytics },
  { name: "Fees & Payments", url: "/dashboard/parent/fees", icon: IconCreditCard },
  { name: "Attendance", url: "/dashboard/parent/attendance", icon: IconCalendarCheck },
  { name: "Academy Shop", url: "/dashboard/parent/shop", icon: IconBuildingStore }
];

const ParentLayout = ({ children }: { children: ReactNode }) => {
return (
<DashboardLayout
  sidebarItems={parentSidebarItems}
  tier={{ name: "PARENT", color: "var(--indigo)" }}
>
  {children}
</DashboardLayout>
);
}
export default ParentLayout;
