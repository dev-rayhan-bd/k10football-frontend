"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBuildingCommunity,
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconHourglass,
  IconLivePhoto,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTicket,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getExtraEventApiError, useGetPublicEventQuery } from "@/redux/features/extraEvent/extraEventApi";
import type { IPublicEvent } from "@/types/extraEvent.type";
import RegisterIndividualModal from "./RegisterIndividualModal";
import RegisterTeamModal from "./RegisterTeamModal";
import {
  formatDeadline,
  formatEventDate,
  formatEventTime,
  formatFee,
  isClosed,
  isCompleted,
  isClubEvent,
  isTournamentStarted,
  mapUrl,
  paymentStatusLabel,
  spotsLabel,
  statusBadgeVariant,
} from "./eventUtils";

const InfoRow = ({ icon: Icon, label, children }: { icon: typeof IconUser; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-primary">
      <Icon className="size-4" />
    </div>
    <div className="flex min-w-0 flex-col">
      <span className="text-[11px] uppercase tracking-wider text-foreground/50">{label}</span>
      <span className="text-sm break-words text-foreground">{children}</span>
    </div>
  </div>
);

/** Register / registered / closed state for the event (spec B button logic). */
const RegistrationPanel = ({ event }: { event: IPublicEvent }) => {
  const [individualOpen, setIndividualOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const club = isClubEvent(event);
  const spots = spotsLabel(event);
  const deadline = formatDeadline(event.registrationDeadline);
  const liveLink = isTournamentStarted(event) ? `/tournament/live/${event._id}` : null;

  let action: React.ReactNode;
  const reg = event.myRegistration;
  if (reg) {
    const pending = String(reg.paymentStatus).toUpperCase() === "PENDING";
    action = (
      <div className="flex flex-col gap-2 rounded-xl border border-primary/40 p-4">
        <span className="flex items-center gap-2 font-semibold text-primary">
          {pending ? <IconHourglass className="size-5" /> : <IconCircleCheck className="size-5" />}
          {pending ? "Payment pending" : reg.type === "CLUB" ? "Your team is registered" : "You're registered"}
        </span>
        <span className="text-xs text-foreground/60">
          {pending
            ? "We're waiting for the payment confirmation. If you left checkout, your place is held for about 30 minutes."
            : `${reg.type === "CLUB" ? "Team entry" : "Individual entry"} · ${paymentStatusLabel(reg.paymentStatus)}`}
        </span>
      </div>
    );
  } else if (isCompleted(event)) {
    action = (
      <Button disabled className="w-full">
        Tournament completed
      </Button>
    );
  } else if (isClosed(event)) {
    action = (
      <div className="flex flex-col gap-2">
        <Button disabled className="w-full">
          Registration closed
        </Button>
        {event.closedReason && <p className="text-center text-xs text-foreground/60">{event.closedReason}</p>}
      </div>
    );
  } else if (club) {
    action = (
      <Button className="w-full" size="lg" onClick={() => setTeamOpen(true)}>
        <IconUsers /> Register your team
      </Button>
    );
  } else {
    action = (
      <Button className="w-full" size="lg" onClick={() => setIndividualOpen(true)}>
        Register
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-cardBg p-5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-foreground">{formatFee(event)}</span>
        {event.status && <Badge variant={statusBadgeVariant(event.status)}>{event.status}</Badge>}
      </div>
      <div className="flex flex-col gap-1 text-xs text-foreground/60">
        {spots && <span>{spots}</span>}
        {deadline && <span>Registration deadline: {deadline}</span>}
        {club && <span>Team entry: register a club with its roster.</span>}
      </div>
      {action}
      {liveLink && (
        <Button asChild variant="outline" className="w-full">
          <Link href={liveLink}>
            <IconLivePhoto /> Follow the tournament live
          </Link>
        </Button>
      )}
      <RegisterIndividualModal event={event} open={individualOpen} onOpenChange={setIndividualOpen} />
      <RegisterTeamModal event={event} open={teamOpen} onOpenChange={setTeamOpen} />
    </div>
  );
};

const EventDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-64 w-full rounded-2xl" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  </div>
);

const EventDetail = ({ eventId }: { eventId: string }) => {
  const { data, isLoading, isError, error, refetch } = useGetPublicEventQuery(eventId, { skip: !eventId });
  const event = data?.data;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:py-12">
      <Link href="/events" className="flex w-fit items-center gap-1.5 text-sm text-foreground/60 hover:text-primary">
        <IconArrowLeft className="size-4" /> All events
      </Link>

      {isLoading ? (
        <EventDetailSkeleton />
      ) : isError || !event ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-cardBg p-10 text-center">
          <p className="text-sm text-destructive">
            {isError ? getExtraEventApiError(error, "Could not load this event.").message : "Event not found."}
          </p>
          {isError && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          )}
        </div>
      ) : (
        <EventDetailBody event={event} />
      )}
    </div>
  );
};

const EventDetailBody = ({ event }: { event: IPublicEvent }) => {
  const time = formatEventTime(event);
  const map = mapUrl(event);
  const academyLocation = [event.academy?.city, event.academy?.country].filter(Boolean).join(", ");
  const hasContact = event.contactPerson || event.contactPhone || event.contactEmail;

  return (
    <>
      <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-border bg-cardBg sm:h-80">
        <Image
          src={event.bannerImage || "/placeholder_img.jpg"}
          alt={event.eventName || "Event banner"}
          fill
          unoptimized
          priority
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {event.eventType && <Badge variant="outline">{event.eventType}</Badge>}
              {event.ageGroup && <Badge variant="outline">{event.ageGroup}</Badge>}
              {event.targetAttendees && <Badge variant="outline">{event.targetAttendees}</Badge>}
            </div>
            <h1 className="font-heading text-2xl text-foreground uppercase sm:text-4xl">{event.eventName}</h1>
            {event.academy?.name && (
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                {event.academy.logo ? (
                  <Image
                    src={event.academy.logo}
                    alt={event.academy.name}
                    width={24}
                    height={24}
                    unoptimized
                    className="size-6 rounded-full object-cover"
                  />
                ) : (
                  <IconBuildingCommunity className="size-5 text-primary" />
                )}
                <span>
                  Organised by <span className="font-semibold text-foreground">{event.academy.name}</span>
                  {academyLocation ? ` · ${academyLocation}` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-cardBg p-5 sm:grid-cols-2">
            <InfoRow icon={IconCalendarEvent} label="Date">
              {formatEventDate(event)}
            </InfoRow>
            {time && (
              <InfoRow icon={IconClock} label="Time">
                {time}
              </InfoRow>
            )}
            {(event.venueName || event.venueAddress) && (
              <InfoRow icon={IconMapPin} label="Venue">
                {[event.venueName, event.venueAddress].filter(Boolean).join(", ")}
                {map && (
                  <a
                    href={map}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-xs text-primary hover:underline"
                  >
                    Open in Google Maps
                  </a>
                )}
              </InfoRow>
            )}
            <InfoRow icon={IconTicket} label="Fee">
              {formatFee(event)}
            </InfoRow>
          </div>

          {event.description && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">About this event</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">{event.description}</p>
            </section>
          )}
          {event.requirements && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Requirements</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">{event.requirements}</p>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <RegistrationPanel event={event} />
          {hasContact && (
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-cardBg p-5">
              <h3 className="text-sm font-semibold">Contact</h3>
              {event.contactPerson && (
                <InfoRow icon={IconUser} label="Contact person">
                  {event.contactPerson}
                </InfoRow>
              )}
              {event.contactPhone && (
                <InfoRow icon={IconPhone} label="Phone">
                  <a href={`tel:${event.contactPhone}`} className="hover:text-primary">
                    {event.contactPhone}
                  </a>
                </InfoRow>
              )}
              {event.contactEmail && (
                <InfoRow icon={IconMail} label="Email">
                  <a href={`mailto:${event.contactEmail}`} className="hover:text-primary">
                    {event.contactEmail}
                  </a>
                </InfoRow>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventDetail;
