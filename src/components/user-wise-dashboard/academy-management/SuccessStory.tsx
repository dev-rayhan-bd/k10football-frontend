"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  IconAlertCircle,
  IconChevronDown,
  IconEye,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconTrophy,
  IconX,
} from "@tabler/icons-react";
import { useGetSuccessStoriesMetaQuery, useGetSuccessStoriesQuery } from "@/redux/features/academy/academyApi";
import type { SuccessStoryStatusFilter } from "@/types/academy.type";
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

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

export const SuccessStoryManagement = () => {
  const [status, setStatus] = useState<SuccessStoryStatusFilter>("ALL");
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { openCreate, openEdit, openView, openDelete, dialogs } = useSuccessStoryDialogs();

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const { data: metaResponse } = useGetSuccessStoriesMetaQuery();
  const categories = metaResponse?.data?.categories ?? [];

  const { data, isLoading, isFetching, error, refetch } = useGetSuccessStoriesQuery({
    status,
    searchTerm: searchTerm || undefined,
    category: category || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const stories = data?.data?.stories ?? [];
  const counts = data?.data?.counts;
  const pagination = data?.data?.meta;
  const totalPages = pagination?.totalPages ?? 0;
  const errorInfo = error ? getSuccessStoryApiError(error, "Failed to load success stories") : null;
  const hasFilters = Boolean(searchTerm || category || status !== "ALL");

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div className="flex w-full max-w-full flex-col gap-6 overflow-x-hidden pb-10 md:gap-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
        <div>
          <h1 className="wrap-break-word font-orbitron text-3xl font-black uppercase leading-none tracking-tight text-white md:text-4xl">
            Success Story
          </h1>
          <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white/60 md:text-[11px]">
            Stories are reviewed by an admin before they appear on your public profile
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#1A1A1A] px-6 py-3 text-white shadow-lg transition-all hover:border-white/20 hover:bg-[#252525] md:w-auto"
        >
          <IconPlus size={20} className="shrink-0" />
          <span className="truncate text-sm font-bold uppercase tracking-widest">Add Success Story</span>
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-6 rounded-4xl border border-white/15 bg-[#0A0A0A] p-5 shadow-2xl md:gap-8 md:p-8">
        {/* Toolbar */}
        <div className="flex flex-col items-stretch justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            {SUCCESS_STORY_TABS.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                    isActive
                      ? "border-white/20 bg-white/10 text-white shadow-md"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-52">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by category"
                className={cn(
                  "w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#111111] py-2 pl-3 pr-8 text-xs focus:border-white/30 focus:outline-none",
                  category ? "text-white" : "text-zinc-500"
                )}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <IconChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search title, player, position..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#111111] py-2 pl-9 pr-8 text-xs text-white transition-all placeholder:text-zinc-500 focus:border-white/30 focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-white"
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                title="Refresh stories"
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <IconRefresh size={16} className={cn(isFetching && "animate-spin text-white")} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/15">
          <table className="w-full min-w-200 border-collapse text-left">
            <thead>
              <tr className="border-b border-white/15 bg-white/1">
                {["Story Title", "Category", "Date", "Status", "Action"].map((heading, idx, arr) => (
                  <th
                    key={heading}
                    className={cn(
                      "px-6 py-5 text-[11px] font-black uppercase tracking-widest text-zinc-400",
                      idx > 0 && "text-center",
                      idx < arr.length - 1 && "border-r border-white/15"
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-white/10">
                    <td className="border-r border-white/10 px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-12 shrink-0 rounded-full bg-white/10" />
                        <div className="flex flex-col gap-2">
                          <div className="h-4 w-48 rounded bg-white/10" />
                          <div className="h-3 w-28 rounded bg-white/5" />
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 4 }).map((__, cell) => (
                      <td key={cell} className="border-r border-white/10 px-6 py-5 last:border-r-0">
                        <div className="mx-auto h-4 w-20 rounded bg-white/10" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : errorInfo ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <IconAlertCircle size={28} className="text-destructive" />
                      <p className="text-sm font-bold text-white">{errorInfo.message}</p>
                      <button
                        type="button"
                        onClick={() => refetch()}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10"
                      >
                        <IconRefresh size={14} /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-500">
                        <IconTrophy size={28} />
                      </div>
                      <p className="text-base font-bold text-white">No Success Stories Found</p>
                      <p className="max-w-sm text-xs text-zinc-400">
                        {hasFilters
                          ? "Try adjusting your filters or search keywords."
                          : "Start sharing your academy's achievements, player signings and trophies."}
                      </p>
                      {!hasFilters && (
                        <button
                          type="button"
                          onClick={openCreate}
                          className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white/15"
                        >
                          <IconPlus size={16} /> Add First Story
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                stories.map((story, index) => {
                  const isRejected = isStatus(story, "REJECTED");
                  return (
                    <tr
                      key={story._id}
                      className={cn("group transition-colors hover:bg-white/2", index !== stories.length - 1 && "border-b border-white/15")}
                    >
                      <td className="border-r border-white/15 px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-white/15 bg-[#1A1A1A]">
                            <Image
                              width={80}
                              height={80}
                              src={storyPhotoUrl(story)}
                              alt={story.storyTitle}
                              className="size-full object-cover"
                              unoptimized
                              onError={(e) => {
                                e.currentTarget.srcset = "";
                                e.currentTarget.src = STORY_PLACEHOLDER_IMG;
                              }}
                            />
                          </div>
                          <div className="flex min-w-0 max-w-xs flex-col gap-0.5 sm:max-w-md">
                            <p className="line-clamp-2 text-sm font-black leading-snug text-white">{story.storyTitle}</p>
                            {(story.playerName || story.position) && (
                              <p className="text-xs font-semibold text-zinc-400">
                                {story.playerName}
                                {story.playerName && story.position && " • "}
                                {story.position && <span className="font-bold text-primary">{story.position}</span>}
                              </p>
                            )}
                            {isRejected && <RejectionReason reason={story.rejectionReason} className="pt-2" />}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-r border-white/15 px-6 py-5 text-center text-sm font-medium text-zinc-300">
                        {story.category || "—"}
                      </td>
                      <td className="whitespace-nowrap border-r border-white/15 px-6 py-5 text-center text-sm font-medium text-zinc-300">
                        {storyDate(story)}
                      </td>
                      <td className="whitespace-nowrap border-r border-white/15 px-6 py-5 text-center">
                        <SuccessStoryStatusBadge story={story} className="px-4 py-1.5 text-[10px]" />
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openView(story)}
                            title="View story"
                            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                          >
                            <IconEye size={18} />
                          </button>
                          {isRejected ? (
                            <button
                              type="button"
                              onClick={() => openEdit(story)}
                              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 text-[10px] font-black uppercase tracking-wider text-destructive transition-all hover:bg-destructive hover:text-white"
                            >
                              <IconPencil size={14} /> Edit &amp; Resubmit
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openEdit(story)}
                              title="Edit story"
                              className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                            >
                              <IconPencil size={18} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openDelete(story)}
                            title="Delete story"
                            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive shadow-lg transition-all hover:bg-destructive hover:text-white"
                          >
                            <IconTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs text-zinc-400">
            <p>
              Page <span className="font-bold text-white">{pagination?.page ?? page}</span> of{" "}
              <span className="font-bold text-white">{totalPages}</span> ({pagination?.total ?? 0} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {dialogs}
    </div>
  );
};

export default SuccessStoryManagement;
