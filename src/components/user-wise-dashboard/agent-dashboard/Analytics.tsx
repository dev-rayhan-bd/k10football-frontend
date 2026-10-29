/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  IconUsers,
  IconHeart,
  IconShare,
  IconEye,
  IconRefresh,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useGetAgentAnalyticsQuery } from "@/redux/features/agent/agentApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const yearOptions = [
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
  { label: "2030", value: "2030" },
];

const fallbackAreaData = [
  { week: "Week 1", views: 0 },
  { week: "Week 2", views: 0 },
  { week: "Week 3", views: 0 },
  { week: "Week 4", views: 0 },
];

const fallbackBarData = [
  { week: "Week 1", likes: 0, shares: 0 },
  { week: "Week 2", likes: 0, shares: 0 },
  { week: "Week 3", likes: 0, shares: 0 },
  { week: "Week 4", likes: 0, shares: 0 },
];

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-xl shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-[#E31B23] font-bold text-sm">views : {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-xl shadow-xl">
        <p className="text-white font-bold text-xs mb-1">{label}</p>
        {payload.map((item: any, idx: number) => (
          <p
            key={idx}
            className={cn(
              "text-xs font-semibold",
              item.dataKey === "likes" ? "text-[#E31B23]" : "text-white"
            )}
          >
            {item.name} : {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AgentAnalytics = () => {
  const [year, setYear] = useState("2026");

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAgentAnalyticsQuery({ year });

  const analytics = response?.data;
  const overview = analytics?.overview;

  const areaData =
    analytics?.cvsViewsOverTime && analytics.cvsViewsOverTime.length > 0
      ? analytics.cvsViewsOverTime
      : fallbackAreaData;

  const barData =
    analytics?.likesAndSharesActivity && analytics.likesAndSharesActivity.length > 0
      ? analytics.likesAndSharesActivity
      : fallbackBarData;

  return (
    <div className="p-2 md:p-6 flex flex-col gap-6">
      {/* Header with Title and Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide mb-1">
            {analytics?.title || "Analytics For Players Monitored"}
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            {analytics?.subtitle ||
              "Insights Based on Players Interactions, Profile Activity & Performance Data."}
          </p>
        </div>

        {/* Year Dropdown Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-black uppercase tracking-widest text-white/50">
            YEAR:
          </span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={isFetching}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-white/30 cursor-pointer disabled:opacity-50"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {/* Overview Cards Skeleton */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6 animate-pulse">
            <div className="h-6 w-64 rounded bg-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#181818] border border-white/10 rounded-2xl p-5 flex flex-col gap-4"
                >
                  <div className="size-10 rounded-xl bg-white/10" />
                  <div className="flex flex-col gap-2">
                    <div className="h-8 w-16 rounded bg-white/10" />
                    <div className="h-3 w-28 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-4 h-[420px]">
              <div className="h-6 w-48 rounded bg-white/10" />
              <div className="h-3 w-32 rounded bg-white/5" />
              <div className="flex-1 rounded-2xl bg-white/5 mt-4" />
            </div>
            <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-4 h-[420px]">
              <div className="h-6 w-48 rounded bg-white/10" />
              <div className="h-3 w-32 rounded bg-white/5" />
              <div className="flex-1 rounded-2xl bg-white/5 mt-4" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
          <IconAlertTriangle className="size-8 text-destructive" />
          <p className="text-sm font-bold text-destructive">Failed to load analytics</p>
          <Button
            type="button"
            onClick={() => refetch()}
            variant="outline"
            className="mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
          >
            <IconRefresh size={14} className="mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Overview Section */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white font-orbitron tracking-wide mb-1">
              Overview Of Agent Activity ({year})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-3 group hover:border-[#E31B23]/30 transition-all">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E31B23] group-hover:bg-[#E31B23]/10 transition-colors">
                  <IconUsers className="size-5" />
                </div>
                <p className="text-3xl font-black text-white italic">
                  {overview?.playersProfileViewed?.count ?? 0}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {overview?.playersProfileViewed?.label || "Players Profile Viewed"}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-3 group hover:border-[#E31B23]/30 transition-all">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E31B23] group-hover:bg-[#E31B23]/10 transition-colors">
                  <IconHeart className="size-5" />
                </div>
                <p className="text-3xl font-black text-white italic">
                  {overview?.likedCvs?.count ?? 0}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {overview?.likedCvs?.label || "Liked CVs"}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-3 group hover:border-[#E31B23]/30 transition-all">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E31B23] group-hover:bg-[#E31B23]/10 transition-colors">
                  <IconShare className="size-5" />
                </div>
                <p className="text-3xl font-black text-white italic">
                  {overview?.sharedProfiles?.count ?? 0}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {overview?.sharedProfiles?.label || "Shared Profiles"}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-3 group hover:border-[#E31B23]/30 transition-all">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E31B23] group-hover:bg-[#E31B23]/10 transition-colors">
                  <IconEye className="size-5" />
                </div>
                <p className="text-3xl font-black text-white italic">
                  {overview?.profileViews?.count ?? 0}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {overview?.profileViews?.label || "Profile Views"}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* CVs Views Over Time */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-bold font-orbitron mb-1">
                    CVs Views Over Time ({year})
                  </h3>
                  <p className="text-gray-500 text-xs">Your profile viewing trends</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={areaData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E31B23" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#E31B23" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#333"
                        vertical={true}
                        horizontal={false}
                      />
                      <XAxis
                        dataKey="week"
                        stroke="#666"
                        tick={{ fill: "#666", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#666"
                        tick={{ fill: "#666", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={<CustomAreaTooltip />}
                        cursor={{ stroke: "#555", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        name="views"
                        stroke="#E31B23"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        dot={{
                          r: 4,
                          fill: "#111",
                          stroke: "#E31B23",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: "#E31B23",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Likes & Shares Activity */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-bold font-orbitron mb-1">
                    Likes & Shares Activity ({year})
                  </h3>
                  <p className="text-gray-500 text-xs">Your interaction patterns</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      barSize={16}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#333"
                        vertical={true}
                        horizontal={false}
                      />
                      <XAxis
                        dataKey="week"
                        stroke="#666"
                        tick={{ fill: "#666", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#666"
                        tick={{ fill: "#666", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#222" }} />
                      <Legend
                        iconType="square"
                        align="center"
                        verticalAlign="bottom"
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "12px",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="likes" name="Likes" fill="#E31B23" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="shares" name="Shares" fill="#ffffff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentAnalytics;
