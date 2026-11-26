"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconAlertCircle, IconFileText, IconLoader2, IconPencil, IconTrash } from "@tabler/icons-react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { useDeleteSuccessStoryMutation } from "@/redux/features/academy/academyApi";
import type { ISuccessStoryItem } from "@/types/academy.type";
import { SuccessStoryFormModal } from "./SuccessStoryFormModal";
import { SuccessStoryStatusBadge } from "./SuccessStoryStatusBadge";
import { isStatus, storyDate, storyPhotoUrl, STORY_PLACEHOLDER_IMG } from "./successStoryUtils";

export const RejectionReason = ({ reason, className }: { reason?: string; className?: string }) =>
  reason ? (
    <div className={className}>
      <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 p-3">
        <IconAlertCircle size={14} className="mt-0.5 shrink-0 text-destructive" />
        <p className="min-w-0 text-[11px] leading-relaxed text-zinc-300">
          <span className="font-black uppercase tracking-wider text-destructive">Rejected: </span>
          {reason}
        </p>
      </div>
    </div>
  ) : null;

const ViewStoryModal = ({
  story,
  onClose,
  onEdit,
}: {
  story: ISuccessStoryItem;
  onClose: () => void;
  onEdit: (story: ISuccessStoryItem) => void;
}) => {
  const isRejected = isStatus(story, "REJECTED");
  return (
    <DashboardModal
      isOpen
      onClose={onClose}
      title="Story Details"
      subtitle={story.category}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex w-full justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/15"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onEdit(story)}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-primary/90"
          >
            <IconPencil size={14} /> {isRejected ? "Edit & Resubmit" : "Edit"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/15 bg-black/50 sm:aspect-21/9">
          <Image
            src={storyPhotoUrl(story)}
            alt={story.storyTitle}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => {
              e.currentTarget.srcset = "";
              e.currentTarget.src = STORY_PLACEHOLDER_IMG;
            }}
          />
          <div className="absolute right-4 top-4">
            <SuccessStoryStatusBadge story={story} />
          </div>
        </div>

        {isRejected && <RejectionReason reason={story.rejectionReason} />}

        <div className="flex flex-col gap-2">
          <h2 className="font-orbitron text-xl font-black uppercase leading-tight text-white sm:text-2xl">{story.storyTitle}</h2>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {story.category && <span className="rounded-lg bg-white/10 px-3 py-1 font-medium text-white">{story.category}</span>}
            {story.position && <span className="rounded-lg bg-primary/20 px-3 py-1 font-bold text-primary">{story.position}</span>}
            <span className="text-zinc-400">{storyDate(story)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/3 p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Player</p>
            <p className="text-sm font-bold text-white">{story.playerName || "—"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Academy</p>
            <p className="text-sm font-bold text-white">{story.currentAcademy || "—"}</p>
          </div>
        </div>

        {story.storyContent && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-300">
              <IconFileText size={16} />
              <p className="text-xs font-bold uppercase tracking-wider">Story</p>
            </div>
            <div className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#0F0F0F] p-5 text-sm leading-relaxed text-zinc-300">
              {story.storyContent}
            </div>
          </div>
        )}
      </div>
    </DashboardModal>
  );
};

const DeleteStoryDialog = ({ story, onClose }: { story: ISuccessStoryItem; onClose: () => void }) => {
  const [deleteSuccessStory, { isLoading }] = useDeleteSuccessStoryMutation();

  const handleDelete = async () => {
    try {
      await deleteSuccessStory(story._id).unwrap();
      onClose();
    } catch {
      // Toasted by the API slice.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isLoading && onClose()} />
      <div className="relative flex w-full max-w-md flex-col gap-6 rounded-3xl border border-destructive/30 bg-[#0A0A0A] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive">
            <IconTrash size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white">Delete Success Story</h3>
            <p className="text-xs text-zinc-400">
              Are you sure you want to delete <span className="font-semibold text-white">&quot;{story.storyTitle}&quot;</span>? This
              action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-all hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDelete}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-destructive/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <IconLoader2 size={16} className="animate-spin" /> Deleting...
              </>
            ) : (
              "Delete Story"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/** Shared add / edit / view / delete state for the success-story screens. */
export const useSuccessStoryDialogs = () => {
  const [form, setForm] = useState<{ open: boolean; storyId: string | null }>({ open: false, storyId: null });
  const [viewing, setViewing] = useState<ISuccessStoryItem | null>(null);
  const [deleting, setDeleting] = useState<ISuccessStoryItem | null>(null);

  const openCreate = () => setForm({ open: true, storyId: null });
  const openEdit = (story: ISuccessStoryItem) => {
    setViewing(null);
    setForm({ open: true, storyId: story._id });
  };

  const dialogs = (
    <>
      <SuccessStoryFormModal isOpen={form.open} storyId={form.storyId} onClose={() => setForm({ open: false, storyId: null })} />
      {viewing && <ViewStoryModal story={viewing} onClose={() => setViewing(null)} onEdit={openEdit} />}
      {deleting && <DeleteStoryDialog story={deleting} onClose={() => setDeleting(null)} />}
    </>
  );

  return { openCreate, openEdit, openView: setViewing, openDelete: setDeleting, dialogs };
};
