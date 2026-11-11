"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  IconDashboard, 
  IconUser, 
  IconSearch, 
  IconFileText, 
  IconStar, 
  IconChartBar, 
  IconSettings,
  IconMessageCircle,
  IconCreditCard,
  IconLock,
  IconShieldCheck,
} from "@tabler/icons-react";
import { ReactNode, useEffect, useRef } from "react";
import { GlobalUploadWidget } from "@/providers/MediaUploadProvider";
import { useGetClubProfileQuery } from "@/redux/features/club/clubApi";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LOCKED_CLUB_PATHS = [
  "/dashboard/club/scouting-board",
  "/dashboard/club/cvs-library",
  "/dashboard/club/player-cv",
  "/dashboard/club/analytics",
];

const clubSidebarItems = [
  { name: "Dashboard", url: "/dashboard/club", icon: IconDashboard },
  { name: "Club Profile", url: "/dashboard/club/club-profile", icon: IconUser },
  { name: "Scouting Board", url: "/dashboard/club/scouting-board", icon: IconSearch },
  { name: "CVs Library", url: "/dashboard/club/cvs-library", icon: IconFileText },
  { name: "Success Story", url: "/dashboard/club/success-story", icon: IconStar },
  { name: "Analytics", url: "/dashboard/club/analytics", icon: IconChartBar },
  { name: "Chat", url: "/dashboard/club/chat", icon: IconMessageCircle },
  { name: "My Subscription", url: "/dashboard/club/my-subscription", icon: IconCreditCard },
  { name: "Settings", url: "/dashboard/club/settings", icon: IconSettings },
];

const ClubLayout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathRef = useRef<string | null>(null);

  // 1. Club profile & admin approval check
  const { data: profileResponse, isLoading: isProfileLoading } = useGetClubProfileQuery();
  const clubProfile = profileResponse?.data;
  const verificationStatus = (
    clubProfile?.verification?.status ||
    clubProfile?.verificationStatus ||
    ""
  ).toUpperCase();
  const isApproved = verificationStatus === "APPROVED";

  // 2. Club subscription check
  const { data: subscriptionResponse, isLoading: isSubscriptionLoading } =
    useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(
    subscriptionResponse?.data?.hasActiveSubscription
  );

  const isCurrentRouteLocked = LOCKED_CLUB_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Route protection: If club navigates directly to a locked route without approval or active subscription
  useEffect(() => {
    if (isCurrentRouteLocked && !isProfileLoading && !isSubscriptionLoading) {
      if (!isApproved) {
        if (redirectedPathRef.current !== pathname) {
          redirectedPathRef.current = pathname;
          toast.error(
            "Club admin approval is required to access scouting features. Please complete your verification."
          );
          router.replace("/dashboard/club/club-profile");
        }
      } else if (!hasActiveSubscription) {
        if (redirectedPathRef.current !== pathname) {
          redirectedPathRef.current = pathname;
          toast.error(
            "Active club subscription required to access scouting portal, game reports, and player transfers."
          );
          router.replace("/dashboard/club/my-subscription");
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

  const currentSidebarItems = clubSidebarItems.map((item) => {
    const isLockedPath = LOCKED_CLUB_PATHS.some((path) => item.url === path);
    if (!isLockedPath) {
      return item;
    }

    if (!isApproved) {
      return {
        ...item,
        isLocked: true,
        lockedMessage:
          "Club admin approval is required to access scouting features. Please complete your verification.",
        lockedRedirectUrl: "/dashboard/club/club-profile",
      };
    }

    if (!hasActiveSubscription) {
      return {
        ...item,
        isLocked: true,
        lockedMessage:
          "Active subscription required to access scouting portal, match reports, and player transfers.",
        lockedRedirectUrl: "/dashboard/club/my-subscription",
      };
    }

    return item;
  });

  const tierName =
    clubProfile?.tier ||
    clubProfile?.bannerInfo?.tier ||
    (hasActiveSubscription ? "ACTIVE CLUB" : "FREE CLUB");

  // Guard content rendering if unapproved or unsubscribed club navigates directly to locked route
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
            <IconShieldCheck className="size-8 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              Admin Approval Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your professional club account is currently pending admin verification. Please ensure your official authorization and club registration documents are submitted.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/club/club-profile">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black font-bold">
                View Club Verification
              </Button>
            </Link>
            <Link href="/dashboard/club">
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
              An active subscription is required to access the Professional Scouting Engine, Full Match Reports with 36 Performance Indicators, Player Transfer Requests, and Trial Invitations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/club/my-subscription">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-black font-bold">
                View Subscription Plans
              </Button>
            </Link>
            <Link href="/dashboard/club">
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
      <GlobalUploadWidget />
      {content}
    </DashboardLayout>
  );
};

export default ClubLayout;
