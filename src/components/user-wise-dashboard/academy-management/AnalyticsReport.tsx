/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  IconDownload,
  IconCurrencyDollar,
  IconTrendingUp,
  IconUsers,
  IconTrophy,
  IconFileText,
  IconBallFootball,
  IconClipboardText,
  IconArrowsTransferDown,
  IconId,
  IconLoader2,
  IconCalendar,
  IconBuildingStore,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useGetAcademyAnalyticsReportQuery } from "@/redux/features/academy/academyApi";
import { BASE_URL } from "@/constants/global.constant";
import { getToken } from "@/helpers/SessionHelper";
import { SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";

// ─── Shared Tooltip Style ───────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "16px",
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  color: "#fff",
};

// ─── Section Heading ────────────────────────────────────────────────────────
const SectionHeading = ({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}) => {
  return (
    <div className="flex items-center gap-4">
      <div className={`size-10 rounded-xl flex items-center justify-center border ${color}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
          {title}
        </h2>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

// ─── Analytics Report Skeleton Loader ─────────────────────────────────────
const AnalyticsReportSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 md:gap-10 pb-12 animate-pulse w-full max-w-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2.5 min-w-0">
          <div className="h-9 md:h-10 w-64 md:w-80 bg-white/10 rounded-2xl" />
          <div className="h-4 w-48 md:w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="h-12 w-44 bg-white/10 rounded-2xl border border-white/10 shrink-0" />
      </div>

      {/* 4 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl min-w-0"
          >
            <div className="size-12 md:size-14 shrink-0 bg-white/10 rounded-2xl" />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-7 md:h-8 w-28 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Financial Analytics Skeleton (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown Skeleton */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 shadow-2xl h-[420px]">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-white/10 rounded-lg" />
            <div className="h-3 w-64 bg-white/5 rounded" />
          </div>
          <div className="flex-1 bg-white/5 rounded-2xl flex items-end justify-between p-6 gap-2">
            {[35, 65, 25, 80, 50, 40, 70, 55, 60, 75, 30, 65].map((h, idx) => (
              <div
                key={idx}
                className="w-full bg-white/10 rounded-t-md"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Expenses Distribution Skeleton */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 shadow-2xl h-[420px]">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-white/10 rounded-lg" />
            <div className="h-3 w-40 bg-white/5 rounded" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="size-48 rounded-full border-12 border-white/10 bg-white/5" />
          </div>
        </div>
      </div>

      {/* Game Reports Skeleton */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white/10" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-36 bg-white/10 rounded" />
            <div className="h-3 w-60 bg-white/5 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 h-[380px]">
            <div className="h-5 w-44 bg-white/10 rounded" />
            <div className="flex-1 bg-white/5 rounded-2xl" />
          </div>
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 h-[380px]">
            <div className="h-5 w-44 bg-white/10 rounded" />
            <div className="flex-1 bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Player Evaluations Skeleton */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white/10" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-44 bg-white/10 rounded" />
            <div className="h-3 w-72 bg-white/5 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 h-[380px]">
            <div className="h-5 w-48 bg-white/10 rounded" />
            <div className="flex-1 bg-white/5 rounded-2xl" />
          </div>
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 h-[380px]">
            <div className="h-5 w-48 bg-white/10 rounded" />
            <div className="flex-1 flex items-center justify-center">
              <div className="size-48 rounded-full border-2 border-dashed border-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Skeleton */}
      <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6">
        <div className="h-6 w-44 bg-white/10 rounded-lg" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/2 border border-white/10 rounded-[20px] md:rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white/10" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-48 bg-white/10 rounded" />
                  <div className="h-3 w-28 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-10 w-32 bg-white/10 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AnalyticsReport = () => {
  const { data: response, isLoading, isError, refetch } = useGetAcademyAnalyticsReportQuery();
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [isExportingFull, setIsExportingFull] = useState(false);

  const reportData = response?.data;
  const overview = reportData?.overview;
  const financial = reportData?.financialAnalytics;
  const gameReports = reportData?.gameReportsAnalytics;
  const playerEvaluations = reportData?.playerEvaluationsAnalytics;
  const transfers = reportData?.transfersAnalytics;
  const cvValidation = reportData?.playerCvValidationAnalytics;
  const detailedReports = reportData?.detailedReports || [];

  // Helper for downloading PDF reports via relative/absolute URLs
  const handleDownloadPdf = async (url: string, filename: string, reportId?: string) => {
    if (!url) {
      ErrorToast("Download URL is not available");
      return;
    }

    if (reportId) {
      setDownloadingReportId(reportId);
    } else {
      setIsExportingFull(true);
    }

    try {
      let fullUrl = url;
      if (!url.startsWith("http")) {
        const cleanBase = (BASE_URL || "").replace(/\/+$/, "");
        const cleanPath = url.startsWith("/") ? url : `/${url}`;
        fullUrl = `${cleanBase}${cleanPath}`;
      }

      const token = getToken();
      const res = await fetch(fullUrl, {
        method: "GET",
        headers: token
          ? {
              Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
            }
          : {},
      });

      if (!res.ok) {
        throw new Error("Failed to download PDF report");
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "analytics_report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      SuccessToast("Report downloaded successfully");
    } catch {
      // Direct window fallback in case of CORS or streaming response
      let fullUrl = url;
      if (!url.startsWith("http")) {
        const cleanBase = (BASE_URL || "").replace(/\/+$/, "");
        const cleanPath = url.startsWith("/") ? url : `/${url}`;
        fullUrl = `${cleanBase}${cleanPath}`;
      }
      window.open(fullUrl, "_blank");
    } finally {
      if (reportId) {
        setDownloadingReportId(null);
      } else {
        setIsExportingFull(false);
      }
    }
  };

  // ─── Format Radar Data for Average Skill Scores ───
  const radarChartData = (playerEvaluations?.averageSkillScores || []).map((item) => ({
    subject: item.axis,
    value: item.value,
    fullMark: item.fullMark,
  }));

  // ─── Format Expenses Pie Data ───
  const expensePieData = (financial?.expensesDistribution?.categories || []).map((cat) => ({
    name: cat.label,
    value: cat.value,
    color: cat.color,
    percentage: cat.percentage,
  }));

  // ─── Format Transfer Status Pie Data ───
  const transferPieData = (transfers?.transferStatusOverview?.slices || []).map((slice) => ({
    name: slice.label,
    value: slice.count,
    color: slice.color,
    percentage: slice.percentage,
  }));

  // ─── Format CV Tier Distribution Pie Data ───
  const cvTierPieData = (cvValidation?.cvTierDistribution?.slices || []).map((slice) => ({
    name: slice.label,
    value: slice.count,
    color: slice.color,
    percentage: slice.percentage,
  }));

  // Loading skeleton state
  if (isLoading) {
    return <AnalyticsReportSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 md:gap-10 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="min-w-0 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none truncate md:whitespace-normal">
              Analytics Report
            </h1>
            {overview?.reportingPeriod && (
              <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white/70 flex items-center gap-1.5 tracking-wider">
                <IconCalendar size={13} className="text-[#E31B23]" />
                {overview.reportingPeriod}
              </span>
            )}
          </div>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 wrap-break-word">
            {overview?.academyName ? `${overview.academyName} • ` : ""}
            Financial, performance, and operational analytics
          </p>
        </div>

        <button
          type="button"
          disabled={isExportingFull || isLoading}
          onClick={() =>
            handleDownloadPdf(
              reportData?.exportReportUrl || "/api/v1/academies/analytics-report/export?reportType=FULL_ANALYTICS&year=2026",
              `analytics_report_${overview?.reportingPeriod?.replace(/\s+/g, "_") || "2026"}.pdf`
            )
          }
          className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isExportingFull ? (
            <IconLoader2 size={20} className="animate-spin shrink-0" />
          ) : (
            <IconDownload size={20} className="shrink-0" />
          )}
          <span className="text-sm font-bold uppercase tracking-widest truncate">
            {isExportingFull ? "Exporting..." : "Export Report"}
          </span>
        </button>
      </div>

      {/* Error Retry Banner */}
      {isError && !isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-[#E31B23]/10 border border-[#E31B23]/25 rounded-3xl gap-4">
          <div>
            <p className="text-sm font-black text-white uppercase font-orbitron">
              Unable to load live analytics report
            </p>
            <p className="text-xs text-white/60 mt-1">
              Please check your network connection or try refreshing the data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-xl bg-[#E31B23] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C2181F] transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Stats Grid (4 Cards from overview.cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
        {[
          {
            label: "Total Revenue",
            value: overview?.cards?.totalRevenue?.formatted || "$0",
            icon: IconCurrencyDollar,
            color: "text-[#E31B23]",
            bg: "bg-[#E31B23]/10",
          },
          {
            label: "Total Expenses",
            value: overview?.cards?.totalExpenses?.formatted || "$0",
            icon: IconTrendingUp,
            color: "text-[#4ADE80]",
            bg: "bg-[#4ADE80]/10",
          },
          {
            label: "Active Players",
            value: overview?.cards?.activePlayers?.formatted || "0",
            icon: IconUsers,
            color: "text-[#60A5FA]",
            bg: "bg-[#60A5FA]/10",
          },
          {
            label: "Matches Won",
            value: overview?.cards?.matchesWon?.formatted || "0",
            icon: IconTrophy,
            color: "text-[#FBBF24]",
            bg: "bg-[#FBBF24]/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl hover:border-white/25 transition-all group min-w-0"
          >
            <div
              className={`size-12 md:size-14 shrink-0 ${stat.bg} rounded-2xl flex items-center justify-center border border-white/5`}
            >
              <stat.icon size={28} className={`md:size-8 ${stat.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">
                {stat.label}
              </p>
              <p className="text-2xl md:text-3xl font-black text-white font-orbitron tracking-tight truncate">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Financial Analytics: Revenue Breakdown & Expenses Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase text-white font-orbitron">
                Revenue Breakdown
              </h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Monthly income across fees, events, and shop
              </p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financial?.revenueBreakdown || []}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: any, name: any) => [`$${Number(value || 0).toLocaleString()}`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="rect"
                  formatter={(v) => (
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mr-4">
                      {v}
                    </span>
                  )}
                />
                <Bar dataKey="fees" name="Fees" fill="#E31B23" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="events" name="Events" fill="#FF4D4D" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="store" name="Store" fill="#FFB3B3" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Distribution */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase text-white font-orbitron">
                Expenses Distribution
              </h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Total Expenses: ${Number(financial?.expensesDistribution?.total || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={entry.color || "#808080"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#fff" }}
                    formatter={(val: any, name: any) => [`$${Number(val || 0).toFixed(2)}`, name]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    formatter={(v, entry: any) => (
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        {v} ({entry?.payload?.percentage ?? 0}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-white/40">
                <p className="text-xs uppercase font-bold">No expense categories recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          GAME REPORTS ANALYTICS
      ══════════════════════════════════════ */}
      <div className="flex flex-col gap-6">
        <SectionHeading
          icon={<IconBallFootball size={20} className="text-[#60A5FA]" />}
          title="Game Reports"
          subtitle="Monthly match reports and performance tracking"
          color="border-[#60A5FA]/20 bg-[#60A5FA]/10"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Report Volume */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                Monthly Report Volume
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Match outcomes (Wins, Draws, Losses) submitted by coaches
              </p>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gameReports?.monthlyReportVolume || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="rect"
                    formatter={(v) => (
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mr-3">
                        {v}
                      </span>
                    )}
                  />
                  <Bar dataKey="wins" name="Wins" fill="#4ADE80" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="draws" name="Draws" fill="#FBBF24" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="losses" name="Losses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Game Reports Trend Area */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                Reports Trend
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Total monthly report submissions volume
              </p>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={gameReports?.reportsTrend || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    name="Reports"
                    stroke="#60A5FA"
                    strokeWidth={2.5}
                    fill="url(#reportsGrad)"
                    dot={{ fill: "#60A5FA", strokeWidth: 0, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          PLAYER EVALUATIONS ANALYTICS
      ══════════════════════════════════════ */}
      <div className="flex flex-col gap-6">
        <SectionHeading
          icon={<IconClipboardText size={20} className="text-[#4ADE80]" />}
          title="Player Evaluations"
          subtitle="Monthly evaluation completion status and skill assessments"
          color="border-[#4ADE80]/20 bg-[#4ADE80]/10"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evaluation Status Bar Chart */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                Evaluation Status by Month
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Completed vs Pending vs Expired evaluations
              </p>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={playerEvaluations?.evaluationStatusByMonth || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="rect"
                    formatter={(v) => (
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mr-3">
                        {v}
                      </span>
                    )}
                  />
                  <Bar dataKey="completed" name="Completed" fill="#4ADE80" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="pending" name="Pending" fill="#FBBF24" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="expired" name="Expired" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Skill Scores Radar */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                Average Skill Scores
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Aggregated academy-wide evaluation scores
              </p>
            </div>
            <div className="h-75 w-full">
              {radarChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                    />
                    <Radar
                      name="Academy Avg"
                      dataKey="value"
                      stroke="#4ADE80"
                      fill="#4ADE80"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-white/40 text-xs">
                  No evaluation skills recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TRANSFERS ANALYTICS
      ══════════════════════════════════════ */}
      <div className="flex flex-col gap-6">
        <SectionHeading
          icon={<IconArrowsTransferDown size={20} className="text-[#FBBF24]" />}
          title="Transfers"
          subtitle="Monthly incoming, outgoing, and pending transfer movements"
          color="border-[#FBBF24]/20 bg-[#FBBF24]/10"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transfer Activity Trend */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                Transfer Activity Trend
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Monthly flow of player movements
              </p>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={transfers?.transferActivityTrend || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="plainline"
                    formatter={(v) => (
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mr-3">
                        {v}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="incoming"
                    name="Incoming"
                    stroke="#4ADE80"
                    strokeWidth={2.5}
                    dot={{ fill: "#4ADE80", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="outgoing"
                    name="Outgoing"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    dot={{ fill: "#EF4444", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke="#FBBF24"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ fill: "#FBBF24", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transfer Status Overview Donut */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                Transfer Status Overview
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Total Transfer Requests: {transfers?.transferStatusOverview?.total ?? 0}
              </p>
            </div>
            <div className="h-75 w-full flex items-center justify-center">
              {transferPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transferPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {transferPieData.map((entry, i) => (
                        <Cell key={`ts-${i}`} fill={entry.color || "#6B7280"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#fff" }} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      formatter={(v, entry: any) => (
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                          {v} ({entry?.payload?.percentage ?? 0}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-white/40 text-xs uppercase font-bold">
                  No transfer requests recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          PLAYER CV VALIDATION ANALYTICS
      ══════════════════════════════════════ */}
      <div className="flex flex-col gap-6">
        <SectionHeading
          icon={<IconId size={20} className="text-[#F97316]" />}
          title="Player CV Validation"
          subtitle="Monthly validated CVs grouped by Tier: Gold, Silver, and Bronze"
          color="border-[#F97316]/20 bg-[#F97316]/10"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CV Validation Bar Chart */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                Validations by Month &amp; Tier
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Volume of CVs certified each month
              </p>
            </div>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cvValidation?.validationsByMonthAndTier || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={tooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="rect"
                    formatter={(v) => (
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mr-3">
                        {v}
                      </span>
                    )}
                  />
                  <Bar dataKey="gold" name="Gold" fill="#FBBF24" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="silver" name="Silver" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={14} />
                  <Bar dataKey="bronze" name="Bronze" fill="#F97316" radius={[4, 4, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CV Tier Distribution Donut */}
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
            <div>
              <h3 className="text-base font-black uppercase text-white font-orbitron">
                CV Tier Distribution
              </h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                Total Validated: {cvValidation?.cvTierDistribution?.total ?? 0} CVs
              </p>
            </div>
            <div className="h-75 w-full flex items-center justify-center">
              {cvTierPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cvTierPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {cvTierPieData.map((entry, i) => (
                        <Cell key={`cv-${i}`} fill={entry.color || "#F59E0B"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#fff" }} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      formatter={(v, entry: any) => (
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                          {v} ({entry?.payload?.percentage ?? 0}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-white/40 text-xs uppercase font-bold">
                  No validated CVs recorded
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cumulative CV Validations Area Chart */}
        <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl min-w-0 w-full max-w-full overflow-hidden">
          <div>
            <h3 className="text-base font-black uppercase text-white font-orbitron">
              Cumulative CV Validations
            </h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
              Monthly validation trend showing Gold, Silver, and Bronze growth
            </p>
          </div>
          <div className="h-70 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cvValidation?.cumulativeCvValidations || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="silverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bronzeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.4)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="rect"
                  formatter={(v) => (
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 mr-3">
                      {v}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="gold"
                  name="Gold"
                  stroke="#FBBF24"
                  strokeWidth={2.5}
                  fill="url(#goldGrad)"
                  dot={{ fill: "#FBBF24", r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="silver"
                  name="Silver"
                  stroke="#CBD5E1"
                  strokeWidth={2}
                  fill="url(#silverGrad)"
                  dot={{ fill: "#CBD5E1", r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="bronze"
                  name="Bronze"
                  stroke="#F97316"
                  strokeWidth={2}
                  fill="url(#bronzeGrad)"
                  dot={{ fill: "#F97316", r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Detailed Reports List (Dynamic from detailedReports) ── */}
      <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 md:gap-8 shadow-2xl w-full">
        <div>
          <h2 className="text-xl font-black uppercase text-white font-orbitron">
            Detailed Reports
          </h2>
          <p className="text-xs text-white/40 uppercase tracking-wider font-bold mt-1">
            Export specific financial, match, and event reports
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {detailedReports.length > 0 ? (
            detailedReports.map((report) => {
              const isThisDownloading = downloadingReportId === report.id;
              return (
                <div
                  key={report.id}
                  className="bg-white/2 border border-white/10 rounded-[20px] md:rounded-3xl p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 hover:border-white/20 transition-all group min-w-0"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 w-full sm:w-auto">
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors shrink-0">
                      <IconFileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                        {report.title}
                      </h3>
                      <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                        {report.period || report.subtitle}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isThisDownloading}
                    onClick={() =>
                      handleDownloadPdf(
                        report.downloadPdfUrl,
                        `${report.title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
                        report.id
                      )
                    }
                    className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/15 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg cursor-pointer shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isThisDownloading ? (
                      <>
                        <IconLoader2 size={13} className="animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <IconDownload size={13} />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-white/40 text-xs font-bold uppercase tracking-wider">
              No detailed reports available for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReport;
