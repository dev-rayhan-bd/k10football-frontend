import { resolveChatMediaUrl } from "@/components/chat/ChatAvatar";
import type { ISuccessStoryItem, SuccessStoryStatusFilter } from "@/types/academy.type";

export const STORY_PLACEHOLDER_IMG = "/placeholder_img.jpg";

export const SUCCESS_STORY_TABS: { value: SuccessStoryStatusFilter; label: string; countKey: "all" | "approved" | "pending" | "rejected" }[] = [
  { value: "ALL", label: "All", countKey: "all" },
  { value: "APPROVED", label: "Approved", countKey: "approved" },
  { value: "PENDING", label: "Pending", countKey: "pending" },
  { value: "REJECTED", label: "Rejected", countKey: "rejected" },
];

export const APPROVED_EDIT_WARNING = "Editing will hide this story until an admin re-approves it.";

/** Relative upload paths live on the API host. */
export const storyPhotoUrl = (story?: Pick<ISuccessStoryItem, "photo"> | null) =>
  resolveChatMediaUrl(story?.photo) || STORY_PLACEHOLDER_IMG;

export const storyDate = (story: Pick<ISuccessStoryItem, "formattedDate" | "date">) =>
  story.formattedDate || (story.date ? story.date.split("T")[0] : "—");

export const isStatus = (story: Pick<ISuccessStoryItem, "status"> | null | undefined, status: string) =>
  String(story?.status || "").toUpperCase() === status;

export interface SuccessStoryApiError {
  status?: number;
  message: string;
  /** errorSources[].path → message (400 validation). */
  fieldErrors: Record<string, string>;
}

export const getSuccessStoryApiError = (err: unknown, fallback: string): SuccessStoryApiError => {
  const e = err as { status?: number; data?: { message?: string; errorSources?: { path?: string; message?: string }[] } };
  const fieldErrors: Record<string, string> = {};
  for (const source of e?.data?.errorSources ?? []) {
    if (source?.path && source.message && !fieldErrors[source.path]) {
      // Paths may be nested ("data.storyTitle" / "body.storyTitle"); the last segment is the field.
      const key = String(source.path).split(".").pop() || String(source.path);
      fieldErrors[key] = source.message;
    }
  }
  return {
    status: typeof e?.status === "number" ? e.status : undefined,
    message: e?.data?.message || fallback,
    fieldErrors,
  };
};
