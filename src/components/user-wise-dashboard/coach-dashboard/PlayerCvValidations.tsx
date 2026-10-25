"use client";

import Image from "next/image";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IconClock,
  IconCircleCheck,
  IconCalendar,
  IconPlus,
  IconRefresh,
  IconMoodEmpty,
  IconAlertCircle,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import { useGetCoachPlayerCvValidationsQuery } from "@/redux/features/coach/coachApi";
import { ICoachPlayerCvValidationPlayer } from "@/types/coach.type";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AddPlayerModal from "./AddPlayerModal";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/da1uxchgo/image/upload/v1789553255/player_profiles/ejlqkaqmvctx4xodazzj.jpg";

// Skeleton Loader Component
const PlayerCvValidationsSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12 animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-9 w-64 bg-white/10 rounded-xl" />
          <div className="h-4 w-80 bg-white/5 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-white/10 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {[...Array(4)].map((_, idx) => (
          <div
            key={`stat-skel-${idx}`}
            className="p-4 sm:p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]"
          >
            <div className="flex flex-col gap-4">
              <div className="size-10 rounded-xl bg-white/5 border border-white/10" />
              <div className="flex flex-col gap-2">
                <div className="h-8 w-16 bg-white/10 rounded-lg" />
                <div className="h-3 w-28 bg-white/5 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card Skeleton */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl border border-white/20 bg-[#0D0D0D]">
        <div className="border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-white/5 border-b border-white/20 px-6 py-4 flex items-center justify-between">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-12 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          <div className="divide-y divide-white/20">
            {[...Array(4)].map((_, rowIdx) => (
              <div
                key={`row-skel-${rowIdx}`}
                className="px-6 py-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-40">
                  <div className="size-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-28 bg-white/10 rounded" />
                    <div className="h-2.5 w-16 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-4 w-8 bg-white/10 rounded" />
                <div className="h-4 w-24 bg-white/5 rounded" />
                <div className="h-4 w-8 bg-white/5 rounded" />
                <div className="h-4 w-8 bg-white/5 rounded" />
                <div className="h-4 w-20 bg-white/5 rounded" />
                <div className="h-6 w-20 rounded-full bg-white/10" />
                <div className="size-9 rounded-xl bg-white/5 border border-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerCVValidations = () => {
  const router = useRouter();
  const {
    data: validationsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetCoachPlayerCvValidationsQuery();

  const validationsData = validationsResponse?.data;
  const summary = validationsData?.summary;
  const players = useMemo(
    () => validationsData?.players || [],
    [validationsData]
  );

  const stats = useMemo(
    () => [
      {
        label: "Pending Validations",
        value: String(summary?.pendingValidations ?? 0),
        icon: IconClock,
      },
      {
        label: "Verified CVs",
        value: String(summary?.verifiedCvs ?? 0),
        icon: IconCircleCheck,
      },
      {
        label: "Updated This Month",
        value: String(summary?.updatedThisMonth ?? 0),
        icon: IconCalendar,
      },
      {
        label: "Expired Status",
        value: String(summary?.expiredStatus ?? 0),
        icon: IconClock,
      },
    ],
    [summary]
  );

  const columns: Column<ICoachPlayerCvValidationPlayer>[] = useMemo(
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
              alt={player.name}
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
        header: "Club/Current",
        key: "club",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.club || "N/A",
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
        header: "Last Validated",
        key: "lastValidated",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.lastValidated || "Never",
      },
      {
        header: "Status",
        key: "status",
        align: "center",
        render: (player) => {
          const normStatus = (player.status || "").toUpperCase();
          const isVerified = normStatus === "VERIFIED";
          const isPending = normStatus === "PENDING";
          return (
            <span
              className={cn(
                "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                isVerified &&
                  "bg-green-500/10 text-green-500 border-green-500/20",
                isPending &&
                  "bg-orange-500/10 text-orange-500 border-orange-500/20",
                !isVerified &&
                  !isPending &&
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              )}
            >
              {player.status || "PENDING"}
            </span>
          );
        },
      },
      {
        header: "Actions",
        key: "actions",
        align: "right",
        render: (player) => {
          const isVerified = (player.status || "").toUpperCase() === "VERIFIED";
          return (
            <TableActionButtons
              onView={() => {
                router.push(
                  `/dashboard/coach/player-cv-validations/${player._id || player.id}`
                );
              }}
              onVerify={
                !isVerified
                  ? () => {
                      toast.success(`Validation request initiated for ${player.name}`);
                    }
                  : undefined
              }
            />
          );
        },
      },
    ],
    [router]
  );

  // Loading skeleton state
  if (isLoading) {
    return <PlayerCvValidationsSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-red-500/20 rounded-3xl bg-[#0D0D0D] my-8">
        <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
          <IconAlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-white uppercase italic tracking-tight mb-2">
          Failed to Load Player CV Validations
        </h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          We encountered an error while fetching player CV validations. Please check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#c0161d] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <IconRefresh size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
              Player CV Validations
            </h1>
            {isFetching && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 animate-pulse">
                <IconRefresh size={13} className="animate-spin text-[#E31B23]" />
                Updating...
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Review and validate player profiles and credentials
          </p>
        </div>
        <AddPlayerModal>
          <button className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer">
            <IconPlus size={16} /> Add Player
          </button>
        </AddPlayerModal>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-6 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col justify-between"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="size-8 sm:size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <stat.icon className="size-4 sm:size-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white italic mb-1">
                  {stat.value}
                </div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest leading-tight line-clamp-2">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl border border-white/20 bg-[#0D0D0D] w-full max-w-full overflow-hidden">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl">
            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 mb-3">
              <IconMoodEmpty size={24} />
            </div>
            <p className="text-sm font-semibold text-white">No validations found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              There are currently no player CV validation requests.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="lg:hidden flex flex-col gap-4">
              {players.map((player) => {
                const normStatus = (player.status || "").toUpperCase();
                const isVerified = normStatus === "VERIFIED";
                const isPending = normStatus === "PENDING";
                return (
                  <div
                    key={player._id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          width={40}
                          height={40}
                          src={player.avatar || DEFAULT_AVATAR}
                          className="size-10 rounded-full object-cover border border-white/10"
                          alt={player.name}
                        />
                        <div>
                          <div className="text-sm font-bold text-white">
                            {player.name}
                          </div>
                          <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                            {player.position || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-black text-red-600 italic">
                        {player.rating !== undefined ? player.rating : "-"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-black block">
                          Club/Current
                        </span>
                        <span className="text-xs text-white">
                          {player.club || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-black block">
                          Status
                        </span>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block mt-1 border",
                            isVerified &&
                              "bg-green-500/10 text-green-500 border-green-500/20",
                            isPending &&
                              "bg-orange-500/10 text-orange-500 border-orange-500/20",
                            !isVerified &&
                              !isPending &&
                              "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          )}
                        >
                          {player.status || "PENDING"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-black block">
                          Goals / Assists
                        </span>
                        <span className="text-xs text-white">
                          {player.goals ?? 0} / {player.assists ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-black block">
                          Last Validated
                        </span>
                        <span className="text-xs text-white">
                          {player.lastValidated || "Never"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-white/10 mt-1">
                      <TableActionButtons
                        onView={() => {
                          router.push(
                            `/dashboard/coach/player-cv-validations/${player._id || player.id}`
                          );
                        }}
                        onVerify={
                          !isVerified
                            ? () => {
                                toast.success(
                                  `Validation request initiated for ${player.name}`
                                );
                              }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden lg:block overflow-x-auto">
              <DashboardTable
                columns={columns}
                data={players}
                className="border-white/10 min-w-150"
                onRowClick={(player) =>
                  router.push(
                    `/dashboard/coach/player-cv-validations/${player._id || player.id}`
                  )
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerCVValidations;
