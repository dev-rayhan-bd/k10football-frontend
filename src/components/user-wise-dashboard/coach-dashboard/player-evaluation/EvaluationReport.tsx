"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, Download, FileX, Loader2, RefreshCw } from "lucide-react";
import { getEvaluationApiError, useGetCoachEvaluationPdfQuery } from "@/redux/features/evaluation/evaluationApi";
import { type ICoachEvaluationRow, type IEvaluationPdfData } from "@/types/evaluation.type";
import { EVALUATION_PAGE_IDS, EvaluationPages } from "./EvaluationPages";
import { generateEvaluationPdf } from "./generateEvaluationPdf";
import { getReportId, personAvatar, personField, personName } from "./utils";

const PAGE_IDS = EVALUATION_PAGE_IDS;

interface EvaluationReportProps {
  row: ICoachEvaluationRow;
  onClose: () => void;
}

export const EvaluationReport = ({ row, onClose }: EvaluationReportProps) => {
  const reportId = getReportId(row);
  const { data, isLoading, isFetching, error, refetch } = useGetCoachEvaluationPdfQuery(reportId);
  const [isDownloading, setIsDownloading] = useState(false);

  const report = data?.data;
  const errorInfo = error ? getEvaluationApiError(error, "Failed to load evaluation report") : null;
  const notSubmitted = errorInfo?.status === 404;

  const playerName = personName(report?.player) || row.name || null;

  const handleDownload = async () => {
    if (!report || isDownloading) return;
    setIsDownloading(true);
    try {
      const safeName = (playerName || "Player").replace(/\s+/g, "_");
      await generateEvaluationPdf(PAGE_IDS, `Evaluation_Report_${safeName}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs font-black uppercase tracking-widest text-white/60 transition-all hover:text-white"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
        {report && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E31B23] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(227,27,35,0.3)] transition-all hover:bg-[#ff2d35] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download as PDF
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/20 bg-[#0D0D0D] py-24 text-gray-500">
          <Loader2 size={32} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Loading report...</span>
        </div>
      ) : notSubmitted ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/20 bg-[#0D0D0D] py-16 text-center">
          <div className="mb-4 rounded-full bg-white/5 p-4 text-gray-600">
            <FileX size={40} />
          </div>
          <h3 className="mb-1 text-base font-bold text-white">No Report Yet</h3>
          <p className="text-xs text-gray-500">This evaluation has not been submitted yet, so there is no report to download.</p>
        </div>
      ) : errorInfo || !report ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/20 bg-[#0D0D0D] py-16 text-center">
          <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h3 className="mb-1 text-base font-bold text-white">Failed to Load Report</h3>
          <p className="mb-4 text-xs text-gray-500">{errorInfo?.message || "The report could not be loaded."}</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : undefined} /> Retry
          </button>
        </div>
      ) : (
        <EvaluationReportPages report={report} fallbackName={row.name} fallbackAvatar={row.avatar} />
      )}
    </div>
  );
};

/** The read-only "Player Development Programme" pages for a submitted evaluation (coach, player, academy). */
export const EvaluationReportPages = ({
  report,
  fallbackName,
  fallbackAvatar,
}: {
  report: IEvaluationPdfData;
  fallbackName?: string | null;
  fallbackAvatar?: string | null;
}) => {
  const player = report.player;
  const playerName = personName(player) || fallbackName || null;
  const tier = personField(player, "tierBadge") || personField(player, "tier");

  return (
    <EvaluationPages
      date={report.formattedDate}
      subtitle={[tier, report.cycle].filter(Boolean).join(" · ")}
      playerName={playerName}
      avatar={personAvatar(player) || fallbackAvatar}
      infoItems={[
        { label: "Player Name", value: playerName, accent: true },
        { label: "Age", value: personField(player, "age") },
        { label: "Position", value: personField(player, "position") },
        { label: "Academy", value: report.academy?.name, accent: true },
        { label: "Coach", value: personName(report.coach) },
      ]}
      scoreItems={[
        { label: "Overall Rating", value: report.overallRating },
        { label: "Grade", value: report.grade },
        { label: "Technical", value: report.categoryScores?.technical },
        { label: "Physical", value: report.categoryScores?.physical },
        { label: "Mental", value: report.categoryScores?.mental },
        { label: "Next Evaluation", value: report.formattedNextEvaluationDue },
      ]}
      grades={report.breakdown ?? {}}
      coachFeedback={report.coachFeedback}
    />
  );
};