"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  IconDashboard, 
  IconUser, 
  IconRosetteFilled, 
  IconSearch, 
  IconHeart, 
  IconShare, 
  IconStar, 
  IconChartBar, 
  IconSettings,
  IconMessageCircle,
  IconCreditCard,
  IconLock
} from "@tabler/icons-react";
import { ReactNode, useEffect, useRef } from "react";
import { useGetAgentProfileQuery } from "@/redux/features/agent/agentApi";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LOCKED_AGENT_PATHS = [
  "/dashboard/agent/discover-players",
  "/dashboard/agent/liked-cvs",
  "/dashboard/agent/shared-profiles",
  "/dashboard/agent/success-story",
  "/dashboard/agent/analytics",
];

const agentSidebarItems = [
  { name: "Dashboard", url: "/dashboard/agent", icon: IconDashboard },
  { name: "My Profile", url: "/dashboard/agent/my-profile", icon: IconUser },
  { name: "Licensed Verification", url: "/dashboard/agent/licensed-verification", icon: IconRosetteFilled },
  { name: "Discover Players", url: "/dashboard/agent/discover-players", icon: IconSearch },
  { name: "Liked CVs", url: "/dashboard/agent/liked-cvs", icon: IconHeart },
  { name: "Shared Profiles", url: "/dashboard/agent/shared-profiles", icon: IconShare },
  { name: "Success Story", url: "/dashboard/agent/success-story", icon: IconStar },
  { name: "Analytics", url: "/dashboard/agent/analytics", icon: IconChartBar },
  { name: "My Subscription", url: "/dashboard/agent/my-subscription", icon: IconCreditCard },
  { name: "Chat", url: "/dashboard/agent/chat", icon: IconMessageCircle },
  { name: "Settings", url: "/dashboard/agent/settings", icon: IconSettings },
];

const AgentLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathRef = useRef<string | null>(null);

  // 1. Agent profile verification check
  const { data: profileResponse, isLoading: isProfileLoading } = useGetAgentProfileQuery();
  const agentProfile = profileResponse?.data;
  const isApproved = agentProfile?.verificationStatus === "APPROVED";

  // 2. Agent subscription check
  const { data: subscriptionResponse, isLoading: isSubscriptionLoading } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const isCurrentRouteLocked = LOCKED_AGENT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Route protection: If agent navigates directly to a locked route without verification or active subscription
  useEffect(() => {
    if (isCurrentRouteLocked && !isProfileLoading && !isSubscriptionLoading) {
      if (!isApproved) {
        if (redirectedPathRef.current !== pathname) {
          redirectedPathRef.current = pathname;
          toast.error(
            "Agent license verification is required to access this feature. Please complete your verification."
          );
          router.replace("/dashboard/agent/licensed-verification");
        }
      } else if (!hasActiveSubscription) {
        if (redirectedPathRef.current !== pathname) {
          redirectedPathRef.current = pathname;
          toast.error(
            "Active subscription required to access this feature. Redirecting to subscription..."
          );
          router.replace("/dashboard/agent/my-subscription");
        }
      }
    } else if (!isCurrentRouteLocked) {
      redirectedPathRef.current = null;
    }
  }, [
    isProfileLoading,
    isSubscriptionLoading,
    isApproved,
    hasActiveSubscription,
    isCurrentRouteLocked,
    pathname,
    router,
  ]);

  const currentSidebarItems = agentSidebarItems.map((item) => {
    const isLockedPath = LOCKED_AGENT_PATHS.some((path) => item.url === path);
    if (!isLockedPath) {
      return item;
    }

    if (!isApproved) {
      return {
        ...item,
        isLocked: true,
        lockedMessage:
          "Agent license verification is required to access this feature. Please complete your verification.",
        lockedRedirectUrl: "/dashboard/agent/licensed-verification",
      };
    }

    if (!hasActiveSubscription) {
      return {
        ...item,
        isLocked: true,
        lockedMessage:
          "Active subscription required to access this feature. Please subscribe.",
        lockedRedirectUrl: "/dashboard/agent/my-subscription",
      };
    }

    return item;
  });

  const tierName = agentProfile?.currentTier || agentProfile?.tier || "ACTIVE AGENT";

  // Guard content rendering if unapproved or unsubscribed agent navigates directly to locked route
  let content = children;
  if (isCurrentRouteLocked) {
    if (isProfileLoading || isSubscriptionLoading) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Checking access permissions...</p>
        </div>
      );
    } else if (!isApproved) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
            <IconLock className="size-8 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              Verification Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This feature is locked until your agent license is verified and approved.
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Verification Status:</span>
              <Badge variant="secondary" className="font-semibold uppercase tracking-wider text-[11px]">
                {agentProfile?.verificationStatus || "PENDING"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/agent/licensed-verification">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black font-bold">
                View Licensed Verification
              </Button>
            </Link>
            <Link href="/dashboard/agent">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </Link>
          </div>
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
              An active subscription is required to access this feature. Please choose a subscription plan to unlock Discover Players, Liked CVs, Shared Profiles, Success Stories, and Analytics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/agent/my-subscription">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black font-bold">
                View Subscription Plans
              </Button>
            </Link>
            <Link href="/dashboard/agent">
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
      tier={{ name: tierName, color: "#00FF62" }}
    >
      {content}
    </DashboardLayout>
  );
};

export default AgentLayout;
