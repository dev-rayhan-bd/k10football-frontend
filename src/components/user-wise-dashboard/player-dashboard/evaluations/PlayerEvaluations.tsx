"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { IconAlertTriangle, IconCalendarDue, IconClipboardCheck, IconLoader2, IconStar } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EvaluationSheet } from "@/components/evaluations/EvaluationSheet";
import { EvaluationGradeBadge, EvaluationStatusBadge } from "@/components/evaluations/EvaluationBadges";
import { display, formatDate, refName } from "@/components/evaluations/evaluationFormat";
import {
  getEvaluationApiError,
  useGetMyEvaluationHistoryQuery,
} from "@/redux/features/evaluation/evaluationApi";
import type { IPlayerEvaluationHistoryItem } from "@/types/evaluation.type";

const academyNameOf = (item: IPlayerEvaluationHistoryItem) =>
  typeof item.academyId === "string" ? null : item.academyId?.name ?? null;

const dateOf = (item: IPlayerEvaluationHistoryItem) =>
  formatDate(item.evaluationDate || item.submittedAt || item.createdAt);

/** overallRating is 0-100, shown out of 10. */
const ratingOutOf10 = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? `${(value / 10).toFixed(1)}/10` : null;

/** API grade if present, else the shared rule: >=87.5 EXCELLENT, >=72.5 GOOD, otherwise NEEDS_IMPROVEMENT. */
const gradeOf = (item: IPlayerEvaluationHistoryItem) => {
  if (item.grade) return item.grade;
  const value = item.overallRating;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value >= 87.5 ? "EXCELLENT" : value >= 72.5 ? "GOOD" : "NEEDS_IMPROVEMENT";
};

/** Player's own submitted evaluations (newest first) with the selected sheet alongside. */
const PlayerEvaluations = () => {
  const { data, isLoading, isError, error, refetch } = useGetMyEvaluationHistoryQuery();
  // Notifications deep-link here with ?evaluationId= (PLAYER_EVALUATION_COMPLETED).
  const linkedId = useSearchParams()?.get("evaluationId") || null;
  const [selectedId, setSelectedId] = useState<string | null>(linkedId);

  const history = data?.data ?? [];
  // Default to the newest evaluation without syncing state in an effect.
  const activeId = selectedId && history.some((h) => h._id === selectedId) ? selectedId : history[0]?._id ?? null;

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
          My Evaluations
        </h1>
        <p className="text-muted-foreground font-medium mt-2 text-sm md:text-lg">
          Evaluations submitted by your academy coaches
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <IconLoader2 className="size-8 text-primary animate-spin" />
        </div>
      ) : isError ? (
        <div className="bg-[#111111] border border-white/20 rounded-3xl flex flex-col items-center gap-4 py-16 px-4 text-center">
          <p className="text-destructive text-sm font-bold">
            {getEvaluationApiError(error, "Failed to load your evaluations").message}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-[#111111] border border-white/20 rounded-3xl flex flex-col items-center gap-3 py-16 px-4 text-center">
          <IconClipboardCheck className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm font-bold">
            No evaluation yet. Your academy will request one from your coach.
          </p>
        </div>
      ) : (
        <>
        <LatestEvaluationCard item={history[0]} />
        <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
          <aside className="w-full xl:w-80 shrink-0 bg-[#111111] border border-white/20 rounded-3xl p-3 flex flex-col gap-2">
            <h2 className="px-3 pt-2 pb-1 text-xs font-black uppercase tracking-widest text-muted-foreground">
              History ({history.length})
            </h2>
            {history.map((item) => {
              const active = item._id === activeId;
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setSelectedId(item._id)}
                  className={cn(
                    "w-full text-left rounded-2xl border px-4 py-3 flex flex-col gap-2 transition-colors cursor-pointer",
                    active ? "border-primary bg-primary/10" : "border-white/10 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-white">{display(dateOf(item))}</span>
                    <span className="text-sm font-black font-orbitron text-white">{display(ratingOutOf10(item.overallRating))}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <EvaluationStatusBadge status={item.status} />
                    <EvaluationGradeBadge grade={gradeOf(item)} />
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {display(refName(item.coachId))} · {display(academyNameOf(item))}
                  </span>
                </button>
              );
            })}
          </aside>

          <div className="flex-1 min-w-0 w-full">
            {activeId && <EvaluationSheet key={activeId} evaluationId={activeId} pdfSource="player" />}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

/** Latest evaluation summary: rating, grade, coach, next due, plus the expired banner. */
const LatestEvaluationCard = ({ item }: { item?: IPlayerEvaluationHistoryItem }) => {
  if (!item) return null;
  const isExpired = String(item.status || "").toUpperCase() === "EXPIRED";
  return (
    <div className="flex flex-col gap-4">
      {isExpired && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm font-semibold text-destructive">
          <IconAlertTriangle className="size-5 shrink-0" />
          Your evaluation has expired. Ask your academy for a new one.
        </div>
      )}
      <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <IconStar className="size-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Latest rating</span>
            <span className="text-2xl font-black font-orbitron text-white">{display(ratingOutOf10(item.overallRating))}</span>
            <div className="flex flex-wrap gap-1.5">
              <EvaluationStatusBadge status={item.status} />
              <EvaluationGradeBadge grade={gradeOf(item)} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 justify-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coach</span>
          <span className="text-sm font-bold text-white">{display(refName(item.coachId))}</span>
          <span className="text-xs text-muted-foreground">Evaluated {display(dateOf(item))}</span>
        </div>
        <div className="flex items-center gap-3">
          <IconCalendarDue className="size-5 text-muted-foreground shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next evaluation due</span>
            <span className="text-sm font-bold text-white">{display(formatDate(item.nextEvaluationDue))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerEvaluations;
