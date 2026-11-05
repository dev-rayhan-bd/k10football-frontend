"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconLock,
  IconLockOpen,
  IconMail,
  IconMapPin,
  IconBuildingCommunity,
  IconBallFootball,
  IconCalendar,
  IconFileText,
  IconShield,
} from "@tabler/icons-react";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetAdminPlayersQuery,
  useToggleUserStatusMutation,
} from "@/redux/features/admin/adminApi";
import { IAdminPlayerItem } from "@/types/admin.type";
import { cn } from "@/lib/utils";

const CvPill = ({ type }: { type?: string }) => {
  const normalized = (type || "BRONZE").toUpperCase();
  const styles: Record<string, string> = {
    GOLD: "bg-yellow-500 text-black border-yellow-500/40 font-bold",
    SILVER: "bg-white/10 text-white border-white/20",
    BRONZE: "bg-orange-800/20 text-orange-400 border-orange-800/40",
  };

  const style = styles[normalized] || styles.BRONZE;

  return (
    <span
      className={cn(
        "px-4 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider",
        style
      )}
    >
      {normalized}
    </span>
  );
};

const StatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={cn(
      "px-4 py-1 rounded-full text-[10px] font-black uppercase border",
      active
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-white/5 text-white/40 border-white/10"
    )}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const POSITION_FILTER_OPTIONS = [
  { label: "All Positions", value: "ALL" },
  { label: "Forward", value: "FORWARD" },
  { label: "Midfielder", value: "MIDFIELDER" },
  { label: "Defender", value: "DEFENDER" },
  { label: "Goalkeeper", value: "GOALKEEPER" },
  { label: "Striker", value: "ST" },
  { label: "Winger", value: "WINGER" },
];

const AGE_RANGE_OPTIONS = [
  { label: "All Ages", value: "ALL" },
  { label: "Under 18", value: "u18" },
  { label: "18 - 21", value: "18-21" },
  { label: "22 - 25", value: "22-25" },
  { label: "26+", value: "26+" },
];

const STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Gold CV", value: "GOLD" },
  { label: "Silver CV", value: "SILVER" },
  { label: "Bronze CV", value: "BRONZE" },
];

const getPageNumbers = (current: number, total: number) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("...");
    pages.push(total);
  }
  return pages;
};

const SuperAdminPlayers = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [positionFilter, setPositionFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [ageRangeFilter, setAgeRangeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedPlayer, setSelectedPlayer] = useState<IAdminPlayerItem | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const [toggleUserStatus] = useToggleUserStatusMutation();

  const handleToggleBlock = async (userId?: string) => {
    if (!userId) {
      toast.error("User ID not found for this player.");
      return;
    }
    try {
      setTogglingUserId(userId);
      await toggleUserStatus(userId).unwrap();
    } catch {
      // Toast handled by API middleware
    } finally {
      setTogglingUserId(null);
    }
  };

  // API Call with Pagination & Filters
  const {
    data: playersRes,
    isLoading,
    isError,
    refetch,
  } = useGetAdminPlayersQuery({
    page,
    limit,
    position: positionFilter !== "ALL" ? positionFilter : undefined,
    country: countryFilter !== "ALL" ? countryFilter : undefined,
    ageRange: ageRangeFilter !== "ALL" ? ageRangeFilter : undefined,
    status:
      statusFilter === "ACTIVE" || statusFilter === "INACTIVE"
        ? statusFilter
        : undefined,
    cvTier:
      statusFilter === "GOLD" || statusFilter === "SILVER" || statusFilter === "BRONZE"
        ? statusFilter
        : undefined,
  });

  const players = useMemo(() => playersRes?.data || [], [playersRes?.data]);
  const meta = playersRes?.meta;
  const totalPages = meta?.totalPages || Math.ceil((meta?.total || 0) / limit) || 1;
  const totalPlayers = meta?.total ?? players.length;

  const handlePositionChange = (val: string) => {
    setPositionFilter(val);
    setPage(1);
  };

  const handleCountryChange = (val: string) => {
    setCountryFilter(val);
    setPage(1);
  };

  const handleAgeRangeChange = (val: string) => {
    setAgeRangeFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Extract distinct countries dynamically from data
  const dynamicCountries = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      if (p.country && p.country.trim()) {
        set.add(p.country.trim());
      }
    });
    return Array.from(set).sort();
  }, [players]);

  // Client-side fallback filtering
  const filteredPlayers = useMemo(() => {
    return players.filter((item) => {
      // Position filter
      if (positionFilter !== "ALL") {
        const pos = (item.position || "").toUpperCase();
        const sec = (item.secondaryPositions || []).map((s) => s.toUpperCase());
        const target = positionFilter.toUpperCase();

        const matchesPos =
          pos.includes(target) ||
          sec.some((s) => s.includes(target)) ||
          (target === "FORWARD" && (pos.includes("ST") || pos.includes("FORWARD") || pos.includes("ATTACK"))) ||
          (target === "MIDFIELDER" && pos.includes("MIDFIELD")) ||
          (target === "DEFENDER" && (pos.includes("DEFEND") || pos.includes("CB") || pos.includes("BACK"))) ||
          (target === "GOALKEEPER" && (pos.includes("GK") || pos.includes("GOAL")));

        if (!matchesPos) return false;
      }

      // Country filter
      if (countryFilter !== "ALL") {
        if ((item.country || "").toUpperCase() !== countryFilter.toUpperCase()) {
          return false;
        }
      }

      // Age range filter
      if (ageRangeFilter !== "ALL") {
        const age = item.age;
        if (age === null || age === undefined) return false;
        if (ageRangeFilter === "u18" && age >= 18) return false;
        if (ageRangeFilter === "18-21" && (age < 18 || age > 21)) return false;
        if (ageRangeFilter === "22-25" && (age < 22 || age > 25)) return false;
        if (ageRangeFilter === "26+" && age < 26) return false;
      }

      // Status / CV filter
      if (statusFilter !== "ALL") {
        const itemStatus = (item.displayStatus || item.status || "").toUpperCase();
        const cv = (item.cvTier || item.cvType || "").toUpperCase();

        if (statusFilter === "ACTIVE") {
          if (itemStatus !== "ACTIVE" || item.isBlocked) return false;
        } else if (statusFilter === "INACTIVE") {
          if (itemStatus === "ACTIVE" && !item.isBlocked) return false;
        } else if (statusFilter === "GOLD") {
          if (cv !== "GOLD") return false;
        } else if (statusFilter === "SILVER") {
          if (cv !== "SILVER") return false;
        } else if (statusFilter === "BRONZE") {
          if (cv !== "BRONZE") return false;
        }
      }

      return true;
    });
  }, [players, positionFilter, countryFilter, ageRangeFilter, statusFilter]);

  const columns: Column<IAdminPlayerItem>[] = [
    {
      header: "Name",
      key: "name",
      render: (row) => {
        const avatarUrl = row.avatar || row.profileImage || "/placeholder_img.jpg";
        const displayName = row.fullName || row.name || "Unnamed Player";
        const displayPos = row.position || "—";

        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/10 overflow-hidden border border-white/20 shrink-0 relative flex items-center justify-center">
              <Image
                src={avatarUrl}
                alt={displayName}
                className="size-full object-cover"
                width={40}
                height={40}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-black uppercase tracking-tight truncate">
                {displayName}
              </p>
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider truncate">
                {displayPos}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-white/60 text-sm font-black font-orbitron",
      render: (row) => <span>{row.age !== null && row.age !== undefined ? row.age : "—"}</span>,
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-white/60 text-sm font-medium",
      render: (row) => <span>{row.country || "—"}</span>,
    },
    {
      header: "Academy",
      key: "academy",
      align: "center",
      render: (row) => (
        <span className="text-white text-sm font-black uppercase tracking-tight">
          {row.academy || "—"}
        </span>
      ),
    },
    {
      header: "CV Type",
      key: "cvTier",
      align: "center",
      render: (row) => <CvPill type={row.cvTier || row.cvType} />,
    },
    {
      header: "Reports",
      key: "reports",
      align: "center",
      cellClassName: "text-white/60 text-sm font-medium",
      render: (row) => <span>{row.reports ?? 0}</span>,
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => {
        const isActive =
          (row.displayStatus || row.status || "").toUpperCase() === "ACTIVE" && !row.isBlocked;
        return <StatusBadge active={isActive} />;
      },
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      render: (row) => {
        const isBlocked =
          !!row.isBlocked ||
          (row.displayStatus || row.status || "").toUpperCase() === "BLOCKED";
        const targetUserId = row.userId || row.playerId || row._id;
        const isToggling = togglingUserId === targetUserId;

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedPlayer(row)}
              className="size-9 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all hover:scale-105 cursor-pointer"
              title="View Player Profile"
            >
              <IconEye size={18} stroke={2} />
            </button>
            <button
              type="button"
              disabled={isToggling}
              onClick={() => handleToggleBlock(targetUserId)}
              className={cn(
                "size-9 inline-flex items-center justify-center rounded-xl border transition-all hover:scale-105 cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                isBlocked
                  ? "border-red-500/40 bg-red-500/10 text-red-400 hover:border-red-500 hover:bg-red-500/20"
                  : "border-yellow-500/30 bg-yellow-500/5 text-yellow-500 hover:text-yellow-400 hover:border-yellow-500/40 hover:bg-yellow-500/10"
              )}
              title={isBlocked ? "Blocked (Click to Unblock)" : "Active (Click to Block)"}
            >
              {isToggling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isBlocked ? (
                <IconLock size={18} stroke={2} />
              ) : (
                <IconLockOpen size={18} stroke={2} />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 shrink-0 w-full min-w-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">
              Player
            </h1>
            {playersRes?.meta?.total !== undefined && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/60">
                {playersRes.meta.total} Registered
              </span>
            )}
          </div>
          <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">
            Monitored all registered players
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Refresh Players"
        >
          <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8 min-w-0 overflow-hidden w-full">
        {/* Table Filters */}
        <div className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-2 sm:gap-3 overflow-x-auto no-scrollbar w-full">
          {/* Position Filter */}
          <div className="relative shrink-0">
            <select
              value={positionFilter}
              onChange={(e) => handlePositionChange(e.target.value)}
              className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
            >
              {POSITION_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
            />
          </div>

          {/* Country Filter */}
          <div className="relative shrink-0">
            <select
              value={countryFilter}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
            >
              <option value="ALL" className="bg-[#111111] text-white">
                All Countries
              </option>
              {dynamicCountries.map((c) => (
                <option key={c} value={c} className="bg-[#111111] text-white">
                  {c}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
            />
          </div>

          {/* Age Range Filter */}
          <div className="relative shrink-0">
            <select
              value={ageRangeFilter}
              onChange={(e) => handleAgeRangeChange(e.target.value)}
              className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
            >
              {AGE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto no-scrollbar">
          {isLoading ? (
            <TableSkeleton
              rowCount={limit || 10}
              headers={["NAME", "AGE", "COUNTRY", "ACADEMY", "CV TYPE", "REPORTS", "STATUS", "ACTIONS"]}
              hasAvatar={true}
              actionButtonsCount={2}
            />
          ) : isError ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-destructive text-sm font-semibold">
                Failed to load players list.
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
              >
                <RefreshCw className="size-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-white/60 text-sm font-bold">No players found matching criteria.</p>
              <p className="text-white/30 text-xs">
                Try resetting or adjusting the position, country, or age filters above.
              </p>
            </div>
          ) : (
            <DashboardTable columns={columns} data={filteredPlayers} />
          )}
        </div>

        {/* Pagination Controls */}
        {totalPlayers > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 w-full">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/50 uppercase tracking-wider">
              <span>
                Showing {Math.min((page - 1) * limit + 1, totalPlayers)} -{" "}
                {Math.min(page * limit, totalPlayers)} of {totalPlayers} players
              </span>
              <div className="flex items-center gap-1.5 text-[11px] normal-case text-white/40">
                <span>Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="bg-black/40 border border-white/15 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value={10} className="bg-[#18181b] text-white">
                    10
                  </option>
                  <option value={20} className="bg-[#18181b] text-white">
                    20
                  </option>
                  <option value={50} className="bg-[#18181b] text-white">
                    50
                  </option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <IconChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers(page, totalPages).map((pNum, idx) => {
                  if (pNum === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="size-8 flex items-center justify-center text-xs text-white/40"
                      >
                        ...
                      </span>
                    );
                  }
                  const isCurrent = page === pNum;
                  return (
                    <button
                      key={`page-btn-${pNum}`}
                      type="button"
                      onClick={() => setPage(Number(pNum))}
                      className={cn(
                        "size-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isCurrent
                          ? "bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/30"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Player Details Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-xl p-6 rounded-3xl w-[92vw] sm:w-full max-h-[90vh] overflow-y-auto">
          {selectedPlayer && (
            <div className="flex flex-col gap-5">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-14 rounded-2xl bg-white/10 overflow-hidden border border-white/20 shrink-0 relative flex items-center justify-center">
                      <Image
                        src={selectedPlayer.avatar || selectedPlayer.profileImage || "/placeholder_img.jpg"}
                        alt={selectedPlayer.fullName || selectedPlayer.name || "Player"}
                        className="size-full object-cover"
                        width={56}
                        height={56}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.srcset = "";
                          target.src = "/placeholder_img.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black text-white font-orbitron tracking-tight">
                        {selectedPlayer.fullName || selectedPlayer.name}
                      </DialogTitle>
                      <p className="text-red-500 text-xs font-bold uppercase mt-0.5 tracking-wider">
                        {selectedPlayer.position || "Player"}
                      </p>
                    </div>
                  </div>
                  <CvPill type={selectedPlayer.cvTier || selectedPlayer.cvType} />
                </div>
              </DialogHeader>

              {/* Player Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconMail size={13} /> Email
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {selectedPlayer.email || "—"}
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconMapPin size={13} /> Country
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedPlayer.country || "—"}
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconBuildingCommunity size={13} /> Academy
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {selectedPlayer.academy || "Unassigned"}
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconCalendar size={13} /> Age
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedPlayer.age !== null && selectedPlayer.age !== undefined
                      ? `${selectedPlayer.age} years old`
                      : "—"}
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconFileText size={13} /> Game Reports
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedPlayer.reports ?? 0} Reports Filed
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconShield size={13} /> Account Status
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge
                      active={
                        (selectedPlayer.displayStatus || selectedPlayer.status || "").toUpperCase() ===
                          "ACTIVE" && !selectedPlayer.isBlocked
                      }
                    />
                    {selectedPlayer.isBlocked && (
                      <Badge variant="destructive" className="text-[9px]">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary Positions */}
              {selectedPlayer.secondaryPositions && selectedPlayer.secondaryPositions.length > 0 && (
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconBallFootball size={13} /> Secondary Positions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPlayer.secondaryPositions.map((pos, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 text-[10px] font-bold"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-[11px] text-white/40 flex justify-between items-center pt-2 border-t border-white/10">
                <span>Player ID: {selectedPlayer.playerId || selectedPlayer._id}</span>
                <span>
                  Registered:{" "}
                  {selectedPlayer.createdAt ? selectedPlayer.createdAt.split("T")[0] : "—"}
                </span>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPlayer(null)}
                  className="bg-transparent border-[#3f3f46] text-white hover:bg-[#27272a] hover:text-white h-10 px-6 rounded-xl font-medium"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminPlayers;
