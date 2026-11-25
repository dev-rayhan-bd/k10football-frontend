/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import React, { useMemo } from "react";
import {
  IconFileText,
  IconCircleCheck,
  IconClock,
  IconCalendar,
  IconAlertCircle,
  IconRefresh,
  IconMoodEmpty,
} from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import { useGetCoachGameReportsQuery } from "@/redux/features/coach/coachApi";
import { ICoachGameReportItem } from "@/types/coach.type";
import { cn } from "@/lib/utils";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/da1uxchgo/image/upload/v1789553255/player_profiles/ejlqkaqmvctx4xodazzj.jpg";

// Skeleton Loader Component
const GameReportsSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-10 w-56 bg-white/10 rounded-xl" />
        <div className="h-4 w-72 bg-white/5 rounded-md" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div
            key={`stat-skeleton-${idx}`}
            className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]"
          >
            <div className="flex flex-col gap-4">
              <div className="size-10 rounded-xl bg-white/5 border border-white/10" />
              <div className="flex flex-col gap-2">
                <div className="h-8 w-16 bg-white/10 rounded-lg" />
                <div className="h-3 w-24 bg-white/5 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="p-8 rounded-3xl border border-white/20 bg-[#0D0D0D]">
        <div className="border border-white/20 rounded-2xl overflow-hidden">
          {/* Header row skeleton */}
          <div className="bg-white/5 border-b border-white/20 px-6 py-4 flex items-center justify-between">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-3 w-10 bg-white/10 rounded" />
            <div className="h-3 w-10 bg-white/10 rounded" />
            <div className="h-3 w-14 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-14 bg-white/10 rounded" />
            <div className="h-3 w-14 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
          </div>

          {/* Rows skeleton */}
          <div className="divide-y divide-white/20">
            {[...Array(5)].map((_, rowIdx) => (
              <div
                key={`row-skeleton-${rowIdx}`}
                className="px-6 py-5 flex items-center justify-between gap-4"
              >
                {/* Player Name & Avatar */}
                <div className="flex items-center gap-3 min-w-[160px]">
                  <div className="size-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-28 bg-white/10 rounded" />
                    <div className="h-2.5 w-16 bg-white/5 rounded" />
                  </div>
                </div>

                {/* Rating */}
                <div className="h-4 w-8 bg-white/10 rounded" />

                {/* Matches */}
                <div className="h-4 w-32 bg-white/5 rounded" />

                {/* Goals */}
                <div className="h-4 w-6 bg-white/5 rounded" />

                {/* Assists */}
                <div className="h-4 w-6 bg-white/5 rounded" />

                {/* Date */}
                <div className="h-4 w-16 bg-white/5 rounded" />

                {/* Amount */}
                <div className="h-4 w-12 bg-white/10 rounded" />

                {/* Payment */}
                <div className="h-6 w-16 rounded-full bg-white/10" />

                {/* Status */}
                <div className="h-6 w-20 rounded-full bg-white/10" />

                {/* Actions */}
                <div className="size-9 rounded-xl bg-white/5 border border-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GameReports = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerId = searchParams.get("playerId");

  const {
    data: reportsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetCoachGameReportsQuery();

  const reportsData = reportsResponse?.data;
  const summary = reportsData?.summary;
  const allReports = useMemo(() => reportsData?.reports || [], [reportsData]);

  // Filter reports by playerId if param is present
  const filteredReports = useMemo(() => {
    if (!playerId) return allReports;
    return allReports.filter(
      (r) =>
        r.player?._id === playerId ||
        (r.player as any)?.id === playerId ||
        (r as any)?.playerId === playerId
    );
  }, [allReports, playerId]);

  // Find player name for active filter banner
  const filteredPlayerName = useMemo(() => {
    if (!playerId) return null;
    const matched = allReports.find(
      (r) =>
        r.player?._id === playerId ||
        (r.player as any)?.id === playerId ||
        (r as any)?.playerId === playerId
    );
    return matched?.player?.name || "Player";
  }, [allReports, playerId]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    if (playerId) {
      const totalCount = filteredReports.length;
      const completedCount = filteredReports.filter(
        (r) => r.status?.toUpperCase() === "COMPLETED"
      ).length;
      const pendingCount = filteredReports.filter(
        (r) => r.status?.toUpperCase() === "PENDING"
      ).length;

      return [
        { label: "Total Reports", value: totalCount.toString(), icon: IconFileText },
        { label: "Completed", value: completedCount.toString(), icon: IconCircleCheck },
        { label: "Pending", value: pendingCount.toString(), icon: IconClock },
        { label: "This Month", value: totalCount.toString(), icon: IconCalendar },
      ];
    }

    return [
      {
        label: "Total Reports",
        value: (summary?.totalReports ?? allReports.length).toString(),
        icon: IconFileText,
      },
      {
        label: "Completed",
        value: (summary?.completed ?? 0).toString(),
        icon: IconCircleCheck,
      },
      {
        label: "Pending",
        value: (summary?.pending ?? 0).toString(),
        icon: IconClock,
      },
      {
        label: "This Month",
        value: (
          summary?.thisMonth ??
          summary?.totalReports ??
          allReports.length
        ).toString(),
        icon: IconCalendar,
      },
    ];
  }, [playerId, filteredReports, summary, allReports.length]);

  const handleNavigateToReport = (row: ICoachGameReportItem) => {
    const pId = row.player?._id || "";
    const isPending = row.status?.toUpperCase() === "PENDING";
    if (isPending) {
      router.push(
        `/dashboard/coach/game-reports/create?playerId=${pId}&requestId=${row._id}`
      );
    } else {
      router.push(
        `/dashboard/coach/game-reports/create?playerId=${pId}&reportId=${row._id}&viewOnly=true`
      );
    }
  };

  const columns: Column<ICoachGameReportItem>[] = useMemo(
    () => [
      {
        header: "Name",
        key: "name",
        render: (row) => {
          const avatar = row.player?.avatar || DEFAULT_AVATAR;
          return (
            <div className="flex items-center gap-3">
              <Image
                src={avatar}
                className="size-10 rounded-full object-cover border border-white/10"
                alt={row.player?.name || "Player"}
                width={40}
                height={40}
              />
              <div>
                <div className="text-sm font-bold text-white">
                  {row.player?.name || "Unknown Player"}
                </div>
                <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                  {row.player?.position || "PLAYER"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Rating",
        key: "rating",
        align: "center",
        render: (row) => {
          const isPending =
            row.status?.toUpperCase() === "PENDING" ||
            String(row.rating).toUpperCase() === "PENDING";

          if (isPending) {
            return (
              <span className="text-xs font-bold text-orange-500/80 font-orbitron uppercase tracking-widest">
                Pending
              </span>
            );
          }

          return (
            <span className="text-sm font-black text-red-600 italic font-orbitron">
              {row.rating}
            </span>
          );
        },
      },
      {
        header: "Matches",
        key: "matches",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (row) => row.matches || "—",
      },
      {
        header: "Goals",
        key: "goals",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (row) => {
          if (row.status?.toUpperCase() === "PENDING") {
            return <span className="text-gray-600">—</span>;
          }
          return row.goals ?? 0;
        },
      },
      {
        header: "Assists",
        key: "assists",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (row) => {
          if (row.status?.toUpperCase() === "PENDING") {
            return <span className="text-gray-600">—</span>;
          }
          return row.assists ?? 0;
        },
      },
      {
        header: "Date",
        key: "date",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (row) => row.date || "—",
      },
      {
        header: "Amount",
        key: "amount",
        align: "center",
        cellClassName: "text-sm text-gray-300 font-bold font-orbitron",
        render: (row) => row.amount || "—",
      },
      {
        header: "Payment",
        key: "paymentStatus",
        align: "center",
        render: (row) => {
          // Prefer the backend's paymentStatus; fall back to the isPaid flag.
          const raw = row.paymentStatus
            ? String(row.paymentStatus)
            : typeof row.isPaid === "boolean"
            ? row.isPaid ? "PAID" : "UNPAID"
            : "";
          if (!raw) return <span className="text-gray-600">—</span>;

          const status = raw.toUpperCase();
          const isPaid = ["PAID", "SUCCEEDED", "SUCCESS", "COMPLETED"].includes(status);
          const isFailed = ["FAILED", "CANCELLED", "CANCELED", "REFUNDED", "EXPIRED"].includes(status);
          return (
            <span
              className={cn(
                "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                isPaid
                  ? "bg-green-500/10 text-green-500"
                  : isFailed
                  ? "bg-red-500/10 text-red-500"
                  : "bg-orange-500/10 text-orange-500"
              )}
            >
              {status.replace(/_/g, " ")}
            </span>
          );
        },
      },
      {
        header: "Status",
        key: "status",
        align: "center",
        render: (row) => {
          const isPending = row.status?.toUpperCase() === "PENDING";
          return (
            <span
              className={cn(
                "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                isPending
                  ? "bg-orange-500/10 text-orange-500"
                  : "bg-green-500/10 text-green-500"
              )}
            >
              {isPending ? "Pending" : "Completed"}
            </span>
          );
        },
      },
      {
        header: "Actions",
        key: "actions",
        align: "right",
        render: (row) => (
          <TableActionButtons
            onView={() => handleNavigateToReport(row)}
            viewColor="text-[#E31B23] hover:text-white border-[#E31B23]/20 hover:border-[#E31B23] bg-[#E31B23]/5 hover:bg-[#E31B23]"
          />
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return <GameReportsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#0D0D0D] rounded-3xl border border-white/20 text-center max-w-xl mx-auto my-12">
        <div className="size-14 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] mb-4">
          <IconAlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-white uppercase italic tracking-tight mb-2">
          Failed to Load Game Reports
        </h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          We encountered an error while fetching your game reports. Please check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#c0161d] text-white text-xs font-bold uppercase tracking-wider transition-all"
        >
          <IconRefresh size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase font-orbitron">
            Game Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Professional performance analysis
          </p>
        </div>

        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
            <IconRefresh size={14} className="animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* Active Filter Banner */}
      {playerId && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm flex items-center justify-between shadow-lg">
          <span>
            Showing reports for player: <strong>{filteredPlayerName}</strong>
          </span>
          <button
            onClick={() => router.push("/dashboard/coach/game-reports")}
            className="text-xs uppercase font-black tracking-widest text-white hover:text-gray-200 underline font-orbitron"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]"
          >
            <div className="flex flex-col gap-4">
              <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <stat.icon size={20} />
              </div>
              <div>
                <div className="text-3xl font-black text-white italic mb-1 font-orbitron">
                  {stat.value}
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest font-orbitron">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="p-8 rounded-3xl border border-white/20 bg-[#0D0D0D]">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl">
            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 mb-3">
              <IconMoodEmpty size={24} />
            </div>
            <p className="text-sm font-semibold text-white">
              No game reports found
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              There are currently no game reports available.
            </p>
          </div>
        ) : (
          <DashboardTable
            columns={columns}
            data={filteredReports}
            className="border-white/10"
            onRowClick={handleNavigateToReport}
          />
        )}
      </div>
    </div>
  );
};

export default GameReports;

