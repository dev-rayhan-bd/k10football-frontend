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
  IconLoader2,
  IconArrowRight,
} from "@tabler/icons-react";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParentSubscriptionAccess } from "@/hooks/useParentSubscriptionAccess";
import {
  ParentDashboardProvider,
  useParentDashboard,
} from "@/providers/ParentDashboardProvider";
import ParentChildSelector from "@/components/parent/ParentChildSelector";

// Match Reports are unlocked so parents can view reports for any child;
// Actions (creating reports, requesting coach reviews) trigger 402 error handling per-child.
const LOCKED_PARENT_PATHS: string[] = [];

const parentSidebarItems = [
  { name: "Overview", url: "/dashboard/parent", icon: IconDashboard },
  { name: "Child Profiles", url: "/dashboard/parent/profiles", icon: IconUsers },
  {
    name: "Match Reports",
    url: "/dashboard/parent/game-reports",
    icon: IconReportAnalytics,
  },
  {
    name: "Fees & Payments",
    url: "/dashboard/parent/fees",
    icon: IconCreditCard,
  },
  {
    name: "Attendance",
    url: "/dashboard/parent/attendance",
    icon: IconCalendarCheck,
  },
  { name: "Chat", url: "/dashboard/parent/chat", icon: IconMessageCircle },
  {
    name: "Academy Shop",
    url: "/dashboard/parent/shop",
    icon: IconBuildingStore,
  },
  {
    name: "My Orders",
    url: "/dashboard/parent/my-orders",
    icon: IconShoppingBag,
  },
  {
    name: "My Subscription",
    url: "/dashboard/parent/my-subscription",
    icon: IconAward,
  },
];

const ParentLayoutShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathRef = useRef<string | null>(null);

  const { selectedChild, switchToChildAccount, isSwitchingProfile } =
    useParentDashboard();

  const {
    hasAnySubscribedChild,
    subscribedChildrenCount,
    totalChildrenCount,
    isLoading,
  } = useParentSubscriptionAccess();

  const isCurrentRouteLocked = LOCKED_PARENT_PATHS.some(
    (lockedPath) =>
      pathname === lockedPath || pathname.startsWith(`${lockedPath}/`)
  );

  // Route protection: only block Match Reports at layout level if 0 children have an active subscription.
  // If >=1 child is subscribed, the Match Reports page itself enforces per-selected-child gating.
  useEffect(() => {
    if (!isLoading && !hasAnySubscribedChild && isCurrentRouteLocked) {
      if (redirectedPathRef.current !== pathname) {
        redirectedPathRef.current = pathname;
        toast.error(
          "An active child Athlete subscription is required to access Match Reports. Switch to your child's Athlete account to subscribe."
        );
        router.replace("/dashboard/parent/my-subscription");
      }
    } else if (!isCurrentRouteLocked) {
      redirectedPathRef.current = null;
    }
  }, [isLoading, hasAnySubscribedChild, isCurrentRouteLocked, pathname, router]);

  const currentSidebarItems = parentSidebarItems.map((item) => {
    const isLocked =
      !hasAnySubscribedChild &&
      LOCKED_PARENT_PATHS.some((path) => item.url === path);
    return {
      ...item,
      isLocked,
      lockedMessage:
        "An active child Athlete subscription is required to access Match Reports and coach evaluations.",
      lockedRedirectUrl: "/dashboard/parent/my-subscription",
    };
  });

  const tierName = hasAnySubscribedChild
    ? totalChildrenCount > 1
      ? `${subscribedChildrenCount}/${totalChildrenCount} SUBSCRIBED`
      : "ACTIVE GUARDIAN"
    : "FREE GUARDIAN";
  const tierColor = hasAnySubscribedChild ? "#00FF62" : "#888888";

  let content = children;
  if (isCurrentRouteLocked) {
    if (isLoading) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">
            Checking subscription access...
          </p>
        </div>
      );
    } else if (!hasAnySubscribedChild) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
            <IconLock className="size-8 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              Child Athlete Subscription Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscriptions are purchased per child on each child&apos;s Athlete
              account. Switch to{" "}
              <strong className="text-white">
                {selectedChild?.fullName || "your child"}
              </strong>
              &apos;s Athlete account to subscribe and unlock Match Reports and
              advanced analytics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            {selectedChild?.childUserId && (
              <Button
                type="button"
                disabled={isSwitchingProfile}
                onClick={() =>
                  switchToChildAccount(
                    selectedChild.childUserId,
                    "/dashboard/player/my-subscription"
                  )
                }
                className="w-full sm:w-auto bg-primary hover:bg-[#00dd00] text-black font-bold flex items-center gap-2"
              >
                {isSwitchingProfile ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  <IconArrowRight className="size-4" />
                )}
                Switch &amp; Subscribe ({selectedChild.fullName})
              </Button>
            )}
            <Link href="/dashboard/parent/my-subscription">
              <Button variant="outline" className="w-full sm:w-auto">
                Subscription Status
              </Button>
            </Link>
            <Link href="/dashboard/parent">
              <Button
                variant="ghost"
                className="w-full sm:w-auto text-muted-foreground"
              >
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
      customToggle={<ParentChildSelector />}
    >
      {content}
    </DashboardLayout>
  );
};

const ParentLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ParentDashboardProvider>
      <ParentLayoutShell>{children}</ParentLayoutShell>
    </ParentDashboardProvider>
  );
};

export default ParentLayout;
