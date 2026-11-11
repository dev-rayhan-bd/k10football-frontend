"use client";
import DashboardLayout from "@/components/DashboardLayout";
import {
  IconDashboard,
  IconMessage,
  IconUsers,
  IconUserCheck,
  IconCalendarEvent,
  IconCreditCard,
  IconBallFootball,
  IconStar,
  IconUsersGroup,
  IconNews,
  IconTrophy,
  IconFileText,
  IconChartBar,
  IconBuildingStore,
  IconSettings,
  IconCoins,
  IconInbox,
  IconLock,
} from "@tabler/icons-react";
import { ReactNode, useEffect, useRef } from "react";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LOCKED_ACADEMY_MANAGEMENT_PATHS = [
  "/dashboard/academy/management/transfer-requests",
  "/dashboard/academy/management/extra-events",
  "/dashboard/academy/management/product-store",
];

const managementSidebarItems = [
  { name: "Dashboard", url: "/dashboard/academy/management", icon: IconDashboard },
  { name: "Chat", url: "/dashboard/academy/management/chat", icon: IconMessage },
  { name: "Coach & Players", url: "/dashboard/academy/management/coach-players", icon: IconUsers },
  { name: "Transfer Requests", url: "/dashboard/academy/management/transfer-requests", icon: IconInbox },
  { name: "Parents Management", url: "/dashboard/academy/management/parents-management", icon: IconUserCheck },
  { name: "Training Sessions", url: "/dashboard/academy/management/training-sessions", icon: IconCalendarEvent },
  { name: "Fees & Payments", url: "/dashboard/academy/management/fees-payments", icon: IconCreditCard },
  { name: "Finance Committee", url: "/dashboard/academy/management/finance-committee", icon: IconCoins },
  { name: "Matches", url: "/dashboard/academy/management/matches", icon: IconBallFootball },
  { name: "Extra Events", url: "/dashboard/academy/management/extra-events", icon: IconStar },
  { name: "Sponsors", url: "/dashboard/academy/management/sponsors", icon: IconUsersGroup },
  { name: "Academy News", url: "/dashboard/academy/management/academy-news", icon: IconNews },
  { name: "Success Story", url: "/dashboard/academy/management/success-story", icon: IconTrophy },
  { name: "Game Reports", url: "/dashboard/academy/management/game-reports", icon: IconFileText },
  { name: "Validate CV", url: "/dashboard/academy/management/validate-cv", icon: IconFileText },
  { name: "Player Evaluation", url: "/dashboard/academy/management/player-evaluation", icon: IconUsers },
  { name: "Analytics Report", url: "/dashboard/academy/management/analytics-report", icon: IconChartBar },
  { name: "Product Store", url: "/dashboard/academy/management/product-store", icon: IconBuildingStore },
  { name: "My Subscription", url: "/dashboard/academy/management/my-subscription", icon: IconCreditCard },
  { name: "Settings", url: "/dashboard/academy/management/settings", icon: IconSettings },
];

const AcademyManagementLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathRef = useRef<string | null>(null);

  // Academy subscription check
  const { data: subscriptionResponse, isLoading: isSubLoading } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const isCurrentRouteLocked = LOCKED_ACADEMY_MANAGEMENT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Route protection: If unsubscribed academy navigates directly to locked route
  useEffect(() => {
    if (isCurrentRouteLocked && !isSubLoading && !hasActiveSubscription) {
      if (redirectedPathRef.current !== pathname) {
        redirectedPathRef.current = pathname;
        toast.error(
          "Active subscription (Elite Plan) required to access this feature. Redirecting to subscription..."
        );
        router.replace("/dashboard/academy/management/my-subscription");
      }
    } else if (!isCurrentRouteLocked) {
      redirectedPathRef.current = null;
    }
  }, [isSubLoading, hasActiveSubscription, isCurrentRouteLocked, pathname, router]);

  const currentSidebarItems = managementSidebarItems.map((item) => {
    const isLocked = !hasActiveSubscription && LOCKED_ACADEMY_MANAGEMENT_PATHS.some((path) => item.url === path);
    return {
      ...item,
      isLocked,
      lockedMessage:
        "Active subscription (Elite Plan) required to access this feature. Please subscribe.",
      lockedRedirectUrl: "/dashboard/academy/management/my-subscription",
    };
  });

  // Guard content rendering if unsubscribed academy visits locked route directly
  let content = children;
  if (isCurrentRouteLocked) {
    if (isSubLoading) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Checking subscription status...</p>
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
              Subscription Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An active subscription (Elite Plan) is required to access Tournaments & Events, Product Store, and Player Transfer Requests. Please upgrade your plan to unlock these features.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/academy/management/my-subscription">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black font-bold">
                View Subscription Plans
              </Button>
            </Link>
            <Link href="/dashboard/academy/management">
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
      showToggle={true}
    >
      {content}
    </DashboardLayout>
  );
};

export default AcademyManagementLayout;
