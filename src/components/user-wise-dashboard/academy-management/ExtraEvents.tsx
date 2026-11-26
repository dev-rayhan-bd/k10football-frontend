"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { IconPlus, IconCalendar, IconChevronLeft, IconChevronRight, IconWorld } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getExtraEventApiError,
  useGetEventMetaQuery,
  useListAcademyEventsQuery,
} from "@/redux/features/extraEvent/extraEventApi";
import { toOptions, humanize } from "@/components/extra-events/manage/extraEventUtils";
import {
  ExtraEventsFilterBar,
  ExtraEventCard,
  CreateExtraEventModal,
  TOURNAMENT_PRESET_LOGOS,
  CLUB_PRESET_LOGOS,
  TIME_OPTIONS,
  events,
  getStoredEvents,
  saveStoredEvents,
  parseTimeToMinutes,
  formatTo12Hour,
} from "./extra-events";
import type { ExtraEventsFilters } from "./extra-events/ExtraEventsFilterBar";

// Re-exports kept for other modules (tournament pages still import some of these).
export {
  TOURNAMENT_PRESET_LOGOS,
  CLUB_PRESET_LOGOS,
  TIME_OPTIONS,
  events,
  getStoredEvents,
  saveStoredEvents,
  parseTimeToMinutes,
  formatTo12Hour,
  ExtraEventsFilterBar,
  ExtraEventCard,
  CreateExtraEventModal,
};

const PAGE_SIZE = 12;
const EMPTY_FILTERS: ExtraEventsFilters = { searchTerm: "", eventType: "", status: "", ageGroup: "", date: "" };
const DEFAULT_STATUS = ["OPEN", "CLOSING SOON", "CLOSED"];
const DEFAULT_DATES = ["today", "this_week", "this_month", "upcoming", "past"];

interface ExtraEventsManagementProps {
  /** Coach view: no create/edit/delete. */
  readOnly?: boolean;
  /** Detail route prefix. */
  basePath?: string;
}

export const ExtraEventsManagement = ({
  readOnly = false,
  basePath = "/dashboard/academy/management/extra-events",
}: ExtraEventsManagementProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<ExtraEventsFilters>(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Coaches only get the read routes, so the meta (form options) call is academy-only.
  const { data: metaResponse } = useGetEventMetaQuery(undefined, { skip: readOnly });
  const meta = metaResponse?.data;

  const { data: eventsResponse, isLoading, isFetching, error } = useListAcademyEventsQuery({
    searchTerm: debouncedSearch || undefined,
    eventType: filters.eventType || undefined,
    status: filters.status || undefined,
    ageGroup: filters.ageGroup || undefined,
    date: filters.date || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const displayedEvents = eventsResponse?.data?.events ?? [];
  const pageMeta = eventsResponse?.data?.meta ?? eventsResponse?.meta;
  const totalPages = Math.max(1, Number(pageMeta?.totalPages ?? (pageMeta as { totalPage?: number } | undefined)?.totalPage ?? 1));
  const hasFilters = Object.values(filters).some(Boolean);

  const handleFilterChange = (patch: Partial<ExtraEventsFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
    if (patch.searchTerm !== undefined) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      const value = patch.searchTerm.trim();
      searchTimer.current = setTimeout(() => setDebouncedSearch(value), 400);
    }
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setDebouncedSearch("");
    setPage(1);
  };

  const handleCopyEventLink = (eventId: string) => {
    if (typeof window === "undefined") return;
    navigator.clipboard
      .writeText(`${window.location.origin}/events/${eventId}`)
      .then(() => toast.success("Public event link copied to clipboard!"))
      .catch(() => toast.error("Could not copy the link"));
  };

  const dateOptions = toOptions(meta?.dateFilters, DEFAULT_DATES).map((o) =>
    o.label === o.value ? { ...o, label: humanize(o.value).toUpperCase() } : o
  );

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
            Extra Events
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            {readOnly ? "Events and tournaments organised by your academy" : "Manage special events and activities"}
          </p>
        </div>
        {readOnly ? (
          <Link
            href="/events"
            className="w-full md:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shrink-0"
          >
            <IconWorld size={20} className="shrink-0" />
            <span className="text-sm font-bold uppercase tracking-widest truncate">Browse Tournaments</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
          >
            <IconPlus size={20} className="shrink-0" />
            <span className="text-sm font-bold uppercase tracking-widest truncate">Create Event</span>
          </button>
        )}
      </div>

      <ExtraEventsFilterBar
        filters={filters}
        onChange={handleFilterChange}
        eventTypes={toOptions(meta?.eventTypes)}
        statusOptions={toOptions(meta?.statusOptions, DEFAULT_STATUS)}
        ageGroups={toOptions(meta?.ageGroups)}
        dateFilters={dateOptions}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-[#111111] rounded-4xl border border-white/10 p-5 md:p-6 flex flex-col gap-5 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="w-16 h-6 rounded-xl bg-white/5 shimmer" />
                <div className="size-10 rounded-xl bg-white/5 shimmer" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-3/4 h-6 rounded bg-white/5 shimmer" />
                <div className="flex flex-col gap-3">
                  <div className="w-1/2 h-4 rounded bg-white/5 shimmer" />
                  <div className="w-1/3 h-4 rounded bg-white/5 shimmer" />
                  <div className="w-1/3 h-4 rounded bg-white/5 shimmer" />
                </div>
              </div>
              <div className="flex gap-2 mt-auto w-full">
                <div className="flex-1 h-10 rounded-2xl bg-white/5 shimmer" />
                <div className="size-10 rounded-2xl bg-white/5 shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#111111] border border-destructive/30 rounded-4xl p-10 text-center text-sm font-bold text-destructive">
          {getExtraEventApiError(error, "Failed to load events").message}
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
            <IconCalendar size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-black uppercase text-white font-orbitron">No Extra Events Found</h3>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">
              {hasFilters
                ? "No events match the selected filters. Try changing or clearing filters."
                : readOnly
                ? "Your academy hasn't published any extra events yet."
                : "You haven't created any extra events yet. Click 'Create Event' to get started."}
            </p>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-busy={isFetching}>
            {displayedEvents.map((event) => (
              <ExtraEventCard key={event._id} event={event} onCopyLink={handleCopyEventLink} basePath={basePath} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <IconChevronLeft size={18} />
              </button>
              <span className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <IconChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {!readOnly && showCreateModal && (
        <CreateExtraEventModal isOpen onClose={() => setShowCreateModal(false)} meta={meta} />
      )}
    </div>
  );
};

export default ExtraEventsManagement;
