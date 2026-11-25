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
  IconMessageCircle,
} from "@tabler/icons-react";
import { ReactNode, useState, useEffect, createContext } from "react";
import { useCoach } from "@/hooks/useCoach";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export const CoachContext = createContext<{ hasAcademy: boolean }>({ hasAcademy: false });

const SUBSCRIPTION_URL = "/dashboard/coach/my-subscription";
const SUBSCRIPTION_REQUIRED_MESSAGE = "Active subscription required to access this feature. Please subscribe.";

const LOCKED_COACH_PATHS = [
  "/dashboard/coach/game-reports",
  "/dashboard/coach/player-cv-validations",
  "/dashboard/coach/player-evaluation",
];

const coachSidebarItemsWithoutAcademy = [
  { name: "Dashboard", url: "/dashboard/coach", icon: IconDashboard },
  { name: "My CV", url: "/dashboard/coach/my-cv", icon: IconFileText },
  { name: "My Images & Videos", url: "/dashboard/coach/my-images-videos", icon: IconPhotoVideo },
  { name: "Chat", url: "/dashboard/coach/chat", icon: IconMessageCircle },
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
  { name: "Chat", url: "/dashboard/coach/chat", icon: IconMessageCircle },
  { name: "Analytics", url: "/dashboard/coach/analytics", icon: IconChartBar },
  { name: "My Subscription", url: "/dashboard/coach/my-subscription", icon: IconCreditCard },
  { name: "Settings", url: "/dashboard/coach/settings", icon: IconSettings },
];

const CoachLayout = ({ children }: { children: ReactNode }) => {
  const { coachData, cvData } = useCoach();
  // The view starts from the backend coachType; any coach can switch freely.
  // (Switching is view-only — it no longer overwrites the stored coachType.)
  const apiCoachType = String(cvData?.coachType || "").toUpperCase();
  const [viewOverride, setViewOverride] = useState<boolean | null>(null);
  const hasAcademy = viewOverride ?? apiCoachType === "CLUB_COACH";
  const pathname = usePathname();
  const router = useRouter();

  const { data: subscriptionResponse, isLoading: isSubLoading } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const isCurrentRouteLocked = LOCKED_COACH_PATHS.some(
    (lockedPath) => pathname === lockedPath || pathname.startsWith(`${lockedPath}/`)
  );

  // Without an active subscription these pages are fully locked: no entry at all.
  const isBlocked = isCurrentRouteLocked && !isSubLoading && !hasActiveSubscription;

  useEffect(() => {
    if (!isBlocked) return;
    toast.error(SUBSCRIPTION_REQUIRED_MESSAGE, { id: "coach-subscription-required" });
    router.replace(SUBSCRIPTION_URL);
  }, [isBlocked, router]);

  const baseSidebarItems = hasAcademy ? coachSidebarItemsWithAcademy : coachSidebarItemsWithoutAcademy;

  // Locked items get a lock icon; clicking them shows the error and opens My Subscription.
  const currentSidebarItems = baseSidebarItems.map((item) =>
    !isSubLoading && !hasActiveSubscription && LOCKED_COACH_PATHS.includes(item.url)
      ? { ...item, isLocked: true, lockedMessage: SUBSCRIPTION_REQUIRED_MESSAGE, lockedRedirectUrl: SUBSCRIPTION_URL }
      : item
  );

  const toggleCoachType = (isClub: boolean) => setViewOverride(isClub);

  const customToggle = (
    <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1 sm:p-1.5 gap-1 sm:gap-1.5 border border-white/5 ml-auto sm:ml-2 shrink-0">
      <button
        onClick={() => toggleCoachType(false)}
        className={`px-2 sm:px-4 py-1.5 rounded-md text-[8px] sm:text-[11px] font-bold uppercase tracking-wider transition-all leading-tight text-center whitespace-nowrap sm:whitespace-normal ${!hasAcademy ? 'bg-[#E31B23] text-white' : 'text-white/40 hover:text-white/60'}`}
      >
        Individual <span className="hidden sm:inline">Coach</span>
      </button>
      <div
        role="switch"
        aria-checked={hasAcademy}
        onClick={() => toggleCoachType(!hasAcademy)}
        className="w-8 sm:w-10 h-4 sm:h-5 shrink-0 bg-white/10 rounded-full relative cursor-pointer group border border-white/5 mx-0.5 sm:mx-0"
      >
        <div className={`absolute top-1/2 -translate-y-1/2 w-3 sm:w-3.5 h-3 sm:h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${hasAcademy ? 'right-0.5' : 'left-0.5'}`}></div>
      </div>
      <button
        type="button"
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

  // Never render a locked page's content — not even while the subscription is loading.
  const shouldHideContent = isCurrentRouteLocked && (isSubLoading || !hasActiveSubscription);
  const content = shouldHideContent ? (
    <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
      {isSubLoading ? "Checking subscription..." : "Redirecting to My Subscription..."}
    </div>
  ) : (
    children
  );

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
