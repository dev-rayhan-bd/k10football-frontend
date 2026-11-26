"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconAlertCircle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconRefresh,
  IconSearch,
  IconSend,
  IconUserMinus,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ChatAvatar from "@/components/chat/ChatAvatar";
import RemoveCoachFromAcademyDialog from "@/components/user-wise-dashboard/academy-analysis/RemoveCoachFromAcademyDialog";
import {
  useGetAcademyCoachesQuery,
  useRemoveCoachFromAcademyMutation,
  useRespondAcademyCoachAffiliationMutation,
} from "@/redux/features/academy/academyApi";
import { getApiError } from "@/redux/features/cvValidation/cvValidationApi";
import type { AcademyCoachStatusFilter, IAcademyCoachListItem } from "@/types/academy.type";
import { cn } from "@/lib/utils";
import InviteCoachModal, { type InviteCoachTarget } from "./InviteCoachModal";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const TABS: { key: AcademyCoachStatusFilter; label: string; countKey: "all" | "approved" | "pending" | "notAffiliated" }[] = [
  { key: "ALL", label: "All", countKey: "all" },
  { key: "APPROVED", label: "Approved", countKey: "approved" },
  { key: "PENDING", label: "Pending", countKey: "pending" },
  { key: "NOT_AFFILIATED", label: "Not affiliated", countKey: "notAffiliated" },
];

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/** Badge text + colour from status / requestedBy (statusLabel wins for the text when the server sends one). */
const statusBadge = (coach: IAcademyCoachListItem) => {
  const status = String(coach.status || "").toUpperCase();
  if (status === "APPROVED")
    return { label: "Approved", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" };
  if (status === "PENDING") {
    return coach.requestedBy === "COACH"
      ? { label: "Requested to join", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" }
      : { label: "Invitation sent", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" };
  }
  if (status === "REJECTED")
    return { label: coach.statusLabel || "Declined", className: "border-destructive/30 bg-destructive/10 text-destructive" };
  if (status === "REMOVED")
    return { label: coach.statusLabel || "Removed", className: "border-destructive/30 bg-destructive/10 text-destructive" };
  return { label: coach.statusLabel || "Not affiliated", className: "border-white/15 bg-white/5 text-white/60" };
};

const actionButton =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-50";

interface AcademyCoachesProps {
  /** Lets the host page refresh data that isn't driven by RTK tags. */
  onCoachRemoved?: () => void;
}

/**
 * "My Coaches": every coach linked to the academy (approved, invited, requested, or only placed on a
 * team). The academy invites, the coach accepts → APPROVED. Row buttons come from the server's `actions`.
 */
const AcademyCoaches = ({ onCoachRemoved }: AcademyCoachesProps) => {
  const [status, setStatus] = useState<AcademyCoachStatusFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [inviteTarget, setInviteTarget] = useState<InviteCoachTarget | "new" | null>(null);
  const [coachToRemove, setCoachToRemove] = useState<{ id: string; name: string } | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const { data, isLoading, isFetching, error, refetch } = useGetAcademyCoachesQuery({
    status,
    searchTerm: searchTerm || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const [withdrawInvite] = useRemoveCoachFromAcademyMutation();
  const [respond] = useRespondAcademyCoachAffiliationMutation();

  const coaches = data?.data?.coaches ?? [];
  const summary = data?.data?.summary;
  const totalPages = Math.max(1, data?.meta?.totalPage ?? 1);
  const errorMessage = error ? getApiError(error, "Failed to load coaches").message : "";

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  const runAction = async (key: string, action: () => Promise<{ message?: string } | undefined>, fallback: string) => {
    if (busyKey) return;
    setBusyKey(key);
    try {
      const res = await action();
      toast.success(res?.message || fallback);
    } catch (err) {
      const { status: code, message } = getApiError(err, "Something went wrong");
      if (code !== 401) toast.error(message);
    } finally {
      setBusyKey(null);
    }
  };

  const handleWithdraw = (coach: IAcademyCoachListItem) =>
    coach.affiliationId &&
    runAction(
      `withdraw:${coach.coachId}`,
      () => withdrawInvite({ affiliationId: coach.affiliationId! }).unwrap(),
      "Pending invitation withdrawn"
    );

  const handleRespond = (coach: IAcademyCoachListItem, action: "APPROVE" | "REJECT") =>
    coach.affiliationId &&
    runAction(
      `${action}:${coach.coachId}`,
      () => respond({ affiliationId: coach.affiliationId!, action }).unwrap(),
      action === "APPROVE" ? "Coach approved" : "Request rejected"
    );

  const subtitle = summary
    ? `${summary.approved ?? 0} approved • ${summary.assignedToTeams ?? 0} assigned to teams`
    : "Academy coaching staff";

  return (
    <div className="flex min-w-0 flex-col gap-8 rounded-3xl border border-white/20 bg-[#111111] p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h2 className="truncate font-orbitron text-2xl font-black uppercase tracking-tight text-white">My Coaches</h2>
          <p className="mt-1 truncate text-xs font-medium uppercase tracking-widest text-white/60">{subtitle}</p>
        </div>
        <Button type="button" onClick={() => setInviteTarget("new")} className="gap-2 font-bold uppercase tracking-wider">
          <IconUserPlus className="size-4" /> Invite coach
        </Button>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {TABS.map((tab) => {
              const isActive = status === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setStatus(tab.key);
                    setPage(1);
                  }}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/5 bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/80"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
                      isActive ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/60"
                    )}
                  >
                    {summary?.[tab.countKey] ?? 0}
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
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name or email..."
                className="w-full rounded-xl border border-white/10 bg-white/2 py-2 pl-9 pr-8 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
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
          <table className="w-full min-w-225 border-collapse text-left">
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
              ) : coaches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm font-medium text-white/40">
                    {searchTerm || status !== "ALL"
                      ? "No coaches match your filters."
                      : "No coaches yet. Invite a coach to join your academy."}
                  </td>
                </tr>
              ) : (
                coaches.map((coach, index) => {
                  const badge = statusBadge(coach);
                  const actions = coach.actions ?? {};
                  const teams = (coach.assignedTeams ?? []).map((t) => t.teamName).filter(Boolean);
                  const name = coach.fullName || "Coach";
                  const hasAction = actions.canInvite || actions.canCancelInvite || actions.canRespond || actions.canRemove;
                  return (
                    <tr
                      key={coach.coachId}
                      className={cn("transition-colors hover:bg-white/2", index !== coaches.length - 1 && "border-b border-white/20")}
                    >
                      <td className="border-r border-white/20 px-6 py-6">
                        <div className="flex items-center gap-3">
                          <ChatAvatar src={coach.profileImage} name={name} className="size-10" />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-bold text-white">{name}</span>
                            {(coach.role || coach.email) && (
                              <span className="truncate text-xs text-white/50">
                                {[coach.role, coach.email].filter(Boolean).join(" • ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-r border-white/20 px-6 py-6 text-center text-sm text-white/80">
                        {coach.licenseStatus || "—"}
                      </td>
                      <td className="border-r border-white/20 px-6 py-6 text-center text-sm text-white/80">
                        {teams.length > 0 ? (
                          <span title={teams.join(", ")} className="line-clamp-2">
                            {teams.join(", ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap border-r border-white/20 px-6 py-6 text-center text-sm text-white/80">
                        {formatDate(coach.joinedAt)}
                      </td>
                      <td className="whitespace-nowrap border-r border-white/20 px-6 py-6 text-center">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                            badge.className
                          )}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {actions.canInvite && (
                            <button
                              type="button"
                              onClick={() =>
                                setInviteTarget({ coachId: coach.coachId, name, avatar: coach.profileImage })
                              }
                              className={cn(actionButton, "border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground")}
                            >
                              <IconSend size={14} /> Invite to academy
                            </button>
                          )}
                          {actions.canCancelInvite && (
                            <button
                              type="button"
                              disabled={Boolean(busyKey)}
                              onClick={() => handleWithdraw(coach)}
                              className={cn(actionButton, "border-white/15 bg-white/5 text-white/80 hover:bg-white/10")}
                            >
                              {busyKey === `withdraw:${coach.coachId}` ? (
                                <IconLoader2 size={14} className="animate-spin" />
                              ) : (
                                <IconX size={14} />
                              )}
                              Withdraw invite
                            </button>
                          )}
                          {actions.canRespond && (
                            <>
                              <button
                                type="button"
                                disabled={Boolean(busyKey)}
                                onClick={() => handleRespond(coach, "APPROVE")}
                                className={cn(actionButton, "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20")}
                              >
                                {busyKey === `APPROVE:${coach.coachId}` ? (
                                  <IconLoader2 size={14} className="animate-spin" />
                                ) : (
                                  <IconCheck size={14} />
                                )}
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={Boolean(busyKey)}
                                onClick={() => handleRespond(coach, "REJECT")}
                                className={cn(actionButton, "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20")}
                              >
                                {busyKey === `REJECT:${coach.coachId}` ? (
                                  <IconLoader2 size={14} className="animate-spin" />
                                ) : (
                                  <IconX size={14} />
                                )}
                                Reject
                              </button>
                            </>
                          )}
                          {actions.canRemove && (
                            <button
                              type="button"
                              onClick={() => setCoachToRemove({ id: coach.coachId, name })}
                              className={cn(actionButton, "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white")}
                            >
                              <IconUserMinus size={14} /> Remove from academy
                            </button>
                          )}
                          {!hasAction && <span className="text-sm text-white/40">—</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 text-xs text-white/60">
            <span>
              Page {page} of {totalPages}
              {data?.meta?.total !== undefined && ` • ${data.meta.total} coaches`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {inviteTarget !== null && (
        <InviteCoachModal coach={inviteTarget === "new" ? null : inviteTarget} onClose={() => setInviteTarget(null)} />
      )}
      <RemoveCoachFromAcademyDialog coach={coachToRemove} onClose={() => setCoachToRemove(null)} onRemoved={onCoachRemoved} />
    </div>
  );
};

export default AcademyCoaches;
