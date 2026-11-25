"use client";

import { useState } from "react";
import { IconClipboardCheck, IconLoader2 } from "@tabler/icons-react";

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

/** Player's own submitted evaluations (newest first) with the selected sheet alongside. */
const PlayerEvaluations = () => {
  const { data, isLoading, isError, error, refetch } = useGetMyEvaluationHistoryQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
          <p className="text-muted-foreground text-sm font-bold">No evaluations have been submitted for you yet.</p>
        </div>
      ) : (
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
                    <span className="text-sm font-black font-orbitron text-white">{display(item.overallRating)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <EvaluationStatusBadge status={item.status} />
                    <EvaluationGradeBadge grade={item.grade} />
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
      )}
    </div>
  );
};

export default PlayerEvaluations;
