"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import {
  IconChevronDown,
  IconRefresh,
  IconUserOff,
  IconAlertTriangle,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import {
  useGetAgentDiscoverPlayersQuery,
  useToggleLikeAgentCvsPlayerMutation,
  useShareAgentCvsPlayerMutation,
} from "@/redux/features/agent/agentApi";
import { IAgentDiscoverPlayer } from "@/types/agent.type";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const positionOptions = [
  { label: "All Positions", value: "ALL" },
  { label: "Forward", value: "FORWARD" },
  { label: "Midfielder", value: "MIDFIELDER" },
  { label: "Defender", value: "DEFENDER" },
  { label: "Goalkeeper", value: "GOALKEEPER" },
];

const ageRangeOptions = [
  { label: "Age Range", value: "ALL" },
  { label: "Under 18", value: "U18" },
  { label: "18 - 21", value: "18-21" },
  { label: "22 - 25", value: "22-25" },
  { label: "26+", value: "26+" },
];

const statusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Gold", value: "GOLD" },
  { label: "Silver", value: "SILVER" },
  { label: "Bronze", value: "BRONZE" },
];

const commonCountries = [
  "Bangladesh",
  "Brazil",
  "England",
  "Spain",
  "Argentina",
  "United Kingdom",
  "France",
  "Germany",
  "Portugal",
  "Italy",
];

const getStatusColor = (status?: string) => {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "GOLD":
      return "bg-[#ffc107] text-black";
    case "SILVER":
      return "bg-[#e0e0e0] text-black";
    case "BRONZE":
      return "bg-[#cd7f32] text-white";
    default:
      return "bg-white/10 text-white";
  }
};

const DiscoverPlayers = () => {
  const [position, setPosition] = useState("ALL");
  const [country, setCountry] = useState("ALL");
  const [ageRange, setAgeRange] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query: GET {{baseUrl}}/agents/discover-players
  const {
    data: discoverResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAgentDiscoverPlayersQuery({
    page,
    limit,
    position,
    country,
    status,
    ageRange,
  });

  const [toggleLike] = useToggleLikeAgentCvsPlayerMutation();
  const [sharePlayer] = useShareAgentCvsPlayerMutation();

  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const rawPlayers: IAgentDiscoverPlayer[] = useMemo(
    () => discoverResponse?.data?.players || [],
    [discoverResponse?.data?.players]
  );
  const meta = discoverResponse?.data?.meta;

  // Dynamic country list derived from API response + common list
  const countryOptions = useMemo(() => {
    const set = new Set(commonCountries);
    rawPlayers.forEach((p) => {
      if (p.country && p.country.trim()) set.add(p.country.trim());
    });
    return [
      { label: "Country", value: "ALL" },
      ...Array.from(set).map((c) => ({ label: c, value: c })),
    ];
  }, [rawPlayers]);

  // Client-side filtering fallback for smooth UX
  const filteredPlayers = useMemo(() => {
    return rawPlayers.filter((p) => {
      if (position !== "ALL") {
        const pos = (p.position || "").toUpperCase();
        if (!pos.includes(position.toUpperCase())) return false;
      }
      if (country !== "ALL") {
        if ((p.country || "").toLowerCase() !== country.toLowerCase())
          return false;
      }
      if (status !== "ALL") {
        const s = (p.status || p.statusBadge || p.tier || "").toUpperCase();
        if (s !== status.toUpperCase()) return false;
      }
      if (ageRange !== "ALL") {
        const age = p.age;
        if (age === null || age === undefined) return false;
        if (ageRange === "U18" && age >= 18) return false;
        if (ageRange === "18-21" && (age < 18 || age > 21)) return false;
        if (ageRange === "22-25" && (age < 22 || age > 25)) return false;
        if (ageRange === "26+" && age < 26) return false;
      }
      return true;
    });
  }, [rawPlayers, position, country, status, ageRange]);

  const handleToggleLike = async (row: IAgentDiscoverPlayer) => {
    const key = row.playerId || row.id;
    if (!key) return;

    const currentLiked =
      likedMap[key] !== undefined
        ? likedMap[key]
        : (row.isLiked || row.isFavourite || false);
    const nextLiked = !currentLiked;

    setLikedMap((prev) => ({ ...prev, [key]: nextLiked }));

    try {
      await toggleLike(key).unwrap();
    } catch {
      // Revert optimistic update
      setLikedMap((prev) => ({ ...prev, [key]: currentLiked }));
    }
  };

  const handleShare = async (row: IAgentDiscoverPlayer) => {
    const key = row.playerId || row.id;
    const url =
      row.shareableUrl ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/players/share/${key}`
        : "");

    if (navigator.share && url) {
      try {
        await navigator.share({
          title: `${row.name} - Player Profile`,
          url,
        });
        if (key) await sharePlayer(key).unwrap().catch(() => {});
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied to clipboard!");
        if (key) await sharePlayer(key).unwrap().catch(() => {});
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleView = (row: IAgentDiscoverPlayer) => {
    if (row.shareableUrl) {
      window.open(row.shareableUrl, "_blank");
    } else {
      toast.info(`Viewing profile for ${row.name}`);
    }
  };

  const columns: Column<IAgentDiscoverPlayer>[] = [
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
                (e.currentTarget as HTMLImageElement).src =
                  "/placeholder_img.jpg";
              }}
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{row.name}</p>
            <p className="text-[#E31B23] text-xs font-bold uppercase tracking-wider">
              {row.position || "FORWARD"}
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
        const ratingVal =
          typeof row.rating === "number"
            ? row.rating.toFixed(1)
            : row.rating
            ? Number(row.rating).toFixed(1)
            : "—";
        return (
          <span className="text-[#E31B23] font-bold text-sm">{ratingVal}</span>
        );
      },
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-white font-medium text-sm text-center",
      render: (row) => <span>{row.club || "Free Agent"}</span>,
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-gray-400 text-sm text-center",
      render: (row) => <span>{row.country || "—"}</span>,
    },
    {
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-gray-400 text-sm text-center",
      render: (row) => <span>{row.age ?? "—"}</span>,
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => {
        const statusLabel =
          row.status || row.statusBadge || row.tier || "Bronze";
        return (
          <span
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold inline-block text-center min-w-20",
              getStatusColor(statusLabel)
            )}
          >
            {statusLabel}
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
        const isLiked =
          likedMap[key] !== undefined
            ? likedMap[key]
            : (row.isLiked || row.isFavourite || false);

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
            shareColor="text-white/40 hover:text-white border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
          />
        );
      },
    },
  ];

  return (
    <div className="p-2 md:p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide mb-1">
          Discover Players
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Browse verified athlete profiles
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {/* Position Filter */}
          <div className="relative">
            <select
              value={position}
              onChange={(e) => {
                setPosition(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-white/30 text-xs font-bold cursor-pointer"
            >
              {positionOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#111111] text-white"
                >
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
              className="appearance-none bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-white/30 text-xs font-bold cursor-pointer"
            >
              {countryOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#111111] text-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Age Range Filter */}
          <div className="relative">
            <select
              value={ageRange}
              onChange={(e) => {
                setAgeRange(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-white/30 text-xs font-bold cursor-pointer"
            >
              {ageRangeOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#111111] text-white"
                >
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
              className="appearance-none bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-white/30 text-xs font-bold cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-[#111111] text-white"
                >
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
            <p className="text-sm font-bold text-destructive">
              Failed to load discover players
            </p>
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
        ) : filteredPlayers.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/1">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <IconUserOff size={28} />
            </div>
            <p className="text-base font-bold text-white uppercase tracking-wider font-orbitron">
              No Players Found
            </p>
            <p className="text-xs text-white/40 max-w-sm">
              No athlete profiles matched your filter criteria. Try adjusting
              your search filters.
            </p>
            {(position !== "ALL" ||
              country !== "ALL" ||
              ageRange !== "ALL" ||
              status !== "ALL") && (
              <Button
                type="button"
                onClick={() => {
                  setPosition("ALL");
                  setCountry("ALL");
                  setAgeRange("ALL");
                  setStatus("ALL");
                  setPage(1);
                }}
                variant="outline"
                className="mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <DashboardTable columns={columns} data={filteredPlayers} />
              </div>
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                <span>
                  Showing page {meta.page} of {meta.totalPages} ({meta.total}{" "}
                  players)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-lg text-xs disabled:opacity-30"
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 bg-white/10 text-white rounded-lg font-bold">
                    {page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages || isFetching}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-lg text-xs disabled:opacity-30"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPlayers;
