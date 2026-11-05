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
  IconSchool,
  IconTrophy,
  IconUsers,
  IconUser,
  IconMail,
  IconMapPin,
  IconShield,
  IconSoccerField,
} from "@tabler/icons-react";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableSkeleton, { StatCardSkeleton } from "@/components/dashboard/TableSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAdminAcademiesQuery,
  useToggleUserStatusMutation,
} from "@/redux/features/admin/adminApi";
import { IAdminAcademyItem } from "@/types/admin.type";
import { cn } from "@/lib/utils";

const SummaryStatCard = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string | number;
  label: string;
}) => (
  <div className="bg-[#111111] border border-white/20 rounded-2xl p-4 sm:p-6 flex flex-col gap-2 sm:gap-4 flex-1 min-w-0">
    <div className="size-8 sm:size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
      <Icon size={20} className="size-4 sm:size-5" />
    </div>
    <div className="min-w-0">
      <p className="text-white text-xl sm:text-3xl font-black font-orbitron truncate">{value}</p>
      <p className="text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider truncate">
        {label}
      </p>
    </div>
  </div>
);

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

const STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
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

const SuperAdminAcademies = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAcademy, setSelectedAcademy] = useState<IAdminAcademyItem | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const [toggleUserStatus] = useToggleUserStatusMutation();

  const handleToggleBlock = async (userId?: string) => {
    if (!userId) {
      toast.error("User ID not found for this academy.");
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

  const {
    data: academiesRes,
    isLoading,
    isError,
    refetch,
  } = useGetAdminAcademiesQuery({
    page,
    limit,
    status:
      statusFilter === "ACTIVE" || statusFilter === "INACTIVE"
        ? statusFilter
        : undefined,
  });

  const academies = useMemo(() => academiesRes?.data || [], [academiesRes?.data]);
  const meta = academiesRes?.meta;
  const summary = meta?.summary;
  const totalPages = meta?.totalPages || Math.ceil((meta?.total || 0) / limit) || 1;
  const totalAcademies = meta?.total ?? academies.length;

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Client-side fallback filtering
  const filteredAcademies = useMemo(() => {
    if (statusFilter === "ALL") return academies;
    return academies.filter((item) => {
      const itemStatus = (item.displayStatus || item.status || "").toUpperCase();
      if (statusFilter === "ACTIVE") {
        return itemStatus === "ACTIVE" && !item.isBlocked;
      }
      if (statusFilter === "INACTIVE") {
        return itemStatus !== "ACTIVE" || item.isBlocked;
      }
      return true;
    });
  }, [academies, statusFilter]);

  const columns: Column<IAdminAcademyItem>[] = [
    {
      header: "Academy",
      key: "name",
      render: (row) => {
        const logoUrl = row.logo || row.avatar || "/placeholder_img.jpg";
        const displayName = row.academyName || row.name || "Unnamed Academy";
        const subtitle = row.subtitle || row.category || row.league || "ACADEMY";

        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/10 overflow-hidden border border-white/20 shrink-0 relative flex items-center justify-center">
              <Image
                src={logoUrl}
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
                {subtitle}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Teams",
      key: "teamsCount",
      align: "center",
      cellClassName: "text-white text-sm font-black font-orbitron",
      render: (row) => <span>{row.teamsCount ?? row.teams ?? 0}</span>,
    },
    {
      header: "Coaches",
      key: "coachesCount",
      align: "center",
      cellClassName: "text-white text-sm font-black font-orbitron",
      render: (row) => <span>{row.coachesCount ?? row.coaches ?? 0}</span>,
    },
    {
      header: "Player",
      key: "playersCount",
      align: "center",
      cellClassName: "text-white text-sm font-black font-orbitron",
      render: (row) => <span>{row.playersCount ?? row.player ?? 0}</span>,
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
        const targetUserId = row.userId || row._id;
        const isToggling = togglingUserId === targetUserId;

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedAcademy(row)}
              className="size-9 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all hover:scale-105 cursor-pointer"
              title="View Academy Profile"
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
              Academy
            </h1>
            {meta?.total !== undefined && (
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/60">
                {meta.total} Registered
              </span>
            )}
          </div>
          <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">
            Monitored all registered academies
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Refresh Academies"
        >
          <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <SummaryStatCard
              icon={IconSchool}
              value={summary?.academies ?? summary?.totalAcademies ?? meta?.total ?? 0}
              label="Academies"
            />
            <SummaryStatCard
              icon={IconTrophy}
              value={summary?.totalTeams ?? 0}
              label="Total Teams"
            />
            <SummaryStatCard
              icon={IconUser}
              value={summary?.totalCoaches ?? 0}
              label="Total Coaches"
            />
            <SummaryStatCard
              icon={IconUsers}
              value={summary?.totalPlayers ?? 0}
              label="Total Players"
            />
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 min-w-0 overflow-hidden w-full">
        {/* Table Filters */}
        <div className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-2 sm:gap-3 overflow-x-auto no-scrollbar w-full">
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
              headers={["ACADEMY", "TEAMS", "COACHES", "PLAYER", "STATUS", "ACTIONS"]}
              hasAvatar={true}
              actionButtonsCount={2}
            />
          ) : isError ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-destructive text-sm font-semibold">
                Failed to load academies list.
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
              >
                <RefreshCw className="size-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          ) : filteredAcademies.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-white/60 text-sm font-bold">No academies found matching criteria.</p>
              <p className="text-white/30 text-xs">
                Try resetting or adjusting the status filters above.
              </p>
            </div>
          ) : (
            <DashboardTable columns={columns} data={filteredAcademies} />
          )}
        </div>

        {/* Pagination Controls */}
        {totalAcademies > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 w-full">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/50 uppercase tracking-wider">
              <span>
                Showing {Math.min((page - 1) * limit + 1, totalAcademies)} -{" "}
                {Math.min(page * limit, totalAcademies)} of {totalAcademies} academies
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

      {/* View Academy Details Modal */}
      <Dialog open={!!selectedAcademy} onOpenChange={(open) => !open && setSelectedAcademy(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-xl p-6 rounded-3xl w-[92vw] sm:w-full max-h-[90vh] overflow-y-auto">
          {selectedAcademy && (
            <div className="flex flex-col gap-5">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-14 rounded-2xl bg-white/10 overflow-hidden border border-white/20 shrink-0 relative flex items-center justify-center">
                      <Image
                        src={selectedAcademy.logo || selectedAcademy.avatar || "/placeholder_img.jpg"}
                        alt={selectedAcademy.academyName || selectedAcademy.name || "Academy"}
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
                        {selectedAcademy.academyName || selectedAcademy.name}
                      </DialogTitle>
                      <p className="text-red-500 text-xs font-bold uppercase mt-0.5 tracking-wider">
                        {selectedAcademy.subtitle || selectedAcademy.category || selectedAcademy.league || "Academy"}
                      </p>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Academy Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconMail size={13} /> Email
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {selectedAcademy.email || "—"}
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconMapPin size={13} /> Location
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedAcademy.location ||
                      [selectedAcademy.city, selectedAcademy.country].filter(Boolean).join(", ") ||
                      "—"}
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconSoccerField size={13} /> Teams
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedAcademy.teamsCount ?? selectedAcademy.teams ?? 0} Teams
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconUser size={13} /> Coaches
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedAcademy.coachesCount ?? selectedAcademy.coaches ?? 0} Coaches
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconUsers size={13} /> Players
                  </span>
                  <span className="text-xs font-bold text-white">
                    {selectedAcademy.playersCount ?? selectedAcademy.player ?? 0} Registered Players
                  </span>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1.5">
                    <IconShield size={13} /> Account Status
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge
                      active={
                        (selectedAcademy.displayStatus || selectedAcademy.status || "").toUpperCase() ===
                          "ACTIVE" && !selectedAcademy.isBlocked
                      }
                    />
                    {selectedAcademy.isBlocked && (
                      <Badge variant="destructive" className="text-[9px]">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-[11px] text-white/40 flex justify-between items-center pt-2 border-t border-white/10">
                <span>Academy ID: {selectedAcademy.academyId || selectedAcademy._id}</span>
                <span>
                  Registered:{" "}
                  {selectedAcademy.createdAt ? selectedAcademy.createdAt.split("T")[0] : "—"}
                </span>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAcademy(null)}
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

export default SuperAdminAcademies;
