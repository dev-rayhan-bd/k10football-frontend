"use client";
import DashboardLayout from "@/components/DashboardLayout";
import {
  IconDashboard,
  IconFileText,
  IconPhotoVideo,
  IconReportAnalytics,
  IconChartBar,
  IconCreditCard,
  IconBell,
  IconSettings
} from "@tabler/icons-react";
import { ReactNode } from "react";
import {
  MediaUploadProvider,
  GlobalUploadWidget,
} from "@/providers/MediaUploadProvider";

const playerSidebarItems = [
  { name: "Dashboard", url: "/dashboard/player", icon: IconDashboard },
  { name: "My CV", url: "/dashboard/player/my-cv", icon: IconFileText },
  { name: "My Images & Videos", url: "/dashboard/player/images-videos", icon: IconPhotoVideo },
  { name: "Game Reports", url: "/dashboard/player/game-reports", icon: IconReportAnalytics },
  { name: "Analytics", url: "/dashboard/player/analytics", icon: IconChartBar },
  { name: "My Subscription", url: "/dashboard/player/my-subscription", icon: IconCreditCard },
  { name: "Notification", url: "/dashboard/player/notifications", icon: IconBell },
  { name: "Settings", url: "/dashboard/player/settings", icon: IconSettings },
];

const PlayerLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MediaUploadProvider>
      <DashboardLayout
        sidebarItems={playerSidebarItems}
        tier={{ name: "GOLD", color: "var(--gold)" }}
      >
        <GlobalUploadWidget />
        {children}
      </DashboardLayout>
    </MediaUploadProvider>
  );
};
export default PlayerLayout;
