/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import {
  IconUsers,
  IconCurrencyDollar,
  IconFileText,
  IconChevronDown,
  IconCheck,
} from "@tabler/icons-react";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAdminAnalyticsQuery } from "@/redux/features/admin/adminApi";
import { cn } from "@/lib/utils";
import { StatCardSkeleton, ChartSkeleton } from "@/components/dashboard/TableSkeleton";

const AnalyticsStatCard = ({
  icon: Icon,
  value,
  label,
  subtext,
}: {
  icon: any;
  value: string | number;
  label: string;
  subtext?: string;
}) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-2xl p-6 flex flex-col gap-4 flex-1 min-w-0">
    <div className="size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-white text-3xl font-black font-orbitron">{value}</p>
      <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{label}</p>
      {subtext && <p className="text-white/30 text-[10px] mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const ROLE_COLORS: Record<string, string> = {
  PLAYER: "#FF9999",
  Player: "#FF9999",
  COACH: "#FF0000",
  Coach: "#FF0000",
  ACADEMY: "#CC0000",
  Academy: "#CC0000",
  AGENT: "#FFB3B3",
  Agent: "#FFB3B3",
  CLUB: "#990000",
  Club: "#990000",
  Clubs: "#990000",
};

const ROLE_OPTIONS = [
  "All Roles",
  "Player",
  "Coach",
  "Academy",
  "Agent",
  "Clubs",
] as const;

type RoleOption = (typeof ROLE_OPTIONS)[number];

const CustomGrowthTooltip = ({ active, payload, label, selectedRole }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1A1A1A] rounded-xl p-3 shadow-xl border border-white/20 min-w-44 text-xs">
        <p className="text-[#E31B23] font-bold mb-1.5 font-orbitron">{label}</p>
        {selectedRole === "All Roles" ? (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-white font-bold pb-1 border-b border-white/10">
              <span className="text-white/70">New Users:</span>
              <span className="text-white">{data.total ?? data.value}</span>
            </div>
            {data.cumulativeTotal !== undefined && (
              <div className="flex justify-between items-center text-white/60 text-[11px]">
                <span>Cumulative Total:</span>
                <span className="font-semibold text-white/90">{data.cumulativeTotal}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1 text-[10px] text-white/50">
              <div>
                Player: <span className="text-white/80 font-bold">{data.Player ?? 0}</span>
              </div>
              <div>
                Coach: <span className="text-white/80 font-bold">{data.Coach ?? 0}</span>
              </div>
              <div>
                Academy: <span className="text-white/80 font-bold">{data.Academy ?? 0}</span>
              </div>
              <div>
                Agent: <span className="text-white/80 font-bold">{data.Agent ?? 0}</span>
              </div>
              <div className="col-span-2">
                Clubs: <span className="text-white/80 font-bold">{data.Clubs ?? 0}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center text-white font-bold">
            <span className="text-white/70">{selectedRole}:</span>
            <span className="text-[#E31B23] text-sm font-orbitron">{payload[0].value}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const raw = payload[0]?.payload;
    return (
      <div className="bg-[#1A1A1A] rounded-xl p-3 shadow-xl border border-white/20 min-w-52 text-xs">
        <p className="text-[#E31B23] font-bold mb-1.5 font-orbitron">{label}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white/40" />
              Subscriptions:
            </span>
            <span className="font-bold text-white">
              {raw?.subscriptions ?? 0}{" "}
              <span className="text-white/50 text-[10px]">
                (${Number(raw?.subscriptionRevenue ?? 0).toFixed(2)})
              </span>
            </span>
          </div>
          <div className="flex justify-between items-center text-white/80">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white/20" />
              Game Reports:
            </span>
            <span className="font-bold text-white">
              {raw?.reports ?? 0}{" "}
              <span className="text-white/50 text-[10px]">
                (${Number(raw?.reportRevenue ?? 0).toFixed(2)})
              </span>
            </span>
          </div>
          {raw?.totalRevenue !== undefined && (
            <div className="flex justify-between items-center pt-1.5 border-t border-white/10 font-bold text-white">
              <span className="text-white/60">Total Revenue:</span>
              <span className="text-emerald-400">
                $
                {Number(raw.totalRevenue).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1A1A1A] rounded-xl p-3 shadow-xl border border-white/20 min-w-36 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-2.5 rounded-sm" style={{ backgroundColor: data.fill }} />
          <p className="text-white font-bold font-orbitron">{data.name}</p>
        </div>
        <div className="flex justify-between items-center text-white/70">
          <span>Users:</span>
          <span className="font-bold text-white">{data.value}</span>
        </div>
        <div className="flex justify-between items-center text-white/70">
          <span>Share:</span>
          <span className="font-bold text-emerald-400">{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  percentage,
  value,
}: any) => {
  const displayVal = percentage ?? value;
  if (!displayVal || displayVal <= 0) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent !== undefined && percent < 0.05) return null;

  let fontSize = "12px";
  if (percent !== undefined) {
    if (percent >= 0.5) fontSize = "20px";
    else if (percent >= 0.2) fontSize = "16px";
    else if (percent >= 0.06) fontSize = "14px";
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="font-black font-orbitron drop-shadow-md"
      style={{ fontSize }}
    >
      {`${displayVal}%`}
    </text>
  );
};

const SuperAdminAnalytics = () => {
  const { data: analyticsRes, isLoading, isError, refetch } =
    useGetAdminAnalyticsQuery();

  const [selectedRole, setSelectedRole] = useState<RoleOption>("All Roles");

  const analytics = analyticsRes?.data;

  // Stat card values
  const totalUsersFormatted =
    analytics?.summary?.totalUsers !== undefined
      ? Number(analytics.summary.totalUsers).toLocaleString()
      : "—";

  const revenueFormatted =
    analytics?.summary?.revenue !== undefined
      ? `${analytics.summary.currency || "$"} ${Number(
          analytics.summary.revenue
        ).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—";

  const gameReportsFormatted =
    analytics?.summary?.gameReports !== undefined
      ? Number(analytics.summary.gameReports).toLocaleString()
      : "—";

  // Growth Chart Data
  const growthChartData = useMemo(() => {
    const list = analytics?.userGrowthByRole;
    if (list && list.length > 0) {
      return list.map((item) => {
        let val = item.total ?? 0;
        if (selectedRole === "Player") val = item.Player ?? item.player ?? 0;
        else if (selectedRole === "Coach") val = item.Coach ?? item.coach ?? 0;
        else if (selectedRole === "Academy") val = item.Academy ?? item.academy ?? 0;
        else if (selectedRole === "Agent") val = item.Agent ?? item.agent ?? 0;
        else if (selectedRole === "Clubs") val = item.Clubs ?? item.Club ?? item.clubs ?? 0;

        return {
          name: item.period || item.label || `Period ${item.bucketIndex || ""}`,
          value: val,
          total: item.total ?? 0,
          cumulativeTotal: item.cumulativeTotal,
          Player: item.Player ?? item.player ?? 0,
          Coach: item.Coach ?? item.coach ?? 0,
          Academy: item.Academy ?? item.academy ?? 0,
          Agent: item.Agent ?? item.agent ?? 0,
          Clubs: item.Clubs ?? item.Club ?? item.clubs ?? 0,
        };
      });
    }
    return [
      { name: "Jan-Feb", value: 0 },
      { name: "Mar-Apr", value: 0 },
      { name: "May-Jun", value: 0 },
      { name: "Jul-Aug", value: 0 },
      { name: "Sept-Oct", value: 0 },
      { name: "Nov-Dec", value: 0 },
    ];
  }, [analytics?.userGrowthByRole, selectedRole]);

  const maxGrowthValue = useMemo(() => {
    const vals = growthChartData.map((d) => d.value);
    const max = Math.max(...vals, 0);
    return Math.max(10, Math.ceil(max * 1.25));
  }, [growthChartData]);

  // User Role Distribution Data
  const pieChartData = useMemo(() => {
    const list = analytics?.userRoleDistribution;
    if (list && list.length > 0) {
      return list.map((item) => ({
        name: item.name || item.label || item.role,
        role: item.role,
        value: item.count ?? item.value ?? 0,
        percentage: item.roundedPercentage ?? Math.round(item.percentage) ?? 0,
        fill:
          ROLE_COLORS[item.role] ||
          ROLE_COLORS[item.name] ||
          ROLE_COLORS[item.label] ||
          "#E31B23",
      }));
    }
    return [];
  }, [analytics?.userRoleDistribution]);

  // Revenue Breakdown Data
  const revenueChartData = useMemo(() => {
    const list = analytics?.revenueBreakdown;
    if (list && list.length > 0) {
      return list.map((item) => ({
        name: item.period || item.label || `Period ${item.bucketIndex || ""}`,
        subscriptions: item.subscriptions ?? 0,
        reports: item.reports ?? 0,
        subscriptionRevenue: item.subscriptionRevenue ?? 0,
        reportRevenue: item.reportRevenue ?? 0,
        otherRevenue: item.otherRevenue ?? 0,
        totalRevenue: item.totalRevenue ?? 0,
      }));
    }
    return [
      { name: "Jan-Feb", subscriptions: 0, reports: 0, subscriptionRevenue: 0, reportRevenue: 0, totalRevenue: 0 },
      { name: "Mar-Apr", subscriptions: 0, reports: 0, subscriptionRevenue: 0, reportRevenue: 0, totalRevenue: 0 },
      { name: "May-Jun", subscriptions: 0, reports: 0, subscriptionRevenue: 0, reportRevenue: 0, totalRevenue: 0 },
      { name: "Jul-Aug", subscriptions: 0, reports: 0, subscriptionRevenue: 0, reportRevenue: 0, totalRevenue: 0 },
      { name: "Sept-Oct", subscriptions: 0, reports: 0, subscriptionRevenue: 0, reportRevenue: 0, totalRevenue: 0 },
      { name: "Nov-Dec", subscriptions: 0, reports: 0, subscriptionRevenue: 0, reportRevenue: 0, totalRevenue: 0 },
    ];
  }, [analytics?.revenueBreakdown]);

  const maxRevCount = useMemo(() => {
    const vals = revenueChartData.flatMap((d) => [d.subscriptions, d.reports]);
    const max = Math.max(...vals, 0);
    return Math.max(10, Math.ceil(max * 1.25));
  }, [revenueChartData]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 shrink-0 w-full min-w-0">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">
            Analytics
          </h1>
          <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">
            Insights and metrics across the platform
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Refresh Analytics"
        >
          <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6 sm:gap-8 w-full min-w-0">
          <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 min-w-0 w-full overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>
          <ChartSkeleton />
        </div>
      ) : isError ? (
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-destructive text-sm font-semibold">
            Failed to load platform analytics.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 min-w-0 w-full overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <AnalyticsStatCard
                icon={IconUsers}
                value={isLoading ? "..." : totalUsersFormatted}
                label="Total users"
                subtext={
                  analytics?.summary?.allTimeTotalUsers !== undefined
                    ? `All-time: ${Number(analytics.summary.allTimeTotalUsers).toLocaleString()}`
                    : undefined
                }
              />
              <AnalyticsStatCard
                icon={IconCurrencyDollar}
                value={isLoading ? "..." : revenueFormatted}
                label="Revenue"
                subtext={
                  analytics?.summary?.subscriptionRevenue !== undefined
                    ? `Subscriptions: $${Number(analytics.summary.subscriptionRevenue).toFixed(2)} | Reports: $${Number(analytics.summary.gameReportRevenue ?? 0).toFixed(2)}`
                    : undefined
                }
              />
              <AnalyticsStatCard
                icon={IconFileText}
                value={isLoading ? "..." : gameReportsFormatted}
                label="Game Reports"
              />
            </div>
          </div>

          {/* Main Charts Section */}
          <div className="flex flex-col gap-6 sm:gap-8 w-full min-w-0">
            {/* User Growth By Role */}
            <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 min-w-0 w-full">
              <div className="flex justify-between items-start sm:items-center gap-4 sm:gap-0 w-full min-w-0 shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight truncate w-full sm:w-auto">
                    User Growth By Role
                  </h2>
                  {isLoading && <Loader2 className="size-4 animate-spin text-primary" />}
                </div>

                {/* Role Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-black/40 border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 shrink-0 hover:text-white"
                    >
                      {selectedRole} <IconChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-[#18181b] border-white/10 text-white rounded-xl min-w-36"
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={cn(
                          "text-xs font-bold flex items-center justify-between cursor-pointer rounded-lg hover:bg-white/10",
                          selectedRole === role ? "text-[#E31B23]" : "text-white/80"
                        )}
                      >
                        {role}
                        {selectedRole === role && <IconCheck size={14} className="text-[#E31B23]" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="h-62.5 sm:h-75 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#ffffff40"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#ffffff40"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      domain={[0, maxGrowthValue]}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<CustomGrowthTooltip selectedRole={selectedRole} />}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#E31B23"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#E31B23", strokeWidth: 2, stroke: "#111111" }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend / Clickable Filters */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-4 w-full">
                {(["Player", "Coach", "Academy", "Agent", "Clubs"] as const).map((role) => {
                  const isActive = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(isActive ? "All Roles" : role)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full border transition-all cursor-pointer shrink-0 text-[10px] sm:text-xs font-bold",
                        isActive
                          ? "bg-[#E31B23]/20 border-[#E31B23] text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20"
                      )}
                    >
                      <div className="w-3 sm:w-4 h-1 bg-[#E31B23] rounded-full relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 sm:size-2 rounded-full border border-sm sm:border-2 border-[#E31B23] bg-[#111111]" />
                      </div>
                      <span>{role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full min-w-0">
              {/* User Role Distribution */}
              <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 relative overflow-hidden min-w-0 w-full">
                <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight text-center lg:text-left z-10 w-full truncate">
                  User Role Distribution
                </h2>
                <div className="h-62.5 sm:h-100 w-full relative flex flex-col items-center justify-center min-w-0">
                  {pieChartData.length === 0 || pieChartData.every((d) => d.value === 0) ? (
                    <div className="text-white/40 text-xs font-semibold py-16 text-center">
                      No user distribution data available.
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={0}
                            outerRadius="80%"
                            paddingAngle={1}
                            dataKey="value"
                            stroke="none"
                            labelLine={false}
                            label={renderCustomizedLabel}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Legend */}
                      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 sm:mt-4 w-full">
                        {pieChartData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <div
                              className="size-2.5 sm:size-3 rounded-sm shrink-0"
                              style={{ backgroundColor: entry.fill }}
                            />
                            <span className="text-white/60 text-[10px] sm:text-xs font-bold">
                              {entry.name}{" "}
                              <span className="text-white/30 font-medium">({entry.percentage}%)</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 min-w-0 w-full">
                <div className="flex justify-between items-center w-full min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight truncate w-full">
                    Revenue Breakdown
                  </h2>
                </div>

                <div className="h-62.5 sm:h-100 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#ffffff40"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#ffffff40"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        domain={[0, maxRevCount]}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={<CustomBarTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      />
                      <Bar
                        dataKey="subscriptions"
                        fill="#ffffff40"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                        name="Subscriptions"
                      />
                      <Bar
                        dataKey="reports"
                        fill="#ffffff20"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                        name="Game Reports"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Legend */}
                <div className="flex justify-center gap-6 mt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-sm bg-white/40" />
                    <span className="text-white/60 font-semibold text-[11px]">Subscriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-sm bg-white/20" />
                    <span className="text-white/60 font-semibold text-[11px]">Game Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminAnalytics;
