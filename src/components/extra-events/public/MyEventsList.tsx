"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconCalendarEvent, IconChevronLeft, IconChevronRight, IconLivePhoto } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getExtraEventApiError,
  useGetMyEventRegistrationsQuery,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IPublicEvent } from "@/types/extraEvent.type";
import EventCard from "./EventCard";
import { EventGridSkeleton } from "./EventsBrowser";
import { formatDateTime, isTournamentStarted, paymentBadgeVariant, paymentStatusLabel } from "./eventUtils";

const PAGE_SIZE = 12;

const RegistrationFooter = ({ event }: { event: IPublicEvent }) => {
  const reg = event.myRegistration;
  if (!reg) return null;
  const pending = String(reg.paymentStatus).toUpperCase() === "PENDING";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{reg.type === "CLUB" ? "Club team" : "Individual"}</Badge>
        <Badge variant={paymentBadgeVariant(reg.paymentStatus)}>{paymentStatusLabel(reg.paymentStatus)}</Badge>
      </div>
      {reg.registeredAt && (
        <span className="text-xs text-foreground/60">Registered {formatDateTime(reg.registeredAt)}</span>
      )}
      {pending && (
        <span className="text-xs text-foreground/60">
          Waiting for payment confirmation. Unpaid places are released after about 30 minutes.
        </span>
      )}
      {isTournamentStarted(event) && (
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href={`/tournament/live/${event._id}`}>
            <IconLivePhoto /> Live tournament
          </Link>
        </Button>
      )}
    </div>
  );
};

/** Events the logged-in player / parent registered for (individual or club team). */
const MyEventsList = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetMyEventRegistrationsQuery({
    page,
    limit: PAGE_SIZE,
  });
  const events: IPublicEvent[] = Array.isArray(data?.data) ? data.data : [];
  const totalPages = Math.max(1, data?.meta?.totalPage ?? data?.meta?.totalPages ?? 1);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl text-foreground uppercase">My Events</h1>
          <p className="text-sm text-foreground/60">Camps, trials, clinics and tournaments you&apos;ve registered for.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/events">
            <IconCalendarEvent /> Browse events
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <EventGridSkeleton count={3} />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-cardBg p-10 text-center">
          <p className="text-sm text-destructive">
            {getExtraEventApiError(error, "Could not load your registrations.").message}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-cardBg p-10 text-center">
          <IconCalendarEvent className="size-10 text-foreground/40" />
          <p className="text-sm font-semibold">You haven&apos;t registered for any events yet</p>
          <Button asChild size="sm">
            <Link href="/events">Find an event</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={`${event._id}-${event.myRegistration?.participantId || event.myRegistration?.clubId || ""}`}
                event={event}
                footer={<RegistrationFooter event={event} />}
              />
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

export default MyEventsList;
