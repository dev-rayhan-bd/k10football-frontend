"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getEvaluationApiError,
  useGetCoachEvaluationDetailQuery,
  useSubmitCoachEvaluationMutation,
} from "@/redux/features/evaluation/evaluationApi";
import {
  EVALUATION_SKILLS,
  type EvaluationGrade,
  type EvaluationSkillGroup,
  type ICoachEvaluationRow,
  type ISubmitCoachEvaluationPayload,
} from "@/types/evaluation.type";
import { EVALUATION_PAGE_IDS, EvaluationPages, type GradeSheet } from "./EvaluationPages";
import { generateEvaluationPdf } from "./generateEvaluationPdf";
import { formatDate, getSubmitId, isStatus } from "./utils";

const GROUPS = Object.keys(EVALUATION_SKILLS) as EvaluationSkillGroup[];

const EMPTY_SHEET: GradeSheet = { techniques: {}, characteristics: {}, physical: {} };

interface EvaluationSheetProps {
  row: ICoachEvaluationRow;
  onClose: () => void;
}

export const EvaluationSheet = ({ row, onClose }: EvaluationSheetProps) => {
  const submitId = getSubmitId(row);
  const [grades, setGrades] = useState<GradeSheet>(EMPTY_SHEET);
  const [coachFeedback, setCoachFeedback] = useState("");
  const [notes, setNotes] = useState("");
  // Display-only date on the sheet header (the server sets the real evaluation date).
  const [todayLabel] = useState(() => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));

  const { data: detailResponse } = useGetCoachEvaluationDetailQuery(submitId);
  const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitCoachEvaluationMutation();

  const detailPlayer = detailResponse?.data?.player;
  const previous = detailResponse?.data?.evaluation;

  const gradedCount = useMemo(
    () => GROUPS.reduce((sum, group) => sum + Object.values(grades[group]).filter(Boolean).length, 0),
    [grades]
  );
  const totalSkills = GROUPS.reduce((sum, group) => sum + EVALUATION_SKILLS[group].length, 0);

  const setGrade = (group: EvaluationSkillGroup, key: string, grade: EvaluationGrade) => {
    setGrades((prev) => {
      const next = { ...prev[group] };
      // Clicking the selected grade again clears it.
      if (next[key] === grade) delete next[key];
      else next[key] = grade;
      return { ...prev, [group]: next };
    });
  };

  const handleSubmit = async () => {
    if (gradedCount === 0 || isSubmitting) return;

    const payload: ISubmitCoachEvaluationPayload = { id: submitId };
    for (const group of GROUPS) {
      if (Object.keys(grades[group]).length > 0) payload[group] = grades[group];
    }
    if (coachFeedback.trim()) payload.coachFeedback = coachFeedback.trim();
    if (notes.trim()) payload.notes = notes.trim();

    try {
      const res = await submitEvaluation(payload).unwrap();
      const newRating = res?.data?.player?.overallRating;
      toast.success(
        typeof newRating === "number"
          ? `Evaluation submitted. New overall rating: ${newRating}`
          : res?.message || "Evaluation submitted."
      );
      onClose();
    } catch (err) {
      const { status, message } = getEvaluationApiError(err, "Failed to submit evaluation");
      if (status === 401) return; // handled globally
      if (status === 409) {
        toast.error(message, {
          description:
            "This request has already been submitted. To evaluate again, use Re-evaluate on the player from the Evaluated or Expired tab.",
        });
        return;
      }
      if (status === 402) {
        toast.error(message, { description: "An active coach subscription is required to submit evaluations." });
        return;
      }
      toast.error(message);
    }
  };

  const playerName = row.name || (typeof detailPlayer?.name === "string" ? detailPlayer.name : null);
  const avatar = row.avatar || (typeof detailPlayer?.avatar === "string" ? detailPlayer.avatar : "");
  const isReEvaluation = !isStatus(row, "PENDING");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await generateEvaluationPdf(EVALUATION_PAGE_IDS, `Evaluation_Report_${(playerName || "Player").replace(/\s+/g, "_")}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-xs font-black uppercase tracking-widest text-white/60 transition-all hover:text-white"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
        {row.requestedByAcademy && (
          <Badge variant="outline" className="border-[#E31B23]/40 text-[10px] font-black uppercase tracking-widest text-red-400">
            Requested by academy
          </Badge>
        )}
        {isReEvaluation && (
          <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
            Re-evaluation
          </Badge>
        )}
      </div>

      <EvaluationPages
        date={todayLabel}
        subtitle={previous && typeof previous.overallRating === "number" ? `Previous overall rating: ${previous.overallRating}` : null}
        playerName={playerName}
        avatar={avatar}
        infoItems={[
          { label: "Player Name", value: playerName, accent: true },
          { label: "Age", value: detailPlayer?.age },
          { label: "Position", value: row.position },
          { label: "Academy", value: row.academy, accent: true },
        ]}
        scoreItems={[
          { label: "Current Rating", value: row.rating },
          { label: "Last Evaluated", value: formatDate(row.lastEvaluationDate) ?? "Never" },
          { label: "Next Due", value: formatDate(row.nextEvaluationDue) },
        ]}
        grades={grades}
        onGrade={setGrade}
        coachFeedback={coachFeedback}
        onCoachFeedbackChange={setCoachFeedback}
        notes={notes}
        onNotesChange={setNotes}
      />

      {/* Action Trigger Buttons */}
      <div className="mx-auto flex w-full max-w-212.5 flex-col items-stretch justify-center gap-4 border-t border-white/5 px-4 pt-6 sm:flex-row sm:items-center sm:px-0">
        <button
          type="button"
          onClick={onClose}
          className="flex w-full cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-white/60 transition-all hover:bg-white/10 hover:text-white sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E31B23]/30 bg-[#E31B23]/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#E31B23]/10 disabled:opacity-50 sm:w-auto"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download as PDF
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={gradedCount === 0 || isSubmitting}
          title={gradedCount === 0 ? "Grade at least one skill to submit" : undefined}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E31B23] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(227,27,35,0.3)] transition-all hover:bg-[#ff2d35] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          Submit Evaluation ({gradedCount}/{totalSkills})
        </button>
      </div>
    </div>
  );
};