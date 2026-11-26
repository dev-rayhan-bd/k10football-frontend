import type { ICoachEvaluationRow, EvaluationGrade, IEvaluationPersonRef } from "@/types/evaluation.type";
import { EVALUATION_GRADES } from "@/types/evaluation.type";

export const PLAYER_PLACEHOLDER_IMG = "/placeholder_img.jpg";
export const EMPTY = "—";

/** Null / "" → "—". */
export const display = (value: unknown): string => {
  if (value === null || value === undefined) return EMPTY;
  const text = String(value).trim();
  return text ? text : EMPTY;
};

/** Display-only date formatting. Unparseable values are shown as given. */
export const formatDate = (value?: string | null): string | null => {
  if (!value || !String(value).trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const isStatus = (row: Pick<ICoachEvaluationRow, "status">, status: string) =>
  (row.status || "").toUpperCase() === status;

/**
 * Submit `:playerId` — always the player _id. The backend attaches the academy's
 * open request automatically.
 */
export const getSubmitId = (row: ICoachEvaluationRow) => row._id;

/** B4 `:id` — the evaluation if known, otherwise the player (latest evaluation). */
export const getReportId = (row: ICoachEvaluationRow) => row.evaluationId || row._id;

export const toGrade = (value: unknown): EvaluationGrade | null => {
  if (typeof value !== "string") return null;
  const upper = value.trim().toUpperCase();
  return (EVALUATION_GRADES as string[]).includes(upper) ? (upper as EvaluationGrade) : null;
};

export const GRADE_LABELS: Record<EvaluationGrade, string> = {
  IMPROVEMENT: "Improvement",
  GOOD: "Good",
  EXCELLENT: "Excellent",
};

export const GRADE_LEGEND_LABELS: Record<EvaluationGrade, string> = {
  IMPROVEMENT: "Area For Improvement",
  GOOD: "Good",
  EXCELLENT: "Excellent",
};

/** Inline hex colours: html2canvas needs plain colours for the printable report. */
export const GRADE_COLORS: Record<EvaluationGrade, { on: string; off: string }> = {
  IMPROVEMENT: { on: "#2563EB", off: "#DBEAFE" },
  GOOD: { on: "#EAB308", off: "#FEF9C3" },
  EXCELLENT: { on: "#16A34A", off: "#DCFCE7" },
};

const str = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : typeof value === "number" ? String(value) : null;

export const personName = (ref?: IEvaluationPersonRef | null) => str(ref?.name) || str(ref?.fullName);
export const personAvatar = (ref?: IEvaluationPersonRef | null) => str(ref?.avatar) || str(ref?.profileImage);
export const personField = (ref: IEvaluationPersonRef | null | undefined, key: string) =>
  ref ? str(ref[key]) : null;
