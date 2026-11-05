"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  IconUsers, 
  IconCurrencyDollar,
  IconClock,
  IconCreditCard,
} from "@tabler/icons-react";
import { RefreshCw } from "lucide-react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { DashboardSidebarPanel, DashboardSidebarItem } from "@/components/dashboard/DashboardSidebar";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableSkeleton, { StatCardSkeleton } from "@/components/dashboard/TableSkeleton";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from "recharts";
import {
  useGetAdminAnalyticsQuery,
  useGetApprovalsQuery,
  useGetAdminPaymentsQuery,
} from "@/redux/features/admin/adminApi";
import { cn } from "@/lib/utils";

type Activity = {
  name: string;
  role: string;
  action: string;
  date: string;
  status: "Completed" | "Pending";
};

const columns: Column<Activity>[] = [
  {
    header: "Name",
    key: "name",
    align: "left",
    cellClassName: "font-semibold text-white",
  },
  {
    header: "Role",
    key: "role",
    align: "center",
    cellClassName: "text-white/60 text-sm",
  },
  {
    header: "Action",
    key: "action",
    align: "center",
    cellClassName: "text-white/80 text-sm",
  },
  {
    header: "Date",
    key: "date",
    align: "center",
    cellClassName: "text-white/60 text-sm",
  },
  {
    header: "Status",
    key: "status",
    align: "center",
    render: (row) => (
      <span
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold inline-block w-24 text-center border",
          row.status === "Completed"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        )}
      >
        {row.status}
      </span>
    ),
  },
];

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const val = Number(item.value || 0);
    return (
      <div className="bg-white text-black p-3 rounded-xl border-none shadow-lg">
        <p className="font-bold text-sm text-[#E31B23]">{label}</p>
        <p className="font-semibold text-sm">
          {item.name} : ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const val = Number(item.value || 0);
    return (
      <div className="bg-[#111111] text-white p-3 rounded-xl border border-white/10 shadow-lg">
        <p className="text-white/40 text-xs mb-1">-- {label} --</p>
        <p className="font-semibold text-sm">
          {item.name} : {val.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const getTimeAgo = (dateStr?: string) => {
  if (!dateStr) return "recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "recently";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

const SuperAdminDashboard = () => {
  const router = useRouter();

  // 1. Analytics API
  const {
    data: analyticsRes,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useGetAdminAnalyticsQuery();

  // 2. Pending Approvals API
  const {
    data: approvalsRes,
    isLoading: isApprovalsLoading,
    refetch: refetchApprovals,
  } = useGetApprovalsQuery({ role: "ALL", status: "PENDING" });

  // 3. Payments API (for revenue and recent activities)
  const {
    data: paymentsRes,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useGetAdminPaymentsQuery({ limit: 5 });

  const analytics = analyticsRes?.data;
  const isGlobalLoading = isAnalyticsLoading || isApprovalsLoading;

  const handleRefresh = () => {
    refetchAnalytics();
    refetchApprovals();
    refetchPayments();
  };

  // Stat Card 1: Total Users
  const totalUsersValue = useMemo(() => {
    if (analytics?.summary?.totalUsers !== undefined) {
      return Number(analytics.summary.totalUsers).toLocaleString();
    }
    return "0";
  }, [analytics?.summary?.totalUsers]);

  // Stat Card 2: Revenue
  const revenueValue = useMemo(() => {
    const rev = analytics?.summary?.revenue ?? paymentsRes?.meta?.summary?.totalRevenue ?? 0;
    return `${analytics?.summary?.currency || "$"} ${Number(rev).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [analytics?.summary?.revenue, analytics?.summary?.currency, paymentsRes?.meta?.summary?.totalRevenue]);

  // Stat Card 3: Pending Verifications
  const pendingCount = useMemo(() => {
    return (
      approvalsRes?.meta?.counts?.pending ??
      approvalsRes?.meta?.total ??
      0
    );
  }, [approvalsRes?.meta?.counts?.pending, approvalsRes?.meta?.total]);

  // Stat Card 4: Active Subscriptions
  const activeSubscriptionsCount = useMemo(() => {
    const subCount = paymentsRes?.meta?.summary?.breakdownByType?.SUBSCRIPTION?.count;
    if (subCount !== undefined) return subCount;
    return analytics?.summary?.gameReports ?? 0;
  }, [paymentsRes?.meta?.summary?.breakdownByType?.SUBSCRIPTION?.count, analytics?.summary?.gameReports]);

  // Bar Chart Data: Revenue Overview from analytics.revenueBreakdown
  const barChartData = useMemo(() => {
    const list = analytics?.revenueBreakdown;
    if (list && list.length > 0) {
      return list.map((item) => ({
        month: item.period || item.label || `Period ${item.bucketIndex || ""}`,
        Revenue: item.totalRevenue ?? (item.subscriptionRevenue ?? 0) + (item.reportRevenue ?? 0),
      }));
    }
    return [
      { month: "Jan-Feb", Revenue: 0 },
      { month: "Mar-Apr", Revenue: 0 },
      { month: "May-Jun", Revenue: 0 },
      { month: "Jul-Aug", Revenue: 0 },
      { month: "Sept-Oct", Revenue: 0 },
      { month: "Nov-Dec", Revenue: 0 },
    ];
  }, [analytics?.revenueBreakdown]);

  // Area Chart Data: Membership Growth from analytics.userGrowthByRole
  const areaChartData = useMemo(() => {
    const list = analytics?.userGrowthByRole;
    if (list && list.length > 0) {
      return list.map((item) => ({
        month: item.period || item.label || `Period ${item.bucketIndex || ""}`,
        Members: item.cumulativeTotal ?? item.total ?? 0,
      }));
    }
    return [
      { month: "Jan-Feb", Members: 0 },
      { month: "Mar-Apr", Members: 0 },
      { month: "May-Jun", Members: 0 },
      { month: "Jul-Aug", Members: 0 },
      { month: "Sept-Oct", Members: 0 },
      { month: "Nov-Dec", Members: 0 },
    ];
  }, [analytics?.userGrowthByRole]);

  // Pending Approvals List for Sidebar Panel
  const pendingApprovalsList = useMemo(() => {
    const list = approvalsRes?.data || [];
    return list.slice(0, 4);
  }, [approvalsRes?.data]);

  // Recent Activities Table Data
  const recentActivities = useMemo<Activity[]>(() => {
    const paymentsList = paymentsRes?.data;
    if (paymentsList && paymentsList.length > 0) {
      return paymentsList.slice(0, 5).map((p) => {
        const isCompleted =
          p.status === "COMPLETED" || p.status === "PAID" || p.status === "ACTIVE";
        return {
          name: p.userOrEntity || p.entity?.name || "User",
          role: p.entity?.role || p.type || "Member",
          action: p.notes || p.subType || p.type || "Transaction",
          date: p.date || (p.createdAt ? p.createdAt.split("T")[0] : "—"),
          status: isCompleted ? "Completed" : "Pending",
        };
      });
    }
    return [
      { name: "Marcus Silva", role: "Player", action: "Created Profile", date: "2024-01-15", status: "Completed" },
      { name: "David Chen", role: "Coach", action: "Game Reports", date: "2024-02-01", status: "Pending" },
      { name: "Alex Jonson", role: "Academy", action: "Subscription Renewed", date: "2023-12-01", status: "Completed" },
      { name: "James Brown", role: "Agent", action: "Verification", date: "2024-03-10", status: "Pending" },
      { name: "Alex Silva", role: "Club", action: "Player Liked", date: "2024-03-09", status: "Completed" },
    ];
  }, [paymentsRes?.data]);

  return (
    <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 p-4 sm:p-6 min-h-screen">
      <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0 overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          <DashboardHero
            backgroundImage="/707964211aa29e42aa7d522475b870cad9c4ad92.png"
            badgeText="SUPER ADMIN"
            title="K10 Football"
            contacts={[
              { type: "phone", label: "Contact", value: "+55 11 9999-8888" },
              { type: "email", label: "Email", value: "contact@santosfc.academy" }
            ]}
          />
          <button
            type="button"
            onClick={handleRefresh}
            className="absolute top-4 right-4 z-10 size-9 rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className={cn("size-3.5", isGlobalLoading && "animate-spin")} />
          </button>
        </div>
        
        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isAnalyticsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <DashboardStatCard 
                icon={<IconUsers className="size-6" />}
                label="Total Users"
                value={totalUsersValue}
              />
              <DashboardStatCard 
                icon={<IconCurrencyDollar className="size-6" />}
                label="Revenue This Month"
                value={revenueValue}
              />
              <DashboardStatCard 
                icon={<IconClock className="size-6" />}
                label="Pending Verifications"
                value={pendingCount.toString()}
              />
              <DashboardStatCard 
                icon={<IconCreditCard className="size-6" />}
                label="Active Subscriptions"
                value={activeSubscriptionsCount.toString()}
              />
            </>
          )}
        </div>
        
        {/* Analytics Section */}
        <div className="bg-[#111111] border border-white/15 rounded-3xl sm:rounded-4xl p-5 sm:p-8 flex flex-col gap-6 sm:gap-8 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron tracking-wide mb-1">
                Analytics
              </h2>
              <p className="text-xs sm:text-sm text-white/40 font-medium">Deep insights</p>
            </div>
            <Link href="/dashboard/admin/analytics">
              <Button
                variant="outline"
                className="bg-transparent border-white/10 text-white/80 hover:bg-white/5 hover:text-white rounded-lg px-6 w-full sm:w-auto"
              >
                Full Analytics
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Bar Chart: Revenue Overview */}
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold text-white tracking-wide">
                Revenue Overview
              </h3>
              <div className="h-56 w-full">
                {isAnalyticsLoading ? (
                  <div className="size-full rounded-2xl bg-white/5 animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      barSize={20}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        content={<CustomBarTooltip />}
                      />
                      <Bar dataKey="Revenue" radius={[4, 4, 0, 0]}>
                        {barChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === barChartData.length - 1 ? "#ffffff" : "rgba(255,255,255,0.15)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Area Chart: Membership Growth */}
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold text-white tracking-wide">
                Membership Growth
              </h3>
              <div className="h-56 w-full">
                {isAnalyticsLoading ? (
                  <div className="size-full rounded-2xl bg-white/5 animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={areaChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E31B23" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#E31B23" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 500 }}
                      />
                      <Tooltip content={<CustomAreaTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="Members" 
                        stroke="#E31B23" 
                        fillOpacity={1} 
                        fill="url(#colorMembers)" 
                        strokeWidth={2}
                        activeDot={{ r: 5, fill: "#111", stroke: "#E31B23", strokeWidth: 2 }}
                        dot={{ r: 3, fill: "#111", stroke: "#fff", strokeWidth: 1.5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="bg-[#111111] border border-white/15 rounded-3xl sm:rounded-4xl p-5 sm:p-8 flex flex-col gap-4 sm:gap-6 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron tracking-wide">
              Recent Activities
            </h2>
            <Link
              href="/dashboard/admin/payments"
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              View All &rarr;
            </Link>
          </div>

          {isPaymentsLoading ? (
            <TableSkeleton
              rowCount={5}
              headers={["NAME", "ROLE", "ACTION", "DATE", "STATUS"]}
              hasAvatar={false}
              actionButtonsCount={0}
            />
          ) : (
            <DashboardTable columns={columns} data={recentActivities} />
          )}
        </div>
      </div>
      
      {/* Right Sidebar: Pending Approvals */}
      <div className="w-full xl:w-[320px] shrink-0 mt-4 xl:mt-0">
        <DashboardSidebarPanel
          title="Pending Approvals"
          icon={<IconClock size={20} />}
          iconColor="text-[#E31B23]"
        >
          {isApprovalsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/2 border border-white/5 rounded-2xl animate-pulse flex items-center gap-4"
                >
                  <div className="size-12 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 w-28 bg-white/10 rounded" />
                    <div className="h-3 w-16 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingApprovalsList.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-xs">
              No pending approvals
            </div>
          ) : (
            pendingApprovalsList.map((app) => (
              <DashboardSidebarItem
                key={app._id}
                avatar={app.avatar || app.user?.avatar || "/placeholder_img.jpg"}
                title={app.name || "Unnamed"}
                subtitle={app.roleLabel || app.role}
                subtitleColor="text-[#E31B23]"
                extraInfo={getTimeAgo(app.date || app.user?.createdAt)}
                onClick={() => router.push("/dashboard/admin/approvals")}
              />
            ))
          )}
        </DashboardSidebarPanel>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
