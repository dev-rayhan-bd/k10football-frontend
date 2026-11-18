"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  IconDashboard,
  IconUsers,
  IconReportAnalytics,
  IconCreditCard,
  IconCalendarCheck,
  IconBuildingStore,
  IconShoppingBag,
  IconAward,
  IconLock,
  IconMessageCircle,
} from "@tabler/icons-react";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParentSubscriptionAccess } from "@/hooks/useParentSubscriptionAccess";

const LOCKED_PARENT_PATHS = [
  "/dashboard/parent/game-reports",
];

const parentSidebarItems = [
  { name: "Overview", url: "/dashboard/parent", icon: IconDashboard },
  { name: "Child Profiles", url: "/dashboard/parent/profiles", icon: IconUsers },
  { name: "Match Reports", url: "/dashboard/parent/game-reports", icon: IconReportAnalytics },
  { name: "Fees & Payments", url: "/dashboard/parent/fees", icon: IconCreditCard },
  { name: "Attendance", url: "/dashboard/parent/attendance", icon: IconCalendarCheck },
  { name: "Chat", url: "/dashboard/parent/chat", icon: IconMessageCircle },
  { name: "Academy Shop", url: "/dashboard/parent/shop", icon: IconBuildingStore },
  { name: "My Orders", url: "/dashboard/parent/my-orders", icon: IconShoppingBag },
  { name: "My Subscription", url: "/dashboard/parent/my-subscription", icon: IconAward },
];

const ParentLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathRef = useRef<string | null>(null);

  const { isUnlocked, isLoading } = useParentSubscriptionAccess();

  const isCurrentRouteLocked = LOCKED_PARENT_PATHS.some(
    (lockedPath) => pathname === lockedPath || pathname.startsWith(`${lockedPath}/`)
  );

  // Route protection: If parent navigates directly to a locked scouting/analytics route without active subscription or linked child subscription
  useEffect(() => {
    if (!isLoading && !isUnlocked && isCurrentRouteLocked) {
      if (redirectedPathRef.current !== pathname) {
        redirectedPathRef.current = pathname;
        toast.error(
          "Active subscription required to access scouting match reports and coach reviews. Please subscribe or link an active child plan."
        );
        router.replace("/dashboard/parent/my-subscription");
      }
    } else if (!isCurrentRouteLocked) {
      redirectedPathRef.current = null;
    }
  }, [isLoading, isUnlocked, isCurrentRouteLocked, pathname, router]);

  const currentSidebarItems = parentSidebarItems.map((item) => {
    const isLocked = !isUnlocked && LOCKED_PARENT_PATHS.some((path) => item.url === path);
    return {
      ...item,
      isLocked,
      lockedMessage:
        "Active subscription required (Parent Membership or linked Child Athlete plan) to access match reports and coach evaluations.",
      lockedRedirectUrl: "/dashboard/parent/my-subscription",
    };
  });

  const tierName = isUnlocked ? "ACTIVE GUARDIAN" : "FREE GUARDIAN";
  const tierColor = isUnlocked ? "#00FF62" : "#888888";

  // Prevent rendering locked children if unsubscribed or while checking status
  let content = children;
  if (isCurrentRouteLocked) {
    if (isLoading) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Checking subscription access...</p>
        </div>
      );
    } else if (!isUnlocked) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
            <IconLock className="size-8 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              Subscription Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paid scouting reports, interactive pitch event plotting, and coach evaluations require an active subscription (Parent Membership plan or a linked Child Athlete plan). Training schedules and fee payments remain free.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/parent/my-subscription">
              <Button className="w-full sm:w-auto bg-primary hover:bg-[#00dd00] text-black font-bold">
                View Membership Plans
              </Button>
            </Link>
            <Link href="/dashboard/parent/fees">
              <Button variant="outline" className="w-full sm:w-auto">
                Pay Academy Fees
              </Button>
            </Link>
            <Link href="/dashboard/parent">
              <Button variant="ghost" className="w-full sm:w-auto text-muted-foreground">
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

export default ParentLayout;
