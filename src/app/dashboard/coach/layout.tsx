"use client";
import DashboardLayout from "@/components/DashboardLayout";
import {
  IconDashboard,
  IconFileText,
  IconPhotoVideo,
  IconChartBar,
  IconSettings,
  IconUsers,
  IconReport,
  IconUserCheck,
  IconClipboardCheck,
  IconCreditCard,
  IconLock,
} from "@tabler/icons-react";
import { ReactNode, useState, useEffect, createContext, useRef } from "react";
import { useCoach } from "@/hooks/useCoach";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const CoachContext = createContext<{ hasAcademy: boolean }>({ hasAcademy: false });

const LOCKED_COACH_PATHS = [
  "/dashboard/coach/game-reports",
  "/dashboard/coach/player-cv-validations",
  "/dashboard/coach/player-evaluation",
];

const coachSidebarItemsWithoutAcademy = [
  { name: "Dashboard", url: "/dashboard/coach", icon: IconDashboard },
  { name: "My CV", url: "/dashboard/coach/my-cv", icon: IconFileText },
  { name: "My Images & Videos", url: "/dashboard/coach/my-images-videos", icon: IconPhotoVideo },
  { name: "Analytics", url: "/dashboard/coach/analytics", icon: IconChartBar },
  { name: "My Subscription", url: "/dashboard/coach/my-subscription", icon: IconCreditCard },
  { name: "Settings", url: "/dashboard/coach/settings", icon: IconSettings },
];

const coachSidebarItemsWithAcademy = [
  { name: "Dashboard", url: "/dashboard/coach", icon: IconDashboard },
  { name: "My CV", url: "/dashboard/coach/my-cv", icon: IconFileText },
  { name: "My Images & Videos", url: "/dashboard/coach/my-images-videos", icon: IconPhotoVideo },
  { name: "My Teams", url: "/dashboard/coach/my-teams", icon: IconUsers },
  { name: "Game Reports", url: "/dashboard/coach/game-reports", icon: IconReport },
  { name: "Player CV Validations", url: "/dashboard/coach/player-cv-validations", icon: IconUserCheck },
  { name: "Player Evaluation", url: "/dashboard/coach/player-evaluation", icon: IconClipboardCheck },
  { name: "Analytics", url: "/dashboard/coach/analytics", icon: IconChartBar },
  { name: "My Subscription", url: "/dashboard/coach/my-subscription", icon: IconCreditCard },
  { name: "Settings", url: "/dashboard/coach/settings", icon: IconSettings },
];

const CoachLayout = ({ children }: { children: ReactNode }) => {
  const { coachData, handleUpdate } = useCoach();
  const [hasAcademy, setHasAcademy] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const redirectedPathRef = useRef<string | null>(null);

  const { data: subscriptionResponse, isLoading: isSubLoading } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  useEffect(() => {
    if (coachData?.coachType) {
      setHasAcademy(coachData.coachType === "CLUB_COACH");
    }
  }, [coachData?.coachType]);

  const isCurrentRouteLocked = LOCKED_COACH_PATHS.some(
    (lockedPath) => pathname === lockedPath || pathname.startsWith(`${lockedPath}/`)
  );

  // Route protection: If coach navigates directly via browser URL bar or link to a locked route without active subscription
  useEffect(() => {
    if (!isSubLoading && !hasActiveSubscription && isCurrentRouteLocked) {
      if (redirectedPathRef.current !== pathname) {
        redirectedPathRef.current = pathname;
        toast.error("Active subscription required to access this feature. Redirecting to subscription...");
        router.replace("/dashboard/coach/my-subscription");
      }
    } else if (!isCurrentRouteLocked) {
      redirectedPathRef.current = null;
    }
  }, [isSubLoading, hasActiveSubscription, isCurrentRouteLocked, pathname, router]);

  const baseSidebarItems = hasAcademy ? coachSidebarItemsWithAcademy : coachSidebarItemsWithoutAcademy;

  const currentSidebarItems = baseSidebarItems.map((item) => {
    const isLocked = !hasActiveSubscription && LOCKED_COACH_PATHS.some((path) => item.url === path);
    return {
      ...item,
      isLocked,
      lockedMessage:
        "Active subscription required to access this feature. Please subscribe.",
      lockedRedirectUrl: "/dashboard/coach/my-subscription",
    };
  });

  const toggleCoachType = (isClub: boolean) => {
    setHasAcademy(isClub);
    handleUpdate("coachType", isClub ? "CLUB_COACH" : "INDIVIDUAL_COACH");
  };

  const customToggle = (
    <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1 sm:p-1.5 gap-1 sm:gap-1.5 border border-white/5 ml-auto sm:ml-2 shrink-0">
      <button
        onClick={() => toggleCoachType(false)}
        className={`px-2 sm:px-4 py-1.5 rounded-md text-[8px] sm:text-[11px] font-bold uppercase tracking-wider transition-all leading-tight text-center whitespace-nowrap sm:whitespace-normal ${!hasAcademy ? 'bg-[#E31B23] text-white' : 'text-white/40 hover:text-white/60'}`}
      >
        Individual <span className="hidden sm:inline">Coach</span>
      </button>
      <div
        onClick={() => toggleCoachType(!hasAcademy)}
        className="w-8 sm:w-10 h-4 sm:h-5 shrink-0 bg-white/10 rounded-full relative cursor-pointer group border border-white/5 mx-0.5 sm:mx-0"
      >
        <div className={`absolute top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${hasAcademy ? 'right-0.5' : 'left-0.5'}`}></div>
      </div>
      <button
        onClick={() => toggleCoachType(true)}
        className={`px-2 sm:px-4 py-1.5 rounded-md text-[8px] sm:text-[11px] font-bold uppercase tracking-wider transition-all leading-tight text-center whitespace-nowrap sm:whitespace-normal ${hasAcademy ? 'bg-[#E31B23] text-white' : 'text-white/40 hover:text-white/60'}`}
      >
        Club <span className="hidden sm:inline">Coach</span>
      </button>
    </div>
  );

  const tierName = coachData?.cvTier
    ? coachData.cvTier.charAt(0).toUpperCase() + coachData.cvTier.slice(1).toLowerCase()
    : "Bronze";

  const tierColor =
    tierName.toLowerCase() === "gold"
      ? "#FFD700"
      : tierName.toLowerCase() === "silver"
      ? "#C0C0C0"
      : "#CD7F32";

  // Prevent rendering locked children if unsubscribed or while checking status
  let content = children;
  if (isCurrentRouteLocked) {
    if (isSubLoading) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <div className="size-8 rounded-full border-2 border-[#E31B23] border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Checking subscription access...</p>
        </div>
      );
    } else if (!hasActiveSubscription) {
      content = (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
            <IconLock className="size-8 text-[#E31B23]" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              Subscription Required
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This feature is exclusively available for subscribed coaches. You need an active subscription to access Game Reports, Player CV Validations, and Player Evaluations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/coach/my-subscription">
              <Button className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#c9151c] text-white">
                View Subscription Plans
              </Button>
            </Link>
            <Link href="/dashboard/coach">
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
    <CoachContext.Provider value={{ hasAcademy }}>
      <DashboardLayout
        sidebarItems={currentSidebarItems}
        tier={{ name: tierName, color: tierColor }}
        customToggle={customToggle}
      >
        {content}
      </DashboardLayout>
    </CoachContext.Provider>
  );
};
export default CoachLayout;
