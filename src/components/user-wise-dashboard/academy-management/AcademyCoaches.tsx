"use client";

import { useMemo, useState } from "react";
import {
  IconAlertCircle,
  IconRefresh,
  IconSearch,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import ChatAvatar from "@/components/chat/ChatAvatar";
import RemoveCoachFromAcademyDialog from "@/components/user-wise-dashboard/academy-analysis/RemoveCoachFromAcademyDialog";
import { useGetAcademyCoachesQuery } from "@/redux/features/academy/academyApi";
import { getApiError } from "@/redux/features/cvValidation/cvValidationApi";
import { cn } from "@/lib/utils";
import { INACTIVE_COACH_STATUSES, toAcademyCoachRows } from "./academyLists";

const INACTIVE_STATUSES = INACTIVE_COACH_STATUSES;

const formatDate = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const statusClass = (status: string) => {
  if (["APPROVED", "ACTIVE", "VERIFIED"].includes(status)) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (status === "PENDING") return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (INACTIVE_STATUSES.includes(status)) return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-white/15 bg-white/5 text-white/60";
};

interface AcademyCoachesProps {
  /** Lets the host page refresh data that isn't driven by RTK tags. */
  onCoachRemoved?: () => void;
}

/** "My Coaches" section: coaches affiliated with the academy, with Remove from academy. */
const AcademyCoaches = ({ onCoachRemoved }: AcademyCoachesProps) => {
  const { data, isLoading, isFetching, error, refetch } = useGetAcademyCoachesQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [coachToRemove, setCoachToRemove] = useState<{ id: string; name: string } | null>(null);

  const coaches = useMemo(
    () => toAcademyCoachRows(data?.data),
    [data]
  );

  const statuses = useMemo(
    () => Array.from(new Set(coaches.map((c) => c.status).filter(Boolean))),
    [coaches]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return coaches.filter((coach) => {
      if (statusFilter !== "ALL" && coach.status !== statusFilter) return false;
      if (!term) return true;
      return [coach.name, coach.email, coach.license, ...coach.teams].some((v) => v.toLowerCase().includes(term));
    });
  }, [coaches, search, statusFilter]);

  const activeCount = coaches.filter((c) => !INACTIVE_STATUSES.includes(c.status)).length;
  const onTeamsCount = coaches.filter((c) => (c.teamsCount ?? 0) > 0).length;
  const errorMessage = error ? getApiError(error, "Failed to load coaches").message : "";

  return (
    <div className="flex min-w-0 flex-col gap-8 rounded-3xl border border-white/20 bg-[#111111] p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h2 className="truncate font-orbitron text-2xl font-black uppercase tracking-tight text-white">My Coaches</h2>
          <p className="mt-1 truncate text-xs font-medium uppercase tracking-widest text-white/60">
            {isLoading ? "Academy coaching staff" : `${activeCount} active • ${onTeamsCount} assigned to teams`}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {["ALL", ...statuses].map((status) => {
              const isActive = statusFilter === status;
              const count = status === "ALL" ? coaches.length : coaches.filter((c) => c.status === status).length;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/5 bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/80"
                  )}
                >
                  <span>{status}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
                      isActive ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/60"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-72">
              <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, team..."
                className="w-full rounded-xl border border-white/10 bg-white/2 py-2 pl-9 pr-8 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-white"
                >
                  <IconX size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
            >
              <IconRefresh size={16} className={cn(isFetching && "animate-spin text-white")} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full min-w-200 border-collapse text-left">
            <thead>
              <tr className="border-b border-white/20 bg-white/2">
                {["Coach", "Licence", "Teams", "Joined", "Status", "Action"].map((heading, idx, arr) => (
                  <th
                    key={heading}
                    className={cn(
                      "px-6 py-5 text-[11px] font-black uppercase tracking-widest text-white/40",
                      idx > 0 && "text-center",
                      idx < arr.length - 1 && "border-r border-white/20"
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-white/10">
                    <td className="border-r border-white/10 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white/10" />
                        <div className="h-4 w-40 rounded bg-white/10" />
                      </div>
                    </td>
                    {Array.from({ length: 5 }).map((__, cell) => (
                      <td key={cell} className="border-r border-white/10 px-6 py-5 last:border-r-0">
                        <div className="mx-auto h-4 w-16 rounded bg-white/10" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : errorMessage ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <IconAlertCircle size={28} className="text-destructive" />
                      <p className="text-sm font-bold text-white">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                      >
                        <IconRefresh size={14} /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm font-medium text-white/40">
                    {coaches.length === 0 ? "No coaches are affiliated with your academy yet." : "No coaches match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((coach, index) => {
                  const isInactive = INACTIVE_STATUSES.includes(coach.status);
                  return (
                    <tr
                      key={coach.removeId}
                      className={cn("transition-colors hover:bg-white/2", index !== filtered.length - 1 && "border-b border-white/20")}
                    >
                      <td className="border-r border-white/20 px-6 py-6">
                        <div className="flex items-center gap-3">
                          <ChatAvatar src={coach.avatar} name={coach.name} className="size-10" />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-bold text-white">{coach.name}</span>
                            {(coach.email || coach.role) && (
                              <span className="truncate text-xs text-white/50">{coach.role || coach.email}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-r border-white/20 px-6 py-6 text-center text-sm text-white/80">
                        {coach.license || "—"}
                      </td>
                      <td className="border-r border-white/20 px-6 py-6 text-center text-sm text-white/80">
                        {coach.teams.length > 0 ? (
                          <span title={coach.teams.join(", ")} className="line-clamp-2">
                            {coach.teams.join(", ")}
                          </span>
                        ) : (
                          (coach.teamsCount ?? "—")
                        )}
                      </td>
                      <td className="whitespace-nowrap border-r border-white/20 px-6 py-6 text-center text-sm text-white/80">
                        {formatDate(coach.joinedAt)}
                      </td>
                      <td className="whitespace-nowrap border-r border-white/20 px-6 py-6 text-center">
                        {coach.status ? (
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                              statusClass(coach.status)
                            )}
                          >
                            {coach.status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-6 text-center">
                        <button
                          type="button"
                          disabled={isInactive}
                          onClick={() => setCoachToRemove({ id: coach.removeId, name: coach.name })}
                          title={isInactive ? "Already removed" : "Remove from academy"}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-destructive transition-all hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-destructive/10 disabled:hover:text-destructive"
                        >
                          <IconUserMinus size={14} /> Remove from academy
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RemoveCoachFromAcademyDialog coach={coachToRemove} onClose={() => setCoachToRemove(null)} onRemoved={onCoachRemoved} />
    </div>
  );
};

export default AcademyCoaches;
