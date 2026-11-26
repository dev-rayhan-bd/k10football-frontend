"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconCircleCheck, IconCircleX, IconHourglass, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { extraEventApi, useGetPublicEventQuery } from "@/redux/features/extraEvent/extraEventApi";
import { readSession } from "./eventUtils";

export type EventPaymentKind = "EXTRA_EVENT" | "TOURNAMENT_CLUB";

const POLL_MS = 3000;
/** ~5 refetches while the webhook confirms the payment. */
const POLL_WINDOW_MS = POLL_MS * 5;

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
    <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl border border-border bg-cardBg p-6 text-center sm:p-10">
      {children}
    </div>
  </div>
);

const myEventsLink = (role: string) =>
  role === "player" || role === "parent" ? `/dashboard/${role}/my-events` : null;

/**
 * Stripe success return for event registrations. No verify call: the webhook confirms the payment,
 * so we only re-read the event (myRegistration.paymentStatus) a few times while it is PENDING.
 */
export const EventPaymentSuccess = ({ eventId, kind }: { eventId: string; kind: EventPaymentKind }) => {
  const [session] = useState(readSession);
  const [startedAt] = useState(() => Date.now());

  // Read the cached result first to decide whether to keep polling (no setState in effects).
  const { data: cached, fulfilledTimeStamp } = extraEventApi.endpoints.getPublicEvent.useQueryState(eventId, {
    skip: !eventId,
  });
  const cachedStatus = String(cached?.data?.myRegistration?.paymentStatus || "").toUpperCase();
  const withinWindow = !fulfilledTimeStamp || fulfilledTimeStamp - startedAt < POLL_WINDOW_MS;
  const keepPolling = Boolean(eventId) && cachedStatus === "PENDING" && withinWindow;

  const { data, isLoading } = useGetPublicEventQuery(eventId, {
    skip: !eventId,
    refetchOnMountOrArgChange: true,
    pollingInterval: keepPolling ? POLL_MS : 0,
  });

  const event = data?.data;
  const status = String(event?.myRegistration?.paymentStatus || "").toUpperCase();
  const confirmed = status === "PAID" || status === "FREE";
  const stillPending = status === "PENDING";
  const myEvents = session.loggedIn ? myEventsLink(session.role) : null;
  const subject = kind === "TOURNAMENT_CLUB" ? "Your team's place" : "Your place";

  return (
    <Shell>
      <div className="flex size-20 items-center justify-center rounded-full border-2 border-primary/50 text-primary">
        {confirmed ? <IconCircleCheck className="size-10" /> : <IconHourglass className="size-10" />}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl uppercase sm:text-3xl">
          {confirmed ? "Registration confirmed" : "Payment received"}
        </h1>
        {event?.eventName && <p className="text-sm font-semibold text-primary">{event.eventName}</p>}
        <p className="text-sm text-foreground/70">
          {confirmed
            ? `${subject} is confirmed. See you there!`
            : `Payment received. ${subject} will be confirmed in a moment.`}
        </p>
        {(isLoading || keepPolling) && !confirmed && (
          <span className="flex items-center justify-center gap-1.5 text-xs text-foreground/60">
            <IconLoader2 className="size-3.5 animate-spin" /> Checking confirmation…
          </span>
        )}
        {stillPending && !keepPolling && (
          <p className="text-xs text-foreground/60">
            Confirmation is taking a little longer than usual. It will appear on the event page and in your
            events shortly.
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {eventId && (
          <Button asChild>
            <Link href={`/events/${eventId}`}>View event</Link>
          </Button>
        )}
        {myEvents ? (
          <Button asChild variant="outline">
            <Link href={myEvents}>My events</Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/events">Browse events</Link>
          </Button>
        )}
      </div>
    </Shell>
  );
};

/** Stripe cancel return for event registrations. */
export const EventPaymentCancelled = ({ eventId, kind }: { eventId: string; kind: EventPaymentKind }) => (
  <Shell>
    <div className="flex size-20 items-center justify-center rounded-full border-2 border-destructive/50 text-destructive">
      <IconCircleX className="size-10" />
    </div>
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl uppercase sm:text-3xl">Payment cancelled</h1>
      <p className="text-sm text-foreground/70">
        Payment cancelled. {kind === "TOURNAMENT_CLUB" ? "Your team's spot" : "Your seat"} is held for about 30
        minutes and is then released. You were not charged.
      </p>
    </div>
    <div className="flex flex-wrap justify-center gap-3">
      {eventId && (
        <Button asChild>
          <Link href={`/events/${eventId}`}>Back to the event</Link>
        </Button>
      )}
      <Button asChild variant="outline">
        <Link href="/events">Browse events</Link>
      </Button>
    </div>
  </Shell>
);
