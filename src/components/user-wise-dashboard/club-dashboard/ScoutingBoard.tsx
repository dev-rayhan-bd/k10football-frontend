"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IconChevronDown,
  IconRefresh,
  IconLoader2,
  IconUserOff,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import {
  useGetScoutingBoardQuery,
  useToggleScoutingBoardFavouriteMutation,
} from "@/redux/features/club/clubApi";
import {
  IScoutingBoardPlayer,
  IScoutingBoardCoach,
} from "@/types/club.type";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const commonCountries = [
  "Bangladesh",
  "Brazil",
  "England",
  "Spain",
  "Argentina",
  "France",
  "Germany",
  "Portugal",
  "Netherlands",
  "Italy",
];

const playerPositionOptions = [
  { label: "All Positions", value: "ALL" },
  { label: "Forward", value: "FORWARD" },
  { label: "Midfielder", value: "MIDFIELDER" },
  { label: "Defender", value: "DEFENDER" },
  { label: "Goalkeeper", value: "GOALKEEPER" },
];

const playerAgeOptions = [
  { label: "Age Range", value: "ALL" },
  { label: "Under 18", value: "U18" },
  { label: "18 - 21", value: "18-21" },
  { label: "22 - 25", value: "22-25" },
  { label: "25+", value: "25+" },
];

const playerStatusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Gold", value: "GOLD" },
  { label: "Silver", value: "SILVER" },
  { label: "Bronze", value: "BRONZE" },
];

const coachRoleOptions = [
  { label: "All Roles", value: "ALL" },
  { label: "Head Coach", value: "HEAD COACH" },
  { label: "Assistant Coach", value: "ASSISTANT COACH" },
  { label: "Fitness Coach", value: "FITNESS COACH" },
  { label: "Goalkeeping Coach", value: "GOALKEEPING COACH" },
];

const coachSpecialityOptions = [
  { label: "Speciality", value: "ALL" },
  { label: "Tactical Coaching", value: "Tactical Coaching" },
  { label: "Attacking", value: "Attacking" },
  { label: "Defending", value: "Defending" },
  { label: "Physical", value: "Physical" },
  { label: "GK Training", value: "GK Training" },
  { label: "3-5-2 (Wingbacks control)", value: "3-5-2 (Wingbacks control)" },
];

const coachStatusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Contracted", value: "CONTRACTED" },
];

const ScoutingBoard = () => {
  const router = useRouter();

  // Player Filter States
  const [playerPosition, setPlayerPosition] = useState("ALL");
  const [playerCountry, setPlayerCountry] = useState("ALL");
  const [playerAgeRange, setPlayerAgeRange] = useState("ALL");
  const [playerStatus, setPlayerStatus] = useState("ALL");
  const [playerPage, setPlayerPage] = useState(1);

  // Coach Filter States
  const [coachRole, setCoachRole] = useState("ALL");
  const [coachCountry, setCoachCountry] = useState("ALL");
  const [coachSpeciality, setCoachSpeciality] = useState("ALL");
  const [coachStatus, setCoachStatus] = useState("ALL");
  const [coachPage, setCoachPage] = useState(1);

  // Local favourite overrides for instant UI updates
  const [favPlayerMap, setFavPlayerMap] = useState<Record<string, boolean>>({});
  const [favCoachMap, setFavCoachMap] = useState<Record<string, boolean>>({});

  // Query Scouting Board API
  const { data, isLoading, isFetching, isError, refetch } = useGetScoutingBoardQuery({
    position: playerPosition !== "ALL" ? playerPosition : undefined,
    country: playerCountry !== "ALL" ? playerCountry : undefined,
    status: playerStatus !== "ALL" ? playerStatus : undefined,
    role: coachRole !== "ALL" ? coachRole : undefined,
    speciality: coachSpeciality !== "ALL" ? coachSpeciality : undefined,
    coachStatus: coachStatus !== "ALL" ? coachStatus : undefined,
    playerPage,
    playerLimit: 10,
    coachPage,
    coachLimit: 10,
  });

  // Toggle Favourite Mutation
  const [toggleScoutingBoardFavourite] = useToggleScoutingBoardFavouriteMutation();

  const rawPlayers = useMemo(() => data?.data?.players || [], [data]);
  const coaches = useMemo(() => data?.data?.coaches || [], [data]);
  const meta = data?.data?.meta;

  // Filter players by age client-side if selected
  const filteredPlayers = useMemo(() => {
    if (playerAgeRange === "ALL") return rawPlayers;
    return rawPlayers.filter((p) => {
      if (p.age === null || p.age === undefined) return false;
      if (playerAgeRange === "U18") return p.age < 18;
      if (playerAgeRange === "18-21") return p.age >= 18 && p.age <= 21;
      if (playerAgeRange === "22-25") return p.age >= 22 && p.age <= 25;
      if (playerAgeRange === "25+") return p.age > 25;
      return true;
    });
  }, [rawPlayers, playerAgeRange]);

  // Combined country lists from API data + defaults
  const playerCountryOptions = useMemo(() => {
    const set = new Set(commonCountries);
    rawPlayers.forEach((p) => {
      if (p.country && p.country.trim()) set.add(p.country.trim());
    });
    return [
      { label: "Country", value: "ALL" },
      ...Array.from(set).map((c) => ({ label: c, value: c })),
    ];
  }, [rawPlayers]);

  const coachCountryOptions = useMemo(() => {
    const set = new Set(commonCountries);
    coaches.forEach((c) => {
      if (c.country && c.country.trim()) set.add(c.country.trim());
    });
    return [
      { label: "Country", value: "ALL" },
      ...Array.from(set).map((c) => ({ label: c, value: c })),
    ];
  }, [coaches]);

  const handleShare = async (title: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const togglePlayerFav = async (p: IScoutingBoardPlayer) => {
    const key = p.playerId || p.id;
    if (!key) return;

    const current = favPlayerMap[key] !== undefined ? favPlayerMap[key] : p.isFavourite;
    const next = !current;

    // Optimistic UI update
    setFavPlayerMap((prev) => ({ ...prev, [key]: next }));

    try {
      await toggleScoutingBoardFavourite({
        targetType: "PLAYER",
        targetId: key,
      }).unwrap();
    } catch {
      // Revert on error
      setFavPlayerMap((prev) => ({ ...prev, [key]: current }));
    }
  };

  const toggleCoachFav = async (c: IScoutingBoardCoach) => {
    const key = c.coachId || c.id;
    if (!key) return;

    const current = favCoachMap[key] !== undefined ? favCoachMap[key] : c.isFavourite;
    const next = !current;

    // Optimistic UI update
    setFavCoachMap((prev) => ({ ...prev, [key]: next }));

    try {
      await toggleScoutingBoardFavourite({
        targetType: "COACH",
        targetId: key,
      }).unwrap();
    } catch {
      // Revert on error
      setFavCoachMap((prev) => ({ ...prev, [key]: current }));
    }
  };

  const playerColumns: Column<IScoutingBoardPlayer>[] = [
    {
      header: "Name",
      key: "name",
      render: (p) => {
        const avatarSrc = p.avatar || "/placeholder_img.jpg";
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <Image
                src={avatarSrc}
                className="size-10 rounded-full object-cover"
                alt={p.name}
                width={40}
                height={40}
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{p.name}</div>
              <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
                {p.position || "FORWARD"}
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
      render: (p) => (
        <span className="text-sm font-black text-destructive italic">
          {p.rating || "—"}
        </span>
      ),
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400 text-center",
      render: (p) => <span className="text-sm text-gray-400">{p.club || "—"}</span>,
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span className="text-sm text-gray-400">{p.country || "—"}</span>,
    },
    {
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span className="text-sm text-gray-400">{p.age ?? "—"}</span>,
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (p) => {
        const s = (p.status || "").toUpperCase();
        let badgeStyle = "bg-amber-700/10 text-amber-500 border-amber-700/20";
        if (s === "GOLD") {
          badgeStyle = "bg-amber-400/10 text-amber-400 border-amber-400/20";
        } else if (s === "SILVER") {
          badgeStyle = "bg-slate-300/10 text-slate-300 border-slate-300/20";
        }
        return (
          <span
            className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badgeStyle}`}
          >
            {p.status || "BRONZE"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (p) => {
        const key = p.playerId || p.id;
        const isFav = favPlayerMap[key] !== undefined ? favPlayerMap[key] : p.isFavourite;
        return (
          <TableActionButtons
            onView={() => router.push(`/dashboard/club/scouting-board/${key}`)}
            onHeart={() => togglePlayerFav(p)}
            onShare={() =>
              handleShare(
                `${p.name} - Player Profile`,
                `${window.location.origin}/dashboard/club/scouting-board/${key}`
              )
            }
            isHeartFilled={isFav}
          />
        );
      },
    },
  ];

  const coachColumns: Column<IScoutingBoardCoach>[] = [
    {
      header: "Name",
      key: "name",
      render: (c) => {
        const avatarSrc = c.avatar || "/placeholder_img.jpg";
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <Image
                src={avatarSrc}
                className="size-10 rounded-full object-cover"
                alt={c.name}
                width={40}
                height={40}
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{c.name}</div>
              <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
                {c.role || "HEAD COACH"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Speciality",
      key: "speciality",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => <span className="text-sm text-gray-400">{c.speciality || "—"}</span>,
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => <span className="text-sm text-gray-400">{c.club || "—"}</span>,
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => <span className="text-sm text-gray-400">{c.country || "—"}</span>,
    },
    {
      header: "Experience",
      key: "experience",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => (
        <span className="text-sm text-gray-400">
          {c.experience || (c.yearsExperience ? `${c.yearsExperience} yrs` : "—")}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (c) => {
        const isAvail = (c.status || "").toUpperCase() === "AVAILABLE";
        return (
          <span
            className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              isAvail
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            {c.status || "AVAILABLE"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (c) => {
        const key = c.coachId || c.id;
        const isFav = favCoachMap[key] !== undefined ? favCoachMap[key] : c.isFavourite;
        return (
          <TableActionButtons
            onView={() => router.push(`/cvs/coach-cv-details?coachId=${key}`)}
            onHeart={() => toggleCoachFav(c)}
            onShare={() =>
              handleShare(
                `${c.name} - Coach Profile`,
                `${window.location.origin}/cvs/coach-cv-details?coachId=${key}`
              )
            }
            isHeartFilled={isFav}
          />
        );
      },
    },
  ];

  const resetPlayerFilters = () => {
    setPlayerPosition("ALL");
    setPlayerCountry("ALL");
    setPlayerAgeRange("ALL");
    setPlayerStatus("ALL");
    setPlayerPage(1);
  };

  const resetCoachFilters = () => {
    setCoachRole("ALL");
    setCoachCountry("ALL");
    setCoachSpeciality("ALL");
    setCoachStatus("ALL");
    setCoachPage(1);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-8 md:pb-12 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            Scouting Board
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Discover and track potential signings
          </p>
        </div>
        {isFetching && (
          <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit">
            <IconLoader2 size={14} className="animate-spin" /> Updating board...
          </span>
        )}
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="p-5 rounded-2xl border border-destructive/20 bg-destructive/10 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm">Failed to load scouting board</p>
            <p className="text-xs text-white/60">
              An error occurred while fetching players and coaches.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-white/20 text-white hover:bg-white/10 shrink-0 gap-1.5 cursor-pointer"
          >
            <IconRefresh size={14} /> Retry
          </Button>
        </div>
      )}

      {/* Players Table Section */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
              Players
            </p>
            {meta?.players?.total !== undefined && (
              <span className="text-[10px] font-bold text-white/40">
                ({meta.players.total})
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DropdownFilter
              value={playerPosition}
              onChange={(val) => {
                setPlayerPosition(val);
                setPlayerPage(1);
              }}
              options={playerPositionOptions}
            />
            <DropdownFilter
              value={playerCountry}
              onChange={(val) => {
                setPlayerCountry(val);
                setPlayerPage(1);
              }}
              options={playerCountryOptions}
            />
            <DropdownFilter
              value={playerAgeRange}
              onChange={(val) => setPlayerAgeRange(val)}
              options={playerAgeOptions}
            />
            <DropdownFilter
              value={playerStatus}
              onChange={(val) => {
                setPlayerStatus(val);
                setPlayerPage(1);
              }}
              options={playerStatusOptions}
            />
          </div>
        </div>

        {/* Players Loading / Empty / Data Table */}
        {isLoading ? (
          <TableSkeleton rowCount={5} columnCount={7} />
        ) : filteredPlayers.length === 0 ? (
          <EmptyState
            title="No players match your criteria"
            description="Try adjusting your position, country, or status filters."
            onReset={resetPlayerFilters}
          />
        ) : (
          <DashboardTable
            columns={playerColumns}
            data={filteredPlayers}
            className="border-white/10"
          />
        )}

        {/* Players Pagination */}
        {meta?.players && meta.players.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400">
            <span>
              Page {meta.players.page} of {meta.players.totalPages} ({meta.players.total} players)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={playerPage <= 1}
                onClick={() => setPlayerPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={playerPage >= meta.players.totalPages}
                onClick={() => setPlayerPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Coaches Table Section */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
              Coaches
            </p>
            {meta?.coaches?.total !== undefined && (
              <span className="text-[10px] font-bold text-white/40">
                ({meta.coaches.total})
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DropdownFilter
              value={coachRole}
              onChange={(val) => {
                setCoachRole(val);
                setCoachPage(1);
              }}
              options={coachRoleOptions}
            />
            <DropdownFilter
              value={coachCountry}
              onChange={(val) => {
                setCoachCountry(val);
                setCoachPage(1);
              }}
              options={coachCountryOptions}
            />
            <DropdownFilter
              value={coachSpeciality}
              onChange={(val) => {
                setCoachSpeciality(val);
                setCoachPage(1);
              }}
              options={coachSpecialityOptions}
            />
            <DropdownFilter
              value={coachStatus}
              onChange={(val) => {
                setCoachStatus(val);
                setCoachPage(1);
              }}
              options={coachStatusOptions}
            />
          </div>
        </div>

        {/* Coaches Loading / Empty / Data Table */}
        {isLoading ? (
          <TableSkeleton rowCount={3} columnCount={7} />
        ) : coaches.length === 0 ? (
          <EmptyState
            title="No coaches match your criteria"
            description="Try adjusting your role, speciality, or status filters."
            onReset={resetCoachFilters}
          />
        ) : (
          <DashboardTable
            columns={coachColumns}
            data={coaches}
            className="border-white/10"
          />
        )}

        {/* Coaches Pagination */}
        {meta?.coaches && meta.coaches.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-gray-400">
            <span>
              Page {meta.coaches.page} of {meta.coaches.totalPages} ({meta.coaches.total} coaches)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={coachPage <= 1}
                onClick={() => setCoachPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={coachPage >= meta.coaches.totalPages}
                onClick={() => setCoachPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DropdownFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

const DropdownFilter = ({ value, onChange, options }: DropdownFilterProps) => (
  <div className="relative inline-block flex-1 sm:flex-none min-w-fit">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-auto appearance-none flex items-center justify-between gap-2 px-3 sm:px-4 py-2 pr-8 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-bold hover:bg-white/10 focus:outline-none focus:border-white/25 transition-all cursor-pointer whitespace-nowrap"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
          {opt.label}
        </option>
      ))}
    </select>
    <IconChevronDown
      size={14}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
    />
  </div>
);

const EmptyState = ({
  title,
  description,
  onReset,
}: {
  title: string;
  description: string;
  onReset: () => void;
}) => (
  <div className="py-12 px-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-center bg-white/[0.01]">
    <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
      <IconUserOff size={24} />
    </div>
    <div>
      <p className="text-sm font-bold text-white uppercase tracking-wider">{title}</p>
      <p className="text-xs text-white/40 mt-1 max-w-sm">{description}</p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onReset}
      className="border-white/15 text-white hover:bg-white/10 text-xs mt-2 cursor-pointer"
    >
      Reset Filters
    </Button>
  </div>
);

const TableSkeleton = ({
  rowCount = 4,
  columnCount = 7,
}: {
  rowCount?: number;
  columnCount?: number;
}) => (
  <div className="border border-white/10 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-10 bg-white/5 border-b border-white/10" />
    <div className="divide-y divide-white/5">
      {Array.from({ length: rowCount }).map((_, r) => (
        <div key={r} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/4">
            <div className="size-10 rounded-full bg-white/10 shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-2 w-1/2 rounded bg-white/5" />
            </div>
          </div>
          {Array.from({ length: columnCount - 2 }).map((_, c) => (
            <div key={c} className="h-3 w-16 rounded bg-white/5 hidden sm:block" />
          ))}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/5" />
            <div className="size-8 rounded-lg bg-white/5" />
            <div className="size-8 rounded-lg bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ScoutingBoard;
