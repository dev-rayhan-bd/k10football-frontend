"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  IconChevronDown,
  IconRefresh,
  IconShareOff,
  IconAlertTriangle,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import {
  useGetAgentCvsLibraryQuery,
  useToggleLikeAgentCvsPlayerMutation,
  useShareAgentCvsPlayerMutation,
} from "@/redux/features/agent/agentApi";
import { IAgentCvsLibraryPlayer } from "@/types/agent.type";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const positionOptions = [
  { label: "All Positions", value: "ALL" },
  { label: "Forward", value: "FORWARD" },
  { label: "Midfielder", value: "MIDFIELDER" },
  { label: "Defender", value: "DEFENDER" },
  { label: "Goalkeeper", value: "GOALKEEPER" },
];

const countryOptions = [
  { label: "Country", value: "ALL" },
  { label: "Brazil", value: "Brazil" },
  { label: "England", value: "England" },
  { label: "Spain", value: "Spain" },
  { label: "Argentina", value: "Argentina" },
  { label: "Bangladesh", value: "Bangladesh" },
];

const statusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Gold", value: "GOLD" },
  { label: "Silver", value: "SILVER" },
  { label: "Bronze", value: "BRONZE" },
];

const getStatusBadge = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "viewed") {
    return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
  }
  return "border-white/20 bg-white/5 text-gray-300";
};

const SharedProfiles = () => {
  const [position, setPosition] = useState("ALL");
  const [country, setCountry] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query: GET {{baseUrl}}/agents/cvs-library?shared=true
  const {
    data: cvsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAgentCvsLibraryQuery({
    shared: true,
    page,
    limit,
    position,
    country,
    status,
  });

  const [toggleLike] = useToggleLikeAgentCvsPlayerMutation();
  const [sharePlayer] = useShareAgentCvsPlayerMutation();

  const [favMap, setFavMap] = useState<Record<string, boolean>>({});

  const players = cvsResponse?.data?.data || [];
  const meta = cvsResponse?.data?.meta;

  const handleToggleLike = async (row: IAgentCvsLibraryPlayer) => {
    const key = row.playerId || row.id;
    const current = favMap[key] !== undefined ? favMap[key] : Boolean(row.isLiked);
    const next = !current;

    setFavMap((prev) => ({ ...prev, [key]: next }));

    try {
      await toggleLike(key).unwrap();
    } catch {
      setFavMap((prev) => ({ ...prev, [key]: current })); // rollback
    }
  };

  const handleShare = async (row: IAgentCvsLibraryPlayer) => {
    const key = row.playerId || row.id;
    const toCopy =
      row.shareableUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/dashboard/agent/discover-players/${key}`
        : "");

    if (toCopy) {
      try {
        await navigator.clipboard.writeText(toCopy);
        toast.success("Profile share link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }

    try {
      await sharePlayer(key).unwrap();
    } catch {
      // Handled silently
    }
  };

  const handleView = (row: IAgentCvsLibraryPlayer) => {
    if (row.shareableUrl) {
      window.open(row.shareableUrl, "_blank");
    } else {
      toast.info(`Viewing profile for ${row.name}`);
    }
  };

  const columns: Column<IAgentCvsLibraryPlayer>[] = [
    {
      header: "Name",
      key: "name",
      align: "left",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
            <Image
              src={row.avatar || "/placeholder_img.jpg"}
              alt={row.name}
              fill
              sizes="40px"
              unoptimized
              className="object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder_img.jpg";
              }}
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{row.name}</p>
            <p className="text-[#E31B23] text-xs font-bold uppercase tracking-wider">
              {row.position}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      key: "rating",
      align: "center",
      render: (row) => {
        const r = typeof row.rating === "number" ? row.rating.toFixed(1) : row.rating || "-";
        return <span className="text-[#E31B23] font-bold">{r}</span>;
      },
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-white font-medium text-sm",
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-gray-400 text-sm",
    },
    {
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-gray-400 text-sm",
    },
    {
      header: "Shared With",
      key: "sharedWith",
      align: "center",
      render: (row) => (
        <span className="text-gray-400 text-sm font-medium">
          {row.sharedWith || "Other Members"}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => {
        const statusText = row.sharedStatus || (row.shareCount && row.shareCount > 0 ? "Viewed" : "Not Viewed");
        return (
          <span
            className={`px-4 py-1.5 rounded-full border text-xs font-bold inline-block capitalize ${getStatusBadge(
              statusText
            )}`}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      render: (row) => {
        const key = row.playerId || row.id;
        const isLiked = favMap[key] !== undefined ? favMap[key] : Boolean(row.isLiked);
        return (
          <TableActionButtons
            onView={() => handleView(row)}
            onHeart={() => handleToggleLike(row)}
            isHeartFilled={isLiked}
            heartColor={
              isLiked
                ? "text-[#E31B23] border-[#E31B23]/30 bg-[#E31B23]/10 hover:bg-[#E31B23]/20"
                : "text-white/40 hover:text-[#E31B23] border-white/10 hover:border-[#E31B23]/30 bg-white/5 hover:bg-[#E31B23]/10"
            }
            onShare={() => handleShare(row)}
            shareColor="text-[#E31B23] border-[#E31B23]/30 bg-[#E31B23]/10 hover:bg-[#E31B23]/20"
          />
        );
      },
    },
  ];

  return (
    <div className="p-2 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide mb-1">
          Shared Profiles
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Players you&apos;ve shared with other members
        </p>
      </div>

      {/* Main Container */}
      <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-end mb-2">
          {/* Position Filter */}
          <div className="relative">
            <select
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors h-10 text-sm font-medium cursor-pointer"
            >
              {positionOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Country Filter */}
          <div className="relative">
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors h-10 text-sm font-medium cursor-pointer"
            >
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors h-10 text-sm font-medium cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Content States */}
        {isLoading ? (
          <TableSkeleton rowCount={5} columnCount={7} />
        ) : isError ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
            <IconAlertTriangle className="size-8 text-destructive" />
            <p className="text-sm font-bold text-destructive">Failed to load shared profiles</p>
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
        ) : players.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/1">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <IconShareOff size={28} />
            </div>
            <p className="text-base font-bold text-white uppercase tracking-wider font-orbitron">
              No Shared Profiles Found
            </p>
            <p className="text-xs text-white/40 max-w-sm">
              You haven&apos;t shared any player profiles with members yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <DashboardTable columns={columns} data={players} />
              </div>
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                <span>
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} players)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer transition-all"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= meta.totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedProfiles;
