"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IconCalendarEvent, IconClock, IconMapPin, IconTicket, IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IPublicEvent } from "@/types/extraEvent.type";
import {
  formatEventDate,
  formatEventTime,
  formatFee,
  isClubEvent,
  spotsLabel,
  statusBadgeVariant,
} from "./eventUtils";

interface EventCardProps {
  event: IPublicEvent;
  /** Extra content under the card body (e.g. "My events" registration details). */
  footer?: React.ReactNode;
  className?: string;
}

const EventCard = ({ event, footer, className }: EventCardProps) => {
  const time = formatEventTime(event);
  const spots = spotsLabel(event);
  const academyLocation = [event.academy?.city, event.academy?.country].filter(Boolean).join(", ");

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-cardBg transition-colors hover:border-primary/40",
        className
      )}
    >
      <Link href={`/events/${event._id}`} className="flex flex-1 flex-col">
        <div className="relative h-40 w-full bg-background">
          <Image
            src={event.bannerImage || "/placeholder_img.jpg"}
            alt={event.eventName || "Event banner"}
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {event.status && <Badge variant={statusBadgeVariant(event.status)}>{event.status}</Badge>}
            {isClubEvent(event) && <Badge variant="outline" className="bg-background/80">Team entry</Badge>}
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-background/80">
              <IconTicket className="size-3" />
              {formatFee(event)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-col gap-1">
            {event.eventType && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{event.eventType}</span>
            )}
            <h3 className="line-clamp-2 text-base font-bold text-foreground group-hover:text-primary">{event.eventName}</h3>
            {event.academy?.name && (
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                {event.academy.logo && (
                  <Image
                    src={event.academy.logo}
                    alt={event.academy.name}
                    width={18}
                    height={18}
                    unoptimized
                    className="size-[18px] rounded-full object-cover"
                  />
                )}
                <span className="truncate">
                  {event.academy.name}
                  {academyLocation ? ` · ${academyLocation}` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-1.5 text-xs text-foreground/70">
            <span className="flex items-center gap-1.5">
              <IconCalendarEvent className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{formatEventDate(event)}</span>
            </span>
            {time && (
              <span className="flex items-center gap-1.5">
                <IconClock className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{time}</span>
              </span>
            )}
            {(event.venueName || event.venueAddress) && (
              <span className="flex items-center gap-1.5">
                <IconMapPin className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{event.venueName || event.venueAddress}</span>
              </span>
            )}
            {(spots || event.ageGroup) && (
              <span className="flex items-center gap-1.5">
                <IconUsers className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{[event.ageGroup, spots].filter(Boolean).join(" · ")}</span>
              </span>
            )}
          </div>
        </div>
      </Link>
      {footer && <div className="border-t border-border p-4">{footer}</div>}
    </div>
  );
};

export default EventCard;
