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
  IconSettings,
  IconLock,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { ReactNode, useEffect, useRef } from "react";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Game Reports and Analytics are unlocked so athletes can freely enter and view;
// Actions (creating reports, requesting coach reviews) trigger 402 error handling if unsubscribed.
const LOCKED_PLAYER_PATHS: string[] = [];

const playerSidebarItems = [
  { name: "Dashboard", url: "/dashboard/player", icon: IconDashboard },
  { name: "My CV", url: "/dashboard/player/my-cv", icon: IconFileText },
  { name: "My Images & Videos", url: "/dashboard/player/images-videos", icon: IconPhotoVideo },
  { name: "Game Reports", url: "/dashboard/player/game-reports", icon: IconReportAnalytics },
  { name: "Analytics", url: "/dashboard/player/analytics", icon: IconChartBar },
  { name: "My Evaluations", url: "/dashboard/player/evaluations", icon: IconClipboardCheck },
  { name: "My Subscription", url: "/dashboard/player/my-subscription", icon: IconCreditCard },
  { name: "Notification", url: "/dashboard/player/notifications", icon: IconBell },
  { name: "Settings", url: "/dashboard/player/settings", icon: IconSettings },
];

const PlayerLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathRef = useRef<string | null>(null);

  const { data: subscriptionResponse, isLoading: isSubLoading } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const isCurrentRouteLocked = LOCKED_PLAYER_PATHS.some(
    (lockedPath) => pathname === lockedPath || pathname.startsWith(`${lockedPath}/`)
  );

  // Route protection: If player navigates directly via browser URL bar or link to a locked route without active subscription
  useEffect(() => {
    if (!isSubLoading && !hasActiveSubscription && isCurrentRouteLocked) {
      if (redirectedPathRef.current !== pathname) {
        redirectedPathRef.current = pathname;
        toast.error("Active Athlete Membership subscription required to access this feature. Redirecting to subscription...");
        router.replace("/dashboard/player/my-subscription");
      }
    } else if (!isCurrentRouteLocked) {
      redirectedPathRef.current = null;
    }
  }, [isSubLoading, hasActiveSubscription, isCurrentRouteLocked, pathname, router]);

  const currentSidebarItems = playerSidebarItems.map((item) => {
    const isLocked = !hasActiveSubscription && LOCKED_PLAYER_PATHS.some((path) => item.url === path);
    return {
      ...item,
      isLocked,
      lockedMessage: item.url.includes("analytics")
        ? "Active Athlete Membership plan required to access advanced performance charts, match analytics, and heatmaps."
        : "Active Athlete Membership plan required to submit game reports and request coach reviews.",
      lockedRedirectUrl: "/dashboard/player/my-subscription",
    };
  });

  const tierTitle = subscriptionResponse?.data?.currentSubscription?.planTitle;
  const tierName = tierTitle
    ? tierTitle.toUpperCase()
    : hasActiveSubscription
    ? "ACTIVE ATHLETE"
    : "FREE ATHLETE";
  const tierColor = hasActiveSubscription ? "#00FF62" : "#888888";

  // Prevent rendering locked children if unsubscribed or while checking status
  let content = children;
  if (isCurrentRouteLocked) {
    if (isSubLoading) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Checking subscription access...</p>
        </div>
      );
    } else if (!hasActiveSubscription) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
            <IconLock className="size-8 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              Athlete Membership Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This feature is exclusively available for subscribed athletes. You need an active Athlete Membership plan to create game reports, request coach reviews, and view advanced match analytics with heatmaps.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/player/my-subscription">
              <Button className="w-full sm:w-auto bg-primary hover:bg-[#00dd00] text-black font-bold">
                View Membership Plans
              </Button>
            </Link>
            <Link href="/dashboard/player">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <DashboardLayout
      sidebarItems={currentSidebarItems}
      tier={{ name: tierName, color: tierColor }}
    >
      {content}
    </DashboardLayout>
  );
};

export default PlayerLayout;
