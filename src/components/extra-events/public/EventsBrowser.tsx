"use client";

import React, { useCallback, useMemo, useState } from "react";
import { IconCalendarOff, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getExtraEventApiError,
  useListPublicEventsQuery,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IPublicEvent, IPublicEventListParams } from "@/types/extraEvent.type";
import EventCard from "./EventCard";
import EventFilters, { DEFAULT_EVENT_FILTERS, type EventFilterState } from "./EventFilters";
import { distinctValues } from "./eventUtils";

interface EventsBrowserProps {
  /** Limit to one academy (its public profile "Events" tab). */
  academyId?: string;
  pageSize?: number;
  showFilters?: boolean;
  className?: string;
  gridClassName?: string;
}

export const EventGridSkeleton = ({ count = 6, className }: { count?: number; className?: string }) => (
  <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-cardBg">
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const EventsBrowser = ({ academyId, pageSize = 12, showFilters = true, className, gridClassName }: EventsBrowserProps) => {
  const [filters, setFilters] = useState<EventFilterState>(DEFAULT_EVENT_FILTERS);
  const [page, setPage] = useState(1);

  const handleFilters = useCallback((next: EventFilterState) => {
    setFilters(next);
    setPage(1);
  }, []);

  const params: IPublicEventListParams = {
    academyId,
    searchTerm: filters.searchTerm.trim() || undefined,
    eventType: filters.eventType,
    ageGroup: filters.ageGroup,
    targetAttendees: filters.targetAttendees,
    when: filters.when,
    openOnly: filters.openOnly || undefined,
    page,
    limit: pageSize,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useListPublicEventsQuery(params);

  // Filter options come from the real events (unfiltered, all dates) rather than a fixed list.
  const { data: optionSource } = useListPublicEventsQuery({ academyId, when: "all", limit: 100 }, { skip: !showFilters });
  const options = useMemo(() => {
    const events: IPublicEvent[] = Array.isArray(optionSource?.data) ? optionSource.data : [];
    return {
      eventTypes: distinctValues(events, "eventType"),
      ageGroups: distinctValues(events, "ageGroup"),
      targetAttendees: distinctValues(events, "targetAttendees"),
    };
  }, [optionSource]);

  const events: IPublicEvent[] = Array.isArray(data?.data) ? data.data : [];
  const totalPages = Math.max(1, data?.meta?.totalPage ?? data?.meta?.totalPages ?? 1);
  const total = data?.meta?.total ?? events.length;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {showFilters && <EventFilters value={filters} onChange={handleFilters} options={options} />}

      {isLoading ? (
        <EventGridSkeleton count={Math.min(pageSize, 6)} className={gridClassName} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-cardBg p-10 text-center">
          <p className="text-sm text-destructive">{getExtraEventApiError(error, "Could not load events.").message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-cardBg p-10 text-center">
          <IconCalendarOff className="size-10 text-foreground/40" />
          <p className="text-sm font-semibold">No events found</p>
          <p className="text-xs text-foreground/60">
            {filters.when === "upcoming" ? "There are no upcoming events matching your filters." : "Try changing your filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-foreground/60">
            <span>
              {total} {total === 1 ? "event" : "events"}
            </span>
            {isFetching && <span>Updating…</span>}
          </div>
          <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3", gridClassName, isFetching && "opacity-70")}>
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <IconChevronLeft /> Previous
              </Button>
              <span className="text-xs text-foreground/60">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <IconChevronRight />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventsBrowser;
