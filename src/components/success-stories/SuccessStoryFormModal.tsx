"use client";

import React, { useId, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconFileText,
  IconLoader2,
  IconTrophy,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  useAddSuccessStoryMutation,
  useGetSuccessStoriesMetaQuery,
  useGetSuccessStoryByIdQuery,
  useUpdateSuccessStoryMutation,
} from "@/redux/features/academy/academyApi";
import type { ISuccessStoriesMeta, ISuccessStoryItem } from "@/types/academy.type";
import { cn } from "@/lib/utils";
import { APPROVED_EDIT_WARNING, getSuccessStoryApiError, isStatus, storyPhotoUrl } from "./successStoryUtils";

type FieldName = "storyTitle" | "category" | "playerName" | "position" | "currentAcademy" | "date" | "storyContent";
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName | "photo", string>>;

const FIELD_NAMES: FieldName[] = ["storyTitle", "category", "playerName", "position", "currentAcademy", "date", "storyContent"];

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const valuesFromStory = (story: ISuccessStoryItem): FormValues => ({
  storyTitle: story.storyTitle || "",
  category: story.category || "",
  playerName: story.playerName || "",
  position: story.position || "",
  currentAcademy: story.currentAcademy || "",
  date: story.formattedDate || (story.date ? story.date.split("T")[0] : ""),
  storyContent: story.storyContent || "",
});

/** Keep a stored value selectable even if it's no longer in the meta list. */
const withCurrent = (options: string[], current: string) =>
  current && !options.includes(current) ? [current, ...options] : options;

const inputClass = (hasError?: boolean) =>
  cn(
    "w-full rounded-xl border bg-[#161a18] py-3.5 pl-10 pr-4 text-sm font-medium text-white shadow-inner transition-all placeholder:text-zinc-500 focus:outline-none",
    hasError
      ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
  );

const Field = ({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-200">
      <span>{label}</span>
      {required ? <span className="font-black text-primary">*</span> : hint}
    </label>
    {children}
    {error && (
      <p className="mt-1 flex items-center gap-1.5 text-xs font-bold tracking-wide text-destructive">
        <IconAlertCircle size={14} className="shrink-0" />
        <span>{error}</span>
      </p>
    )}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 pt-1">
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full bg-primary" />
      <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">{children}</h3>
    </div>
    <div className="h-px flex-1 bg-linear-to-r from-primary/30 via-white/10 to-transparent" />
  </div>
);

interface SuccessStoryFormModalProps {
  isOpen: boolean;
  /** null → create; otherwise the story to edit (prefilled from GET /:id). */
  storyId: string | null;
  onClose: () => void;
}

export const SuccessStoryFormModal = ({ isOpen, storyId, onClose }: SuccessStoryFormModalProps) => {
  const { data: metaResponse, isLoading: isMetaLoading } = useGetSuccessStoriesMetaQuery(undefined, { skip: !isOpen });
  const {
    data: storyResponse,
    isLoading: isStoryLoading,
    error: storyError,
  } = useGetSuccessStoryByIdQuery(storyId ?? "", { skip: !isOpen || !storyId, refetchOnMountOrArgChange: true });

  if (!isOpen) return null;

  const title = storyId ? "Edit Success Story" : "Add Success Story";
  const story = storyId ? storyResponse?.data : undefined;

  if (isMetaLoading || (storyId && isStoryLoading)) {
    return (
      <DashboardModal isOpen onClose={onClose} title={title} maxWidth="max-w-3xl">
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-400">
          <IconLoader2 size={28} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
        </div>
      </DashboardModal>
    );
  }

  if (storyId && (storyError || !story)) {
    const { message } = getSuccessStoryApiError(storyError, "This story could not be loaded.");
    return (
      <DashboardModal isOpen onClose={onClose} title={title} maxWidth="max-w-3xl">
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <IconAlertCircle size={32} className="text-destructive" />
          <p className="text-sm font-bold text-white">{message}</p>
        </div>
      </DashboardModal>
    );
  }

  return (
    <SuccessStoryForm
      key={story ? `${story._id}-${story.updatedAt ?? ""}` : "new"}
      story={story}
      meta={metaResponse?.data}
      onClose={onClose}
    />
  );
};

const SuccessStoryForm = ({
  story,
  meta,
  onClose,
}: {
  story?: ISuccessStoryItem;
  meta?: ISuccessStoriesMeta;
  onClose: () => void;
}) => {
  const fileInputId = useId();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEdit = Boolean(story);

  const [initialValues] = useState<FormValues>(() =>
    story
      ? valuesFromStory(story)
      : {
          storyTitle: "",
          category: "",
          playerName: "",
          position: "",
          currentAcademy: meta?.currentAcademy || "",
          date: todayIso(),
          storyContent: "",
        }
  );
  const [values, setValues] = useState<FormValues>(initialValues);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);
  const [approvedEditConfirmed, setApprovedEditConfirmed] = useState(!isStatus(story, "APPROVED"));

  const [addSuccessStory, { isLoading: isAdding }] = useAddSuccessStoryMutation();
  const [updateSuccessStory, { isLoading: isUpdating }] = useUpdateSuccessStoryMutation();
  const isSaving = isAdding || isUpdating;

  const categories = withCurrent(meta?.categories ?? [], values.category);
  const positions = withCurrent(meta?.positions ?? [], values.position);
  const existingPhoto = story?.photo ? storyPhotoUrl(story) : null;
  const shownPhoto = photoPreview || existingPhoto;

  const handleClose = () => {
    if (isSaving) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    onClose();
  };

  const setField = (name: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setField(e.target.name as FieldName, e.target.value);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "Only image files are allowed" }));
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const clearNewPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const next: FormErrors = {};
    if (values.storyTitle.trim().length < 2) next.storyTitle = "Story title must be at least 2 characters";
    if (!values.category.trim()) next.category = "Please select a category";
    if (photoFile && !photoFile.type.startsWith("image/")) next.photo = "Only image files are allowed";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isSaving || !validate()) return;

    const formData = new FormData();
    let changedCount = 0;
    for (const name of FIELD_NAMES) {
      const value = values[name].trim();
      if (isEdit) {
        // PATCH: only the fields that changed.
        if (value === initialValues[name].trim()) continue;
      } else if (!value) {
        continue;
      }
      formData.append(name, value);
      changedCount++;
    }
    if (photoFile) {
      formData.append("photo", photoFile);
      changedCount++;
    }

    if (isEdit && changedCount === 0) {
      if (isStatus(story, "PENDING")) {
        toast.info("No changes to save");
        return;
      }
      // Rejected / approved story saved as-is: still PATCH so the backend re-submits it as PENDING.
      // Send the (unchanged) title so the multipart body isn't empty.
      formData.append("storyTitle", values.storyTitle.trim());
    }

    try {
      if (story) {
        const res = await updateSuccessStory({ storyId: story._id, formData }).unwrap();
        const newStatus = String(res?.data?.status || "").toUpperCase();
        if (newStatus && newStatus !== "PENDING") {
          toast.warning(`The server saved the story but its status is still ${newStatus}, so it was not re-submitted for review.`);
        }
      } else {
        await addSuccessStory(formData).unwrap();
      }
      // Success toast (with the backend message) + list refetch happen in the API slice.
      handleClose();
    } catch (err) {
      // The API slice already toasts response.message; map 400 errorSources onto the fields.
      const { fieldErrors } = getSuccessStoryApiError(err, "Failed to save success story");
      if (Object.keys(fieldErrors).length > 0) setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }
  };

  const title = isEdit ? (isStatus(story, "REJECTED") ? "Edit & Resubmit Story" : "Edit Success Story") : "Add Success Story";

  if (!approvedEditConfirmed) {
    return (
      <DashboardModal
        isOpen
        onClose={handleClose}
        title={title}
        maxWidth="max-w-md"
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              className="w-full cursor-pointer rounded-xl border border-white/20 py-3 text-xs font-bold text-zinc-300 transition-all hover:bg-white/5 hover:text-white sm:flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setApprovedEditConfirmed(true)}
              className="w-full cursor-pointer rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 sm:flex-1"
            >
              Continue Editing
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <IconAlertTriangle size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-white">This story is approved</p>
            <p className="text-xs text-zinc-400">{APPROVED_EDIT_WARNING}</p>
          </div>
        </div>
      </DashboardModal>
    );
  }

  return (
    <DashboardModal
      isOpen
      onClose={handleClose}
      title={title}
      subtitle={
        isEdit
          ? "Saving re-submits the story for admin approval"
          : "Share your academy's latest achievement — an admin reviews it before it goes public"
      }
      showBackButton
      maxWidth="max-w-3xl"
      footer={
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleClose}
            className="w-full min-w-0 cursor-pointer rounded-xl border border-white/20 py-3.5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50 sm:flex-1 sm:py-4 sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isSaving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-primary/95 disabled:opacity-50 sm:flex-2 sm:py-4 sm:text-sm"
          >
            {isSaving ? <IconLoader2 size={18} className="animate-spin" /> : <IconCheck size={18} className="stroke-3" />}
            <span>
              {isSaving ? "Submitting..." : isEdit ? "Save & Resubmit for Approval" : "Submit for Approval"}
            </span>
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {isStatus(story, "REJECTED") && story?.rejectionReason && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <IconAlertCircle size={18} className="mt-0.5 shrink-0 text-destructive" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Rejection reason</p>
              <p className="whitespace-pre-line text-xs text-zinc-300">{story.rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <SectionTitle>Story Overview</SectionTitle>
          <Field label="Story Title" required error={errors.storyTitle}>
            <div className="relative">
              <IconFileText className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                name="storyTitle"
                value={values.storyTitle}
                onChange={handleInputChange}
                placeholder="e.g. U17 Championship Triumph"
                className={inputClass(Boolean(errors.storyTitle))}
              />
            </div>
          </Field>
          <Field label="Category" required error={errors.category}>
            <div className="relative">
              <IconTrophy className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <select
                name="category"
                value={values.category}
                onChange={handleInputChange}
                className={cn(inputClass(Boolean(errors.category)), "cursor-pointer appearance-none pr-10", !values.category && "text-zinc-500")}
              >
                <option value="" className="bg-[#161a18] text-zinc-500">
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#161a18] text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle>Participant &amp; Academy Details</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Player Name" error={errors.playerName}>
              <div className="relative">
                <IconUser className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  name="playerName"
                  value={values.playerName}
                  onChange={handleInputChange}
                  placeholder="e.g. Marcus Silva"
                  className={inputClass(Boolean(errors.playerName))}
                />
              </div>
            </Field>
            <Field label="Position" error={errors.position}>
              <div className="relative">
                <IconUser className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <select
                  name="position"
                  value={values.position}
                  onChange={handleInputChange}
                  className={cn(inputClass(Boolean(errors.position)), "cursor-pointer appearance-none pr-10", !values.position && "text-zinc-500")}
                >
                  <option value="" className="bg-[#161a18] text-zinc-500">
                    No position
                  </option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos} className="bg-[#161a18] text-white">
                      {pos}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </Field>
            <Field label="Current Academy" error={errors.currentAcademy}>
              <div className="relative">
                <IconBuildingSkyscraper className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  name="currentAcademy"
                  value={values.currentAcademy}
                  onChange={handleInputChange}
                  placeholder="Academy name"
                  className={inputClass(Boolean(errors.currentAcademy))}
                />
              </div>
            </Field>
            <Field label="Date" error={errors.date}>
              <div className="relative">
                <IconCalendar className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="date"
                  name="date"
                  value={values.date}
                  onChange={handleInputChange}
                  className={cn(inputClass(Boolean(errors.date)), "cursor-pointer scheme-dark")}
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle>Media &amp; Story Content</SectionTitle>
          <Field label="Story Photo" error={errors.photo}>
            {shownPhoto ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/20 bg-black/60 sm:aspect-21/9">
                <Image src={shownPhoto} alt="Story preview" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/85 via-black/30 to-transparent p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-xs font-bold text-white">{photoFile?.name || "Current story photo"}</p>
                      <p className="text-[10px] text-zinc-400">
                        {photoFile ? `${(photoFile.size / 1024 / 1024).toFixed(2)} MB` : "Kept unless you choose a new one"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-lg border border-white/20 bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/30"
                      >
                        Change
                      </button>
                      {photoFile && (
                        <button
                          type="button"
                          onClick={clearNewPhoto}
                          className="cursor-pointer rounded-lg border border-white/20 bg-black/40 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-black/60"
                        >
                          {existingPhoto ? "Undo" : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "group flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 transition-all sm:aspect-21/9",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : errors.photo
                      ? "border-destructive/80 bg-destructive/5"
                      : "border-white/20 bg-[#161a18]/70 hover:border-primary/50 hover:bg-[#161a18]"
                )}
              >
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 transition-all group-hover:text-primary sm:size-14">
                  <IconUpload size={24} />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-xs font-bold text-white sm:text-sm">Click to upload or drag &amp; drop a photo</p>
                  <p className="text-[10px] text-zinc-500 sm:text-xs">Images only (PNG, JPG, WEBP…)</p>
                </div>
              </div>
            )}
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </Field>

          <Field
            label="Story Content"
            error={errors.storyContent}
            hint={<span className="font-mono text-[10px] font-normal text-zinc-500">{values.storyContent.length} chars</span>}
          >
            <textarea
              name="storyContent"
              value={values.storyContent}
              onChange={handleInputChange}
              placeholder="Tell the full story of this achievement..."
              className={cn(inputClass(Boolean(errors.storyContent)), "h-36 resize-none p-4 leading-relaxed sm:h-44")}
            />
          </Field>
        </div>
      </form>
    </DashboardModal>
  );
};
