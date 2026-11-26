"use client";

import MyImagesSection from "@/components/cvs/player-cv-details/MyImageSection";
import PerformanceChart from "@/components/dashboard/player/PerformanceChart";
import PlayerBioSection from "@/components/dashboard/player/PlayerBioSection";
import RightSideContent from "@/components/dashboard/player/RightSideContent";
import MyVideosSection from "@/components/cvs/player-cv-details/MyVideoSection";
import CVSection from "@/components/dashboard/player/CVSection";
import GameReportSection from "@/components/dashboard/player/GaMeReportSection";
import PlayerDashboardSkeleton from "@/components/dashboard/player/PlayerDashboardSkeleton";
import { usePlayer } from "@/hooks/usePlayer";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";

import { PlayerStatsProvider } from "@/components/cvs/player-cv-details/FullEditablePage";

const PlayerDashboard = () => {
  // Show a skeleton until the player's own data has loaded — never the
  // built-in sample data or "locked" states that flip once data arrives.
  const { isInitialLoading } = usePlayer();
  const { isLoading: isSubscriptionLoading } = useGetMySubscriptionQuery();

  if (isInitialLoading || isSubscriptionLoading) {
    return <PlayerDashboardSkeleton />;
  }

  return (
    <PlayerStatsProvider>
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-8 h-full min-h-[87vh] text-white">
        {/* left  */}
        <div className="xl:col-span-5 h-full">
          <PlayerBioSection />
          <PerformanceChart />
          <CVSection />
          <MyImagesSection />
          <MyVideosSection />
          <GameReportSection />
        </div>
        {/* right */}
        <div className="xl:col-span-2 h-full">
          <RightSideContent />
        </div>
      </div>
    </PlayerStatsProvider>
  );
};

export default PlayerDashboard;
