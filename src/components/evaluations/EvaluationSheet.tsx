"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  IconActivity,
  IconAlertCircle,
  IconBuilding,
  IconCalendar,
  IconClock,
  IconDownload,
  IconFlame,
  IconLoader2,
  IconMessage,
  IconTarget,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { domPagesToPdf } from "@/lib/pdf/domToPdf";
import {
  getEvaluationApiError,
  useGetAcademyEvaluationPdfQuery,
  useGetCoachEvaluationPdfQuery,
  useGetEvaluationSheetQuery,
} from "@/redux/features/evaluation/evaluationApi";
import type { IEvaluationSheetSkill } from "@/types/evaluation.type";
import { EvaluationGradeBadge, EvaluationStatusBadge } from "./EvaluationBadges";
import { display, initials, refAvatar, refName, refField } from "./evaluationFormat";

export interface EvaluationSheetProps {
  /** Evaluation id (or, academy only, a player id → latest evaluation). */
  evaluationId: string;
  /**
   * Which PDF route decides whether Download is available:
   * academy → GET /academies/player-evaluations/:id/pdf, player → GET /coaches/me/player-evaluations/:id/pdf.
   */
  pdfSource: "academy" | "player";
  /** Rendered on the left of the action bar (e.g. a back button). */
  leading?: ReactNode;
  /** Start the PDF download as soon as the sheet and PDF data are ready (table "Download PDF"). */
  autoDownload?: boolean;
}

const cardClass = "bg-[#111111] border border-white/20 rounded-3xl";

const SECTIONS = [
  { key: "technical", title: "Technical", icon: IconTarget },
  { key: "mental", title: "Mental", icon: IconActivity },
  { key: "physical", title: "Physical", icon: IconFlame },
] as const;

const GRADE_VALUES = ["EXCELLENT", "GOOD", "IMPROVEMENT"];
/** `rating` is the grade (EXCELLENT | GOOD | IMPROVEMENT | null); older payloads put it in `grade`. */
const gradeOf = (item: IEvaluationSheetSkill) => {
  for (const value of [item.grade, item.rating]) {
    if (typeof value === "string" && GRADE_VALUES.includes(value.toUpperCase())) return value.toUpperCase();
  }
  return null;
};
const numericRatingOf = (item: IEvaluationSheetSkill) => (typeof item.rating === "number" ? item.rating : null);

const SkillList = ({ skills }: { skills?: IEvaluationSheetSkill[] }) => {
  if (!skills || skills.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">{display(null)}</p>;
  }
  return (
    <ul className="flex flex-col">
      {skills.map((item, idx) => (
        <li
          key={`${item.skill}-${idx}`}
          className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0"
        >
          <span className="text-sm font-semibold text-white/80 truncate">{display(item.skill)}</span>
          <span className="flex items-center gap-2 shrink-0">
            {gradeOf(item) ? (
              <EvaluationGradeBadge grade={gradeOf(item)} />
            ) : (
              <span className="text-xs font-semibold italic text-muted-foreground">Not graded</span>
            )}
            {numericRatingOf(item) !== null && (
              <span className="text-sm font-black font-orbitron text-white tabular-nums">{numericRatingOf(item)}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
};

const MetaItem = ({ icon: Icon, label, value }: { icon: typeof IconCalendar; label: string; value: unknown }) => (
  <div className="flex items-start gap-3 min-w-0">
    <div className="size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
      <Icon className="size-4 text-muted-foreground" />
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-white truncate">{display(value)}</span>
    </div>
  </div>
);

export const EvaluationSheet = ({ evaluationId, pdfSource, leading, autoDownload }: EvaluationSheetProps) => {
  const autoDownloadStartedRef = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetEvaluationSheetQuery(evaluationId, {
    skip: !evaluationId,
  });

  // The PDF route answers 404 when nothing has been submitted → hide Download.
  const academyPdf = useGetAcademyEvaluationPdfQuery(evaluationId, {
    skip: !evaluationId || pdfSource !== "academy",
  });
  const playerPdf = useGetCoachEvaluationPdfQuery(evaluationId, {
    skip: !evaluationId || pdfSource !== "player",
  });
  const pdf = pdfSource === "academy" ? academyPdf : playerPdf;
  const pdfData = pdf.data?.success ? pdf.data.data : undefined;
  const canDownload = Boolean(pdfData) && !pdf.isError;

  const sheet = data?.data;
  const playerName = refName(sheet?.player);
  const coachName = typeof sheet?.coach === "string" ? null : refName(sheet?.coach);
  const academyName = typeof sheet?.academy === "string" ? null : sheet?.academy?.name;
  const position = refField(sheet?.player, "position");
  const categoryScores = pdfData?.categoryScores;

  const handleDownload = async () => {
    if (!sheetRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading("Generating PDF...");
    try {
      const safeName = (playerName || "player").replace(/[^\w-]+/g, "_");
      await domPagesToPdf({
        pages: [sheetRef.current],
        fileName: `Evaluation_${safeName}${sheet?.formattedDate ? `_${sheet.formattedDate.replace(/[^\w-]+/g, "_")}` : ""}.pdf`,
      });
      toast.success("PDF downloaded", { id: toastId });
    } catch (err) {
      console.error("Evaluation PDF generation failed:", err);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!autoDownload || autoDownloadStartedRef.current || !canDownload || !sheet) return;
    autoDownloadStartedRef.current = true;
    // Let the sheet paint (fonts/images) before capturing it.
    const timer = setTimeout(() => void handleDownload(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, canDownload, sheet]);


  if (!evaluationId) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <IconLoader2 className="size-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Loading evaluation...</p>
      </div>
    );
  }

  if (isError || !sheet) {
    const { status, message } = getEvaluationApiError(error, "The evaluation could not be loaded.");
    return (
      <div className="flex flex-col gap-6">
        {leading && <div>{leading}</div>}
        <div className={cn(cardClass, "flex flex-col items-center justify-center gap-4 text-center p-10")}>
          <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <IconAlertCircle className="size-7 text-destructive" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-white font-orbitron uppercase">
              {status === 404 ? "No evaluation submitted" : "Evaluation unavailable"}
            </h2>
            <p className="text-muted-foreground text-sm">{message}</p>
          </div>
          {status !== 404 && (
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>{leading}</div>
        {canDownload && (
          <Button onClick={handleDownload} disabled={isDownloading} className="font-black uppercase tracking-wider">
            {isDownloading ? <IconLoader2 className="animate-spin" /> : <IconDownload />}
            Download PDF
          </Button>
        )}
      </div>

      <div ref={sheetRef} className="flex flex-col gap-6 bg-[#0a0a0a]">
        {/* Header */}
        <div className={cn(cardClass, "p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-6")}>
          <div className="flex items-center gap-5 min-w-0">
            <Avatar className="size-20 md:size-24 rounded-2xl border-2 border-white/20">
              <AvatarImage src={refAvatar(sheet.player) || undefined} alt={playerName || ""} className="object-cover" />
              <AvatarFallback className="rounded-2xl text-xl font-black">{initials(playerName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <EvaluationStatusBadge status={sheet.status} />
                <EvaluationGradeBadge grade={sheet.grade} />
                {position && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                    {position}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white font-orbitron uppercase tracking-tight truncate">
                {display(playerName)}
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-1 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall Rating</span>
            <span className="text-4xl md:text-5xl font-black font-orbitron text-white">
              {display(sheet.overallRatingFormatted)}
            </span>
            {sheet.grade && (
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grade: {sheet.grade}</span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className={cn(cardClass, "p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5")}>
          <MetaItem icon={IconCalendar} label="Evaluated" value={sheet.formattedDate} />
          <MetaItem icon={IconClock} label="Next evaluation due" value={sheet.formattedNextEvaluationDue} />
          <MetaItem icon={IconUser} label="Coach" value={coachName} />
          <MetaItem icon={IconBuilding} label="Academy" value={academyName} />
        </div>

        {/* Category scores (from the PDF payload, /20) */}
        {categoryScores && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SECTIONS.map(({ key, title, icon: Icon }) => (
              <div key={key} className={cn(cardClass, "p-5 flex items-center gap-4")}>
                <div className="size-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
                  <span className="text-2xl font-black font-orbitron text-white">
                    {display(categoryScores[key])}
                    {categoryScores[key] !== null && categoryScores[key] !== undefined && (
                      <span className="text-xs text-muted-foreground font-normal"> / 20</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {String(sheet.status || "").toUpperCase() === "NEED_EVALUATION" && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-300">
            Awaiting coach — this evaluation has been requested but not submitted yet.
          </div>
        )}

        {/* Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SECTIONS.map(({ key, title, icon: Icon }) => (
            <div key={key} className={cn(cardClass, "p-6 flex flex-col gap-4")}>
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="text-lg font-black text-white font-orbitron uppercase">{title}</h3>
              </div>
              <SkillList skills={sheet.sections?.[key]} />
            </div>
          ))}
        </div>

        {/* Coach feedback */}
        <div className={cn(cardClass, "p-6 md:p-8 flex flex-col gap-4")}>
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <IconMessage className="size-5 text-primary" />
            </div>
            <h3 className="text-lg font-black text-white font-orbitron uppercase">Coach Feedback</h3>
          </div>
          <p className="text-white/80 text-sm md:text-base leading-relaxed whitespace-pre-line">
            {display(sheet.coachFeedback)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EvaluationSheet;
