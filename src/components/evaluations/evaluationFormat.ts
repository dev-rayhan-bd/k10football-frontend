import type { IEvaluationPersonRef } from "@/types/evaluation.type";

/** Placeholder for any missing value (null / undefined / ""). */
export const DASH = "—";

export const display = (value: unknown): string => {
  if (value === null || value === undefined) return DASH;
  const text = String(value).trim();
  return text === "" ? DASH : text;
};

type Ref = IEvaluationPersonRef | { name?: string | null; [key: string]: unknown } | string | null | undefined;

/** Populated refs carry a name; a bare id string has nothing displayable. */
export const refName = (ref: Ref): string | null => {
  if (!ref || typeof ref === "string") return null;
  const r = ref as IEvaluationPersonRef;
  return r.name || r.fullName || null;
};

export const refAvatar = (ref: Ref): string | null => {
  if (!ref || typeof ref === "string") return null;
  const r = ref as IEvaluationPersonRef;
  return r.avatar || r.profileImage || null;
};

export const refId = (ref: Ref): string | null => {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  const r = ref as IEvaluationPersonRef;
  return r._id || r.id || null;
};

export const refField = (ref: Ref, key: string): string | null => {
  if (!ref || typeof ref === "string") return null;
  const value = (ref as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() !== "" ? value : null;
};

/** Display-only formatting of an ISO date coming from the API. */
export const formatDate = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const humanize = (value?: string | null): string => {
  if (!value) return DASH;
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const initials = (name?: string | null): string => {
  if (!name) return "?";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
};
