"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconAlertCircle,
  IconArrowRight,
  IconCalendar,
  IconDotsVertical,
  IconEye,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconTrophy,
} from "@tabler/icons-react";
import { useGetSuccessStoriesQuery } from "@/redux/features/academy/academyApi";
import type { ISuccessStoryItem, SuccessStoryStatusFilter } from "@/types/academy.type";
import { cn } from "@/lib/utils";
import { RejectionReason, useSuccessStoryDialogs } from "@/components/success-stories/SuccessStoryDialogs";
import { SuccessStoryStatusBadge } from "@/components/success-stories/SuccessStoryStatusBadge";
import {
  getSuccessStoryApiError,
  isStatus,
  storyDate,
  storyPhotoUrl,
  STORY_PLACEHOLDER_IMG,
  SUCCESS_STORY_TABS,
} from "@/components/success-stories/successStoryUtils";

const WIDGET_LIMIT = 6;

interface AcademyDashboardSuccessStoriesProps {
  /** Full Success Story page for the current dashboard (management / analysis). */
  viewAllHref?: string;
}

export const AcademyDashboardSuccessStories = ({
  viewAllHref = "/dashboard/academy/management/success-story",
}: AcademyDashboardSuccessStoriesProps) => {
  const [status, setStatus] = useState<SuccessStoryStatusFilter>("ALL");
  const [menuStoryId, setMenuStoryId] = useState<string | null>(null);
  const { openCreate, openEdit, openView, openDelete, dialogs } = useSuccessStoryDialogs();

  const { data, isLoading, isFetching, error, refetch } = useGetSuccessStoriesQuery({ status, page: 1, limit: WIDGET_LIMIT });
  const stories = data?.data?.stories ?? [];
  const counts = data?.data?.counts;
  const errorInfo = error ? getSuccessStoryApiError(error, "Failed to load success stories") : null;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-[#111111] p-6 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-orbitron text-xl font-black uppercase text-white md:text-2xl">Success Story</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40 md:text-xs">
            Share and view academy milestones
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link
            href={viewAllHref}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 sm:flex-initial sm:py-2.5"
          >
            <span>View All</span>
            <IconArrowRight size={14} />
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E31B23] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(227,27,35,0.2)] transition-all hover:bg-[#ff2d35] sm:flex-initial sm:px-6 sm:py-2.5"
          >
            <IconPlus size={16} />
            <span>Add Success Story</span>
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SUCCESS_STORY_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                isActive
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/5 bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/80"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-black",
                  isActive ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/60"
                )}
              >
                {counts?.[tab.countKey] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid / states */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/2">
              <div className="aspect-video w-full bg-white/10" />
              <div className="flex grow flex-col gap-3 p-6">
                <div className="h-3 w-28 rounded bg-white/10" />
                <div className="h-5 w-4/5 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : errorInfo ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/2 px-6 py-14 text-center">
          <IconAlertCircle size={28} className="text-destructive" />
          <p className="text-sm font-bold text-white">{errorInfo.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10"
          >
            <IconRefresh size={14} className={cn(isFetching && "animate-spin")} /> Retry
          </button>
        </div>
      ) : stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/2 px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-500">
            <IconTrophy size={28} />
          </div>
          <p className="text-base font-bold text-white">
            {status === "ALL" ? "No Success Stories Yet" : `No ${status.toLowerCase()} stories`}
          </p>
          {status === "ALL" && (
            <>
              <p className="max-w-sm text-xs text-white/50">
                Share your academy&apos;s achievements. Each story is reviewed by an admin before it appears on your public profile.
              </p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl bg-[#E31B23] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#ff2d35]"
              >
                <IconPlus size={16} /> Add First Story
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={cn("grid grid-cols-1 gap-6 transition-opacity md:grid-cols-2 lg:grid-cols-3", isFetching && "opacity-60")}>
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              isMenuOpen={menuStoryId === story._id}
              onToggleMenu={() => setMenuStoryId((prev) => (prev === story._id ? null : story._id))}
              onCloseMenu={() => setMenuStoryId(null)}
              onView={() => openView(story)}
              onEdit={() => openEdit(story)}
              onDelete={() => openDelete(story)}
            />
          ))}
        </div>
      )}

      {dialogs}
    </div>
  );
};

const StoryCard = ({
  story,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onView,
  onEdit,
  onDelete,
}: {
  story: ISuccessStoryItem;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const isRejected = isStatus(story, "REJECTED");
  const menuAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onCloseMenu();
    action();
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/2 transition-all hover:border-white/15">
      {/* Actions menu */}
      <div className="absolute right-3 top-3 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu();
          }}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/80 shadow-md backdrop-blur-xs transition-all hover:bg-black/90 hover:text-white"
          aria-label="Story actions"
        >
          <IconDotsVertical size={16} />
        </button>
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-20 cursor-default" onClick={onCloseMenu} />
            <div className="absolute right-0 z-30 mt-1 flex w-40 flex-col rounded-xl border border-white/15 bg-[#161616] py-1.5 shadow-2xl">
              <button
                type="button"
                onClick={menuAction(onView)}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-bold uppercase text-white/80 transition-all hover:bg-white/5 hover:text-white"
              >
                <IconEye size={14} className="text-zinc-400" /> View
              </button>
              <button
                type="button"
                onClick={menuAction(onEdit)}
                className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-bold uppercase text-white/80 transition-all hover:bg-white/5 hover:text-white"
              >
                <IconPencil size={14} className="text-blue-400" /> {isRejected ? "Edit & Resubmit" : "Edit"}
              </button>
              <button
                type="button"
                onClick={menuAction(onDelete)}
                className="flex w-full cursor-pointer items-center gap-2 border-t border-white/5 px-4 py-2 text-left text-xs font-bold uppercase text-destructive transition-all hover:bg-destructive/10"
              >
                <IconTrash size={14} /> Delete
              </button>
            </div>
          </>
        )}
      </div>

      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <SuccessStoryStatusBadge story={story} />
      </div>

      {/* Photo */}
      <div
        onClick={onView}
        className="group/thumb relative flex aspect-video w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-[#161616]"
      >
        <Image
          fill
          src={storyPhotoUrl(story)}
          alt={story.storyTitle}
          className="object-cover transition-all duration-300 group-hover/thumb:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          onError={(e) => {
            e.currentTarget.srcset = "";
            e.currentTarget.src = STORY_PLACEHOLDER_IMG;
          }}
        />
      </div>

      {/* Body */}
      <div className="flex grow flex-col justify-between gap-3 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="truncate text-primary">{story.category}</span>
            {story.playerName && (
              <>
                <span>•</span>
                <span className="truncate">{story.playerName}</span>
              </>
            )}
          </div>
          <h3
            onClick={onView}
            className="line-clamp-2 cursor-pointer font-orbitron text-lg font-bold uppercase leading-tight text-white transition-colors group-hover:text-primary"
          >
            {story.storyTitle}
          </h3>
          {story.storyContent && <p className="line-clamp-3 text-xs leading-relaxed text-white/50">{story.storyContent}</p>}
          {isRejected && <RejectionReason reason={story.rejectionReason} className="pt-1" />}
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <IconCalendar size={13} className="text-zinc-500" />
            <span>{storyDate(story)}</span>
          </div>
          {isRejected ? (
            <button
              type="button"
              onClick={onEdit}
              className="flex cursor-pointer items-center gap-1 text-[10px] font-black uppercase tracking-wider text-destructive transition-colors hover:text-white"
            >
              <IconPencil size={12} /> Edit &amp; Resubmit
            </button>
          ) : (
            <button
              type="button"
              onClick={onView}
              className="flex cursor-pointer items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 transition-colors hover:text-primary"
            >
              Read Full <IconArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademyDashboardSuccessStories;
