"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconBell,
  IconChevronLeft,
  IconDownload,
  IconEye,
  IconRefresh,
  IconChevronRight,
  IconClipboardList,
  IconFileText,
  IconHourglass,
  IconLoader2,
  IconSearch,
  IconStar,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getEvaluationApiError,
  useGetAcademyEvaluationAnalyticsQuery,
  useGetAcademyEvaluationsDashboardQuery,
  useRemindEvaluationMutation,
} from "@/redux/features/evaluation/evaluationApi";
import type { AcademyEvaluationStatusFilter, IAcademyEvaluationAnalyticsRow } from "@/types/evaluation.type";
import { EvaluationStatusBadge } from "@/components/evaluations/EvaluationBadges";
import { DASH, display, formatDate, initials } from "@/components/evaluations/evaluationFormat";

import { SummaryCard } from "./player-evaluation/SummaryCard";
import { PlayerEvaluationSidebar } from "./player-evaluation/PlayerEvaluationSidebar";
import { RequestEvaluationModal, type RequestEvaluationPrefill } from "./player-evaluation/RequestEvaluationModal";

const STATUS_TABS: { value: AcademyEvaluationStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NEED_EVALUATION", label: "Need Evaluation" },
  { value: "EVALUATED", label: "Evaluated" },
  { value: "EXPIRED", label: "Expired" },
];

const LIMIT = 10;
export const EVALUATION_REQUESTS_PATH = "/dashboard/academy/management/evaluation-requests";

/** Id for the sheet route: evaluation id, else player id (latest evaluation). */
const sheetIdFor = (row: IAcademyEvaluationAnalyticsRow) =>
  row.evaluationId || row.playerId || row.player?._id || null;

const isAwaitingCoach = (row: IAcademyEvaluationAnalyticsRow) => row.status === "NEED_EVALUATION";

const ScoreCell = ({ value }: { value?: number | null }) => (
  <span className="tabular-nums">
    {display(value)}
    {value !== null && value !== undefined && <span className="text-muted-foreground font-normal">/20</span>}
  </span>
);

const VALID_STATUS_FILTERS: AcademyEvaluationStatusFilter[] = ["ALL", "NEED_EVALUATION", "EVALUATED", "EXPIRED"];

const PlayerEvaluation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialStatus = (() => {
    const param = searchParams?.get("status");
    if (param && VALID_STATUS_FILTERS.includes(param as AcademyEvaluationStatusFilter)) {
      return param as AcademyEvaluationStatusFilter;
    }
    return "ALL";
  })();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<AcademyEvaluationStatusFilter>(initialStatus);
  const [ageGroup, setAgeGroup] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const param = searchParams?.get("status");
    const nextStatus =
      param && VALID_STATUS_FILTERS.includes(param as AcademyEvaluationStatusFilter)
        ? (param as AcademyEvaluationStatusFilter)
        : "ALL";
    setStatus(nextStatus);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetAcademyEvaluationAnalyticsQuery({
    searchTerm: debouncedSearch || undefined,
    ageGroup: ageGroup || undefined,
    status,
    page,
    limit: LIMIT,
  });

  const dashboard = data?.data;
  const metrics = dashboard?.metrics;
  const rows = useMemo(() => dashboard?.evaluations ?? [], [dashboard]);
  const meta = dashboard?.meta ?? data?.meta;

  // Age groups offered are the ones the API actually returned (plus the active one).
  const ageGroups = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.ageGroup && set.add(r.ageGroup));
    dashboard?.topPerformers?.forEach((p) => p.ageGroup && set.add(p.ageGroup));
    dashboard?.mostImproved?.forEach((p) => p.ageGroup && set.add(p.ageGroup));
    if (ageGroup) set.add(ageGroup);
    return [...set].sort();
  }, [rows, dashboard, ageGroup]);

  const basePath = (pathname || "/dashboard/academy/management/player-evaluation").replace(/\/$/, "");

  const openSheet = (row: IAcademyEvaluationAnalyticsRow, download = false) => {
    const id = sheetIdFor(row);
    if (!id || isAwaitingCoach(row)) return;
    router.push(`${basePath}/${id}${download ? "?download=1" : ""}`);
  };

  // Row actions: remind (open request), request again (expired).
  const [remindEvaluation] = useRemindEvaluationMutation();
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const handleRemind = async (row: IAcademyEvaluationAnalyticsRow) => {
    if (!row.evaluationId || remindingId) return;
    setRemindingId(row.evaluationId);
    try {
      await remindEvaluation(row.evaluationId).unwrap(); // toasts in the API slice
    } catch {
      // toasted in the API slice
    } finally {
      setRemindingId(null);
    }
  };

  const [requestPrefill, setRequestPrefill] = useState<RequestEvaluationPrefill | null>(null);
  const { data: requestsDashboard, isFetching: isRequestsFetching, refetch: refetchRequests } =
    useGetAcademyEvaluationsDashboardQuery(undefined, { skip: !requestPrefill });
  const requestAgain = (row: IAcademyEvaluationAnalyticsRow) =>
    setRequestPrefill({
      playerId: row.playerId || row.player?._id || null,
      playerName: row.player?.name ?? null,
      coachId: row.coach?._id ?? null,
      coachName: row.coach?.name ?? null,
    });

  const avgRating =
    metrics?.avgOverallRating === null || metrics?.avgOverallRating === undefined || metrics?.avgOverallRating === ""
      ? DASH
      : `${metrics.avgOverallRating}/10`;

  const apiError = isError ? getEvaluationApiError(error, "Failed to load evaluations") : null;
  const isNon2xxError = Boolean(
    isError &&
      (apiError?.status === undefined || apiError.status < 200 || apiError.status >= 300)
  );
  const errorMessage = isNon2xxError ? apiError?.message || "Failed to load evaluations" : null;

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            Player Evaluation
          </h1>
          <p className="text-muted-foreground font-medium mt-2 text-sm md:text-lg">
            Coach evaluations of your players
            {metrics?.evaluationCycleMonths ? ` · valid for ${metrics.evaluationCycleMonths} months` : ""}
          </p>
        </div>
        <Button asChild className="font-black uppercase tracking-wider">
          <Link href={EVALUATION_REQUESTS_PATH}>
            <IconClipboardList />
            Evaluation Requests
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <SummaryCard label="Avg. Overall Rating" value={isLoading ? DASH : avgRating} icon={IconStar} />
        <SummaryCard label="Improving Players" value={display(metrics?.improvingPlayers)} icon={IconTrendingUp} />
        <SummaryCard label="Evaluated this Month" value={display(metrics?.evaluatedThisMonth)} icon={IconFileText} />
        <SummaryCard label="Total Evaluations" value={display(metrics?.totalEvaluations)} icon={IconUsers} />
        <SummaryCard label="Open Requests" value={display(metrics?.openRequests)} icon={IconHourglass} />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 min-w-0">
              <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                className="bg-[#111111] border-white/10 h-12 rounded-xl pl-12 text-white font-medium"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              {isFetching && (
                <IconLoader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
              )}
            </div>
            <select
              aria-label="Age group"
              value={ageGroup}
              onChange={(e) => {
                setAgeGroup(e.target.value);
                setPage(1);
              }}
              className="bg-[#111111] border border-white/10 h-12 rounded-xl px-4 text-sm text-white font-medium md:w-48 cursor-pointer focus:outline-none"
            >
              <option value="">All age groups</option>
              {ageGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={status === tab.value ? "default" : "outline"}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className="uppercase tracking-wider text-xs font-bold rounded-full"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
              <h2 className="text-lg md:text-xl font-black text-white font-orbitron uppercase tracking-tight">Evaluations</h2>
              {meta?.total !== undefined && (
                <span className="text-xs font-bold text-muted-foreground bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  {meta.total}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <IconLoader2 className="size-8 text-primary animate-spin" />
              </div>
            ) : errorMessage ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
                <p className="text-destructive text-sm font-bold">{errorMessage}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 px-4">
                <IconFileText size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-bold text-sm">
                  {debouncedSearch || status !== "ALL" || ageGroup
                    ? "No evaluations match your filters."
                    : "No evaluations yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/10">
                      <th className="px-5 py-3 font-bold">Player</th>
                      <th className="px-3 py-3 font-bold">Coach</th>
                      <th className="px-3 py-3 font-bold">Age</th>
                      <th className="px-3 py-3 font-bold">Evaluated</th>
                      <th className="px-3 py-3 font-bold">Overall</th>
                      <th className="px-3 py-3 font-bold">Tech</th>
                      <th className="px-3 py-3 font-bold">Phys</th>
                      <th className="px-3 py-3 font-bold">Mental</th>
                      <th className="px-3 py-3 font-bold">Status</th>
                      <th className="px-3 py-3 font-bold">Next due</th>
                      <th className="px-3 py-3 font-bold text-right">Reminders</th>
                      <th className="px-5 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const awaiting = isAwaitingCoach(row);
                      const clickable = !awaiting && Boolean(sheetIdFor(row));
                      const playerName = row.player?.name;
                      const subtitle = [row.player?.position, row.player?.currentClub].filter(Boolean).join(" · ");
                      return (
                        <tr
                          key={row.evaluationId || row._id || `${row.playerId}-${idx}`}
                          onClick={clickable ? () => openSheet(row) : undefined}
                          className={cn(
                            "border-b border-white/5 last:border-0 text-white/90",
                            clickable && "cursor-pointer hover:bg-white/5 transition-colors"
                          )}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="size-9">
                                <AvatarImage src={row.player?.avatar || undefined} alt={playerName || ""} className="object-cover" />
                                <AvatarFallback className="text-xs font-bold">{initials(playerName)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-white truncate">{display(playerName)}</span>
                                <span className="text-[11px] text-muted-foreground truncate">{display(subtitle)}</span>
                                {row.player?.tierBadge && (
                                  <span className="text-[10px] font-bold uppercase text-primary truncate">{row.player.tierBadge}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">{display(row.coach?.name)}</span>
                              {row.coach?.title && (
                                <span className="text-[11px] text-muted-foreground truncate">{row.coach.title}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">{display(row.ageGroup)}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {awaiting ? (
                              <span className="text-muted-foreground italic">Awaiting coach</span>
                            ) : (
                              display(row.formattedDate)
                            )}
                          </td>
                          <td className="px-3 py-3 font-black font-orbitron whitespace-nowrap">
                            {awaiting ? DASH : display(row.overallRatingFormatted)}
                          </td>
                          <td className="px-3 py-3">
                            <ScoreCell value={row.scores?.technical} />
                          </td>
                          <td className="px-3 py-3">
                            <ScoreCell value={row.scores?.physical} />
                          </td>
                          <td className="px-3 py-3">
                            <ScoreCell value={row.scores?.mental} />
                          </td>
                          <td className="px-3 py-3">
                            <EvaluationStatusBadge status={row.status} />
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">{display(formatDate(row.nextEvaluationDue))}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{display(row.reminderCount)}</td>
                          <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {awaiting ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!row.evaluationId || remindingId === row.evaluationId}
                                  onClick={() => handleRemind(row)}
                                  className="text-[10px] font-bold uppercase tracking-wider"
                                >
                                  {remindingId === row.evaluationId ? <IconLoader2 className="animate-spin" /> : <IconBell />}
                                  Remind coach
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    size="icon-sm"
                                    variant="outline"
                                    title="View report"
                                    aria-label="View report"
                                    disabled={!clickable}
                                    onClick={() => openSheet(row)}
                                  >
                                    <IconEye />
                                  </Button>
                                  <Button
                                    size="icon-sm"
                                    variant="outline"
                                    title="Download PDF"
                                    aria-label="Download PDF"
                                    disabled={!clickable}
                                    onClick={() => openSheet(row, true)}
                                  >
                                    <IconDownload />
                                  </Button>
                                  {row.status === "EXPIRED" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => requestAgain(row)}
                                      className="text-[10px] font-bold uppercase tracking-wider"
                                    >
                                      <IconRefresh />
                                      Request again
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {meta && meta.totalPage > 1 && (
            <div className="flex justify-between items-center text-muted-foreground text-xs font-bold">
              <p>
                Page {meta.page} of {meta.totalPage} ({meta.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous page"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next page"
                  disabled={page >= meta.totalPage || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <IconChevronRight />
                </Button>
              </div>
            </div>
          )}
        </div>

        <PlayerEvaluationSidebar
          mostImproved={dashboard?.mostImproved}
          topPerformers={dashboard?.topPerformers}
          isLoading={isLoading}
        />
      </div>

      {requestPrefill && (
        <RequestEvaluationModal
          key={`${requestPrefill.playerId}-${requestPrefill.coachId}`}
          open
          onOpenChange={(open) => !open && setRequestPrefill(null)}
          prefill={requestPrefill}
          dueItems={requestsDashboard?.data?.due ?? []}
          onConflict={() => refetchRequests()}
          isRefreshing={isRequestsFetching}
        />
      )}
    </div>
  );
};

export default PlayerEvaluation;
