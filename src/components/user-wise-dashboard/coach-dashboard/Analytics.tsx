/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  IconTrophy,
  IconChartBar,
  IconRefresh,
  IconAlertCircle,
  IconAward,
  IconBallFootball,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import { useGetMyCoachAnalyticsQuery } from "@/redux/features/coach/coachApi";
import { ICoachTrophyTableRow } from "@/types/coach.type";

const trophyColumns: Column<ICoachTrophyTableRow>[] = [
  {
    header: "Trophies Name",
    key: "trophyName",
    cellClassName: "text-xs font-bold text-gray-200 uppercase",
  },
  {
    header: "Number",
    key: "number",
    align: "center",
    cellClassName: "text-sm text-white font-bold font-orbitron",
  },
  {
    header: "Win",
    key: "win",
    align: "center",
    cellClassName: "text-sm text-emerald-400 font-semibold font-orbitron",
  },
  {
    header: "Loss",
    key: "loss",
    align: "center",
    cellClassName: "text-sm text-red-400 font-semibold font-orbitron",
  },
  {
    header: "Draw",
    key: "draw",
    align: "center",
    cellClassName: "text-sm text-amber-400 font-semibold font-orbitron",
  },
  {
    header: "Runner Up",
    key: "runnerUp",
    align: "center",
    cellClassName: "text-sm text-white/80 font-orbitron",
  },
  {
    header: "Champion",
    key: "champion",
    align: "center",
    cellClassName: "text-sm text-amber-300 font-bold font-orbitron",
  },
];

const Analytics = () => {
  const {
    data: analyticsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetMyCoachAnalyticsQuery();

  const analytics = analyticsResponse?.data;
  const profileAnalysis = analytics?.coachProfileAnalysis;
  const tournamentStats = analytics?.tournamentStats;
  const majorTrophies = analytics?.majorTrophies || [];
  const trophiesTable = analytics?.trophiesTable || [];

  // Radar chart data
  const profileAnalysisData = useMemo(() => {
    if (!profileAnalysis) {
      return [
        { subject: "Tactics", A: 0, fullMark: 100 },
        { subject: "Leadership", A: 0, fullMark: 100 },
        { subject: "Communication", A: 0, fullMark: 100 },
        { subject: "Adaptability", A: 0, fullMark: 100 },
        { subject: "Discipline", A: 0, fullMark: 100 },
        { subject: "Development", A: 0, fullMark: 100 },
      ];
    }
    return [
      { subject: "Tactics", A: profileAnalysis.tactics ?? 0, fullMark: 100 },
      { subject: "Leadership", A: profileAnalysis.leadership ?? 0, fullMark: 100 },
      { subject: "Communication", A: profileAnalysis.communication ?? 0, fullMark: 100 },
      { subject: "Adaptability", A: profileAnalysis.adaptability ?? 0, fullMark: 100 },
      { subject: "Discipline", A: profileAnalysis.discipline ?? 0, fullMark: 100 },
      { subject: "Development", A: profileAnalysis.development ?? 0, fullMark: 100 },
    ];
  }, [profileAnalysis]);

  // Tournament Stats Pie chart data
  const tournamentStatsData = useMemo(() => {
    const percentages = tournamentStats?.percentages;
    return [
      {
        name: "WIN",
        value: percentages?.win ?? 0,
        count: tournamentStats?.win ?? 0,
        color: "#A80000",
      },
      {
        name: "LOSS",
        value: percentages?.loss ?? 0,
        count: tournamentStats?.loss ?? 0,
        color: "#FF1A1A",
      },
      {
        name: "DRAW",
        value: percentages?.draw ?? 0,
        count: tournamentStats?.draw ?? 0,
        color: "#FF9999",
      },
      {
        name: "RUNNER UP",
        value: percentages?.runnerUp ?? 0,
        count: tournamentStats?.runnerUp ?? 0,
        color: "#FF4D4D",
      },
      {
        name: "CHAMPION",
        value: percentages?.champion ?? 0,
        count: tournamentStats?.champion ?? 0,
        color: "#FFEBEB",
      },
    ];
  }, [tournamentStats]);

  // Bar chart data for major trophies
  const barChartData = useMemo(() => {
    if (!majorTrophies.length) {
      return [];
    }
    const maxVal = Math.max(...majorTrophies.map((t) => t.value));
    return majorTrophies.map((t) => ({
      name: t.name,
      value: t.value,
      highlight: t.value === maxVal,
    }));
  }, [majorTrophies]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-12 animate-pulse w-full max-w-full overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="h-9 w-48 bg-white/10 rounded-xl" />
            <div className="h-4 w-72 bg-white/5 rounded-md" />
          </div>
          <div className="h-9 w-28 bg-white/5 rounded-xl border border-white/10" />
        </div>

        {/* Top Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-[#0D0D0D] h-96 flex flex-col justify-between">
            <div className="h-5 w-40 bg-white/10 rounded-md" />
            <div className="size-48 rounded-full bg-white/5 mx-auto" />
            <div className="h-4 w-32 bg-white/5 rounded-md" />
          </div>
          <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-[#0D0D0D] h-96 flex flex-col justify-between">
            <div className="h-5 w-40 bg-white/10 rounded-md" />
            <div className="size-48 rounded-full bg-white/5 mx-auto" />
            <div className="h-4 w-48 bg-white/5 rounded-md mx-auto" />
          </div>
        </div>

        {/* Major Trophies Skeleton */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-[#0D0D0D] h-80 flex flex-col justify-between">
          <div className="h-5 w-36 bg-white/10 rounded-md" />
          <div className="h-44 bg-white/5 rounded-xl" />
        </div>

        {/* Table Skeleton */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-[#0D0D0D] h-64 flex flex-col justify-between">
          <div className="h-5 w-36 bg-white/10 rounded-md" />
          <div className="h-32 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#0D0D0D] rounded-3xl border border-white/15 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <div className="size-16 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center text-[#FF3B30] mb-5 shadow-[0_0_20px_rgba(255,59,48,0.2)]">
          <IconAlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-white font-orbitron uppercase tracking-tight mb-2">
          Failed to Load Analytics
        </h2>
        <p className="text-white/60 text-sm max-w-md mb-6">
          We encountered an issue fetching your coach analytics data. Please check your network connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] text-xs font-bold uppercase tracking-wider text-white px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(227,27,35,0.3)] cursor-pointer"
        >
          <IconRefresh size={16} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase font-orbitron">
              Analytics
            </h1>
            {analytics?.coachType && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-white border border-white/15">
                {analytics.coachType.replace(/_/g, " ")}
              </span>
            )}
            {analytics?.cvTier && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-300 border border-amber-400/30">
                {analytics.cvTier} TIER
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Deep insights into coaching performance and leadership
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          title="Refresh analytics data"
        >
          <IconRefresh
            size={15}
            className={cn(isFetching && "animate-spin text-[#E31B23]")}
          />
          <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Coach Profile Analysis */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0D0D0D] flex flex-col justify-between gap-6 shadow-xl">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <IconAward className="size-5 text-[#E31B23]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest italic font-orbitron">
                Coach Profile Analysis
              </h3>
            </div>
            {profileAnalysis?.overall !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E31B23]/10 border border-[#E31B23]/30">
                <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
                  Overall:
                </span>
                <span className="text-xs font-black text-[#E31B23] font-orbitron">
                  {profileAnalysis.overall}
                </span>
              </div>
            )}
          </div>

          <div className="h-80 sm:h-88 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="70%"
                data={profileAnalysisData}
              >
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#999", fontSize: 10, fontWeight: "bold" }}
                />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#E31B23"
                  fill="#E31B23"
                  fillOpacity={0.65}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#E31B23", fontWeight: "bold" }}
                  formatter={(val: any) => [`${val} / 100`, "Score"]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Tournament Stats */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0D0D0D] flex flex-col justify-between gap-6 shadow-xl">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <IconBallFootball className="size-5 text-[#E31B23]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest italic font-orbitron">
                Tournament Stats
              </h3>
            </div>
            {tournamentStats?.totalMatches !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15">
                <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
                  Matches:
                </span>
                <span className="text-xs font-black text-white font-orbitron">
                  {tournamentStats.totalMatches}
                </span>
              </div>
            )}
          </div>

          <div className="h-80 sm:h-88 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tournamentStatsData}
                  cx="50%"
                  cy="46%"
                  outerRadius={110}
                  dataKey="value"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    index,
                  }) => {
                    if (percent < 0.04) return null;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text
                        x={x}
                        y={y}
                        fill={index === 4 ? "#000" : "#fff"}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[11px] font-black font-orbitron"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {tournamentStatsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0D0D0D" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${item.payload.count} matches)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: "16px" }}
                  formatter={(value) => (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mr-2">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart Section: Major Trophies */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <IconTrophy className="size-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest italic font-orbitron">
              Major Trophies
            </h3>
          </div>
          {majorTrophies.length > 0 && (
            <span className="text-xs font-bold text-white/50 font-mono">
              Total Titles: {majorTrophies.reduce((a, b) => a + b.value, 0)}
            </span>
          )}
        </div>

        {barChartData.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <IconTrophy size={22} />
            </div>
            <p className="text-sm font-bold text-white/70">No major trophies recorded yet</p>
            <p className="text-xs text-white/40">
              Tournament trophies and championships will appear here once added to your coach profile.
            </p>
          </div>
        ) : (
          <div className="h-75 sm:h-96 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 10, fontWeight: "bold" }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    padding: "10px 15px",
                    color: "#fff",
                  }}
                  itemStyle={{
                    color: "#E31B23",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  labelStyle={{
                    color: "#888",
                    fontSize: "10px",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                  formatter={(val: any) => [`${val} Trophy`, "Titles Won"]}
                />
                <Bar
                  dataKey="value"
                  radius={[12, 12, 0, 0]}
                  barSize={40}
                >
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.highlight ? "#E31B23" : "#333"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Trophies Table Section */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <IconChartBar className="size-5 text-[#E31B23]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest italic font-orbitron">
              Trophies Breakdown
            </h3>
          </div>
          <span className="text-xs font-bold text-white/50 font-mono">
            ({trophiesTable.length} Competitions)
          </span>
        </div>

        {trophiesTable.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/40">
            No tournament breakdown data available.
          </div>
        ) : (
          <DashboardTable
            columns={trophyColumns}
            data={trophiesTable}
            className="border-white/10"
          />
        )}
      </div>
    </div>
  );
};

export default Analytics;
