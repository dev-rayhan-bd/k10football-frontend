/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { usePlayer } from "@/hooks/usePlayer";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { useGetMyGameReportsQuery } from "@/redux/features/player/playerApi";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PerformanceChart = () => {
  const { playerData, cvData } = usePlayer();
  const router = useRouter();
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const { data: gameReportsResponse } = useGetMyGameReportsQuery({ page: 1, limit: 20 });
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const toSafeNumber = (...candidates: unknown[]): number => {
    for (const val of candidates) {
      if (val === null || val === undefined || val === "") continue;
      const parsed =
        typeof val === "number"
          ? val
          : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return 0;
  };

  const toSafePercent = (...candidates: unknown[]): number => {
    const n = toSafeNumber(...candidates);
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  const apiReports = gameReportsResponse?.data?.reports || [];
  const recentMatches = Array.isArray(cvData?.recentMatches) ? cvData.recentMatches : [];

  const totalGoals = Math.round(
    toSafeNumber(
      cvData?.matchSummary?.totalGoals,
      cvData?.performanceStats?.goals,
      playerData?.seasonStats?.goals,
      apiReports.reduce((sum, r) => sum + toSafeNumber(r.performanceMetrics?.goals), 0)
    )
  );
  const totalAssists = Math.round(
    toSafeNumber(
      cvData?.matchSummary?.totalAssists,
      cvData?.performanceStats?.assists,
      playerData?.seasonStats?.assists,
      apiReports.reduce((sum, r) => sum + toSafeNumber(r.performanceMetrics?.assists), 0)
    )
  );
  const totalMatches = Math.round(
    toSafeNumber(
      cvData?.matchSummary?.totalMatches,
      cvData?.performanceStats?.matches,
      playerData?.seasonStats?.matches,
      gameReportsResponse?.data?.summary?.totalReports,
      apiReports.length
    )
  );

  const validPassAccValues = recentMatches
    .map((m: any) => toSafeNumber(m?.passAccuracy))
    .filter((v: number) => v > 0);
  const computedMatchPassAcc =
    validPassAccValues.length > 0
      ? Math.round(
          validPassAccValues.reduce((sum: number, v: number) => sum + v, 0) /
            validPassAccValues.length
        )
      : undefined;

  const avgPassAccuracy = toSafePercent(
    cvData?.matchSummary?.avgPassAccuracy,
    computedMatchPassAcc,
    (cvData as any)?.attributes?.categories?.technical?.shortPassing,
    playerData?.strengths?.passing
  );

  const shotAccuracy = toSafePercent(
    (cvData as any)?.matchSummary?.avgShotAccuracy,
    (cvData as any)?.attributes?.categories?.technical?.finishing,
    playerData?.strengths?.shooting,
    playerData?.performanceMetrics?.shootAccuracy
  );

  const dribbleSuccess = toSafePercent(
    (cvData as any)?.matchSummary?.avgDribbleSuccess,
    (cvData as any)?.attributes?.categories?.technical?.dribbling,
    playerData?.strengths?.dribbling,
    playerData?.performanceMetrics?.dribbleSuccess
  );

  const visionScore = toSafePercent(
    (cvData as any)?.attributes?.categories?.tactical?.vision,
    playerData?.strengths?.passing
  );
  const strengthScore = toSafePercent(
    (cvData as any)?.attributes?.categories?.physical?.strength,
    playerData?.strengths?.physical
  );

  const radarData = [
    { subject: "Vision", value: visionScore },
    { subject: "Strength", value: strengthScore },
    { subject: "Pace", value: toSafePercent(playerData?.strengths?.pace) },
    { subject: "Passing", value: toSafePercent(playerData?.strengths?.passing) },
    { subject: "Shooting", value: toSafePercent(playerData?.strengths?.shooting) },
    { subject: "Dribbling", value: toSafePercent(playerData?.strengths?.dribbling) },
  ];

  const stats = [
    { label: "Goals", value: String(totalGoals) },
    { label: "Assists", value: String(totalAssists) },
    { label: "Matches", value: String(totalMatches) },
  ];

  const accuracyMetrics = [
    { label: "Pass Accuracy", value: avgPassAccuracy },
    { label: "Shot Accuracy", value: shotAccuracy },
    { label: "Dribble Success", value: dribbleSuccess },
  ];

  const handleFullAnalyticsClick = () => {
    if (!hasActiveSubscription) {
      toast.error("Active Athlete Membership required to access full performance analytics.");
      router.push("/dashboard/player/my-subscription");
      return;
    }
    router.push("/dashboard/player/analytics");
  };

  return (
    <div className="py-8 sm:py-14 md:py-20 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading text-white mb-1 uppercase">
              Performance Analytics
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">Season 2024/25</p>
          </div>
          <button
            onClick={handleFullAnalyticsClick}
            className="self-start sm:self-auto px-5 py-2 border border-gray-600 text-gray-300 rounded-xl hover:border-gray-400 transition text-xs font-orbitron uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            {!hasActiveSubscription && <Lock className="size-3.5 text-red-500" />}
            <span>Full Analytics</span>
          </button>
        </div>

        {/* Main Content Container with relative wrapper for lock overlay */}
        <div className="relative">
          {!hasActiveSubscription && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10 border border-white/10">
              <div className="size-12 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 mb-3">
                <Lock className="size-6" />
              </div>
              <h3 className="text-white font-heading font-bold text-lg sm:text-xl uppercase tracking-wide mb-1">
                Advanced Match Charts & Heatmap Locked
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm max-w-md mb-5 leading-relaxed">
                Active Athlete Membership plan is required to unlock detailed radar performance analysis, match heatmaps, and progress graphs.
              </p>
              <button
                onClick={() => router.push("/dashboard/player/my-subscription")}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider font-orbitron transition cursor-pointer shadow-lg shadow-red-600/20"
              >
                Unlock with Athlete Membership
              </button>
            </div>
          )}

          <div
            className={cn(
              "flex flex-col lg:flex-row gap-8 lg:gap-12",
              !hasActiveSubscription && "opacity-35 pointer-events-none select-none"
            )}
          >
            {/* Left - Radar Chart */}
            <div className="flex-1 w-full min-h-75 min-w-0">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <PolarGrid stroke="#333333" />
                  <PolarAngleAxis dataKey="subject" stroke="#666666" tick={{ fill: "#999999", fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#333333" tick={{ fill: "#666666", fontSize: 10 }} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#dc2626"
                    fill="#991b1b"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Right - Stats and Metrics */}
            <div className="flex-1 w-full min-w-0">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 sm:p-5 text-center">
                    <p className="text-red-600 text-2xl sm:text-3xl font-bold mb-1 font-orbitron">{stat.value}</p>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Accuracy Metrics */}
              <div className="flex flex-col gap-4 sm:gap-6">
                {accuracyMetrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-xs sm:text-sm">{metric.label}</span>
                      <span className="text-red-500 font-bold text-xs sm:text-sm font-orbitron">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-red-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
