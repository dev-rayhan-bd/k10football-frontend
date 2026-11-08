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
  IconCreditCard
} from "@tabler/icons-react";
import { ReactNode, useState, useEffect, createContext } from "react";
import { useCoach } from "@/hooks/useCoach";

export const CoachContext = createContext<{ hasAcademy: boolean }>({ hasAcademy: false });

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

  useEffect(() => {
    if (coachData?.coachType) {
      setHasAcademy(coachData.coachType === "CLUB_COACH");
    }
  }, [coachData?.coachType]);

  const currentSidebarItems = hasAcademy ? coachSidebarItemsWithAcademy : coachSidebarItemsWithoutAcademy;

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

  return (
    <CoachContext.Provider value={{ hasAcademy }}>
      <DashboardLayout
        sidebarItems={currentSidebarItems}
        tier={{ name: tierName, color: tierColor }}
        customToggle={customToggle}
      >
        {children}
      </DashboardLayout>
    </CoachContext.Provider>
  );
};
export default CoachLayout;
