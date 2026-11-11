"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconUsers,
  IconChartBar,
  IconUserCheck,
  IconUserExclamation,
  IconAlertCircle,
  IconRefresh,
  IconMoodEmpty,
  IconChevronDown,
  IconLoader2,
  IconCheck,
  IconLock,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import {
  useGetMyTeamsQuery,
  useUpdatePlayerFitnessStatusMutation,
} from "@/redux/features/coach/coachApi";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { toast } from "sonner";
import { ICoachTeamPlayer } from "@/types/coach.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Skeleton Loader Component
const MyTeamsSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-10 w-48 bg-white/10 rounded-xl" />
        <div className="h-4 w-80 bg-white/5 rounded-md" />
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

      {/* Players Table Skeleton */}
      <div className="p-8 rounded-3xl border border-white/20 bg-[#0D0D0D]">
        <div className="h-6 w-32 bg-white/10 rounded-md mb-8" />
        <div className="border border-white/20 rounded-2xl overflow-hidden">
          {/* Table Header Skeleton */}
          <div className="bg-white/5 border-b border-white/20 px-6 py-4 flex items-center justify-between">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-14 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-14 bg-white/10 rounded" />
            <div className="h-3 w-14 bg-white/10 rounded" />
          </div>

          {/* Table Rows Skeleton */}
          <div className="divide-y divide-white/20">
            {[...Array(4)].map((_, rowIdx) => (
              <div
                key={`table-row-skeleton-${rowIdx}`}
                className="px-6 py-5 flex items-center justify-between gap-4"
              >
                {/* Name & Avatar */}
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
                <div className="h-4 w-8 bg-white/5 rounded" />

                {/* Goals */}
                <div className="h-4 w-8 bg-white/5 rounded" />

                {/* Assists */}
                <div className="h-4 w-8 bg-white/5 rounded" />

                {/* Status */}
                <div className="h-6 w-16 rounded-full bg-white/10" />

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

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/da1uxchgo/image/upload/v1789553255/player_profiles/ejlqkaqmvctx4xodazzj.jpg";

const MyTeams = () => {
  const router = useRouter();
  const { data: teamResponse, isLoading, isError, refetch, isFetching } =
    useGetMyTeamsQuery();
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const [updatePlayerFitnessStatus] = useUpdatePlayerFitnessStatusMutation();
  const [updatingPlayerId, setUpdatingPlayerId] = useState<string | null>(null);

  const teamData = teamResponse?.data;
  const summary = teamData?.summary;
  const academy = teamData?.academy;
  const players = useMemo(() => teamData?.players || [], [teamData]);

  const handleUpdateStatus = async (
    player: ICoachTeamPlayer,
    newStatus: "ACTIVE" | "INJURED"
  ) => {
    const playerId = player._id || player.id;
    if (!playerId) return;
    if (player.status?.toUpperCase() === newStatus) return;

    if (!hasActiveSubscription) {
      toast.error(
        "Active coach subscription required to update squad fitness/injury status."
      );
      router.push("/dashboard/coach/my-subscription");
      return;
    }

    try {
      setUpdatingPlayerId(playerId);
      await updatePlayerFitnessStatus({ playerId, status: newStatus }).unwrap();
    } catch {
      // Handled by onQueryStarted in coachApi
    } finally {
      setUpdatingPlayerId(null);
    }
  };

  const stats = useMemo(
    () => [
      {
        label: "Total Players",
        value: summary?.totalPlayers ?? players.length,
        icon: IconUsers,
      },
      {
        label: "Avg Rating",
        value:
          summary?.avgRating !== undefined
            ? Number(summary.avgRating).toFixed(1)
            : "0.0",
        icon: IconChartBar,
      },
      {
        label: "Active",
        value: summary?.active ?? 0,
        icon: IconUserCheck,
      },
      {
        label: "Injured",
        value: summary?.injured ?? 0,
        icon: IconUserExclamation,
      },
    ],
    [summary, players.length]
  );

  const columns: Column<ICoachTeamPlayer>[] = useMemo(
    () => [
      {
        header: "Name",
        key: "name",
        render: (player) => (
          <div className="flex items-center gap-3">
            <Image
              width={40}
              height={40}
              src={player.avatar || DEFAULT_AVATAR}
              className="size-10 rounded-full object-cover border border-white/10"
              alt={player.name || "Player"}
            />
            <div>
              <div className="text-sm font-bold text-white">{player.name}</div>
              <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                {player.position || "N/A"}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Rating",
        key: "rating",
        align: "center",
        render: (player) => (
          <span className="text-sm font-black text-red-600 italic">
            {player.rating !== undefined ? player.rating : "-"}
          </span>
        ),
      },
      {
        header: "Matches",
        key: "matches",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.matches ?? 0,
      },
      {
        header: "Goals",
        key: "goals",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.goals ?? 0,
      },
      {
        header: "Assists",
        key: "assists",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.assists ?? 0,
      },
      {
        header: "Status",
        key: "status",
        align: "center",
        render: (player) => {
          const playerId = player._id || player.id || "";
          const isActive = player.status?.toUpperCase() === "ACTIVE";
          const isUpdatingThis = updatingPlayerId === playerId;

          if (!hasActiveSubscription) {
            return (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toast.error(
                    "Active coach subscription required to update squad fitness/injury status."
                  );
                  router.push("/dashboard/coach/my-subscription");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 bg-white/5 text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-white transition-all select-none"
                title="Subscription required to update squad fitness"
              >
                <IconLock size={12} className="text-primary" />
                <span>{player.status || "ACTIVE"}</span>
              </div>
            );
          }

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isUpdatingThis}>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border select-none focus:outline-none",
                      isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
                      isUpdatingThis && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isUpdatingThis ? (
                      <IconLoader2 size={12} className="animate-spin" />
                    ) : (
                      <span
                        className={cn(
                          "size-1.5 rounded-full shrink-0",
                          isActive ? "bg-green-500" : "bg-red-500"
                        )}
                      />
                    )}
                    <span>{player.status || "ACTIVE"}</span>
                    <IconChevronDown size={11} className="opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="bg-[#141414] border border-white/15 text-white p-1 rounded-xl shadow-2xl min-w-32"
                >
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(player, "ACTIVE")}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors",
                      isActive ? "text-green-400 bg-green-500/10" : "text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500" />
                      <span>Active</span>
                    </div>
                    {isActive && <IconCheck size={14} className="text-green-400" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleUpdateStatus(player, "INJURED")}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors",
                      !isActive ? "text-red-400 bg-red-500/10" : "text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-red-500" />
                      <span>Injured</span>
                    </div>
                    {!isActive && <IconCheck size={14} className="text-red-400" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
      {
        header: "Actions",
        key: "actions",
        align: "right",
        render: (player) => (
          <TableActionButtons
            onView={() =>
              router.push(
                `/dashboard/coach/game-reports?playerId=${player.id || player._id}`
              )
            }
            viewColor="text-[#E31B23] hover:text-white border-[#E31B23]/20 hover:border-[#E31B23] bg-[#E31B23]/5 hover:bg-[#E31B23]"
          />
        ),
      },
    ],
    [router, updatingPlayerId]
  );

  if (isLoading) {
    return <MyTeamsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#0D0D0D] rounded-3xl border border-white/20 text-center max-w-xl mx-auto my-12">
        <div className="size-14 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] mb-4">
          <IconAlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-white uppercase italic tracking-tight mb-2">
          Failed to Load Squad
        </h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          We encountered an error while fetching your team squad. Please check your connection and try again.
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
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              My Teams
            </h1>
            {academy?.name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/80">
                {academy.logo && (
                  <Image
                    src={academy.logo}
                    alt={academy.name}
                    width={16}
                    height={16}
                    className="size-4 rounded-full object-cover"
                  />
                )}
                {academy.name}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Manage your squad, track performance, and optimize your lineup
          </p>
        </div>

        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
            <IconRefresh size={14} className="animate-spin" />
            Updating...
          </div>
        )}
      </div>

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
                <div className="text-3xl font-black text-white italic mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Players Section */}
      <div className="p-8 rounded-3xl border border-white/20 bg-[#0D0D0D]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white italic uppercase tracking-tight">
            Players
          </h2>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {players.length} {players.length === 1 ? "Player" : "Players"}
          </span>
        </div>

        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl">
            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 mb-3">
              <IconMoodEmpty size={24} />
            </div>
            <p className="text-sm font-semibold text-white">No players found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              There are currently no players assigned to your squad.
            </p>
          </div>
        ) : (
          <DashboardTable
            columns={columns}
            data={players}
            className="border-white/10"
            onRowClick={(player) =>
              router.push(
                `/dashboard/coach/game-reports?playerId=${player.id || player._id}`
              )
            }
          />
        )}
      </div>
    </div>
  );
};

export default MyTeams;

