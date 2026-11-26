"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconCalendar,
  IconCurrencyDollar,
  IconUsers,
  IconCopy,
  IconMapPin,
  IconTrophy,
  IconActivity,
} from "@tabler/icons-react";
import type { IAcademyEventListItem } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatMoney,
  getStatusLabel,
  humanize,
  isClubEvent,
  statusTone,
} from "@/components/extra-events/manage/extraEventUtils";
import { TOURNAMENT_PRESET_LOGOS } from "./extra-events.constants";

interface ExtraEventCardProps {
  event: IAcademyEventListItem;
  onCopyLink: (id: string) => void;
  /** Detail route prefix, e.g. /dashboard/academy/management/extra-events */
  basePath?: string;
}

export const ExtraEventCard: React.FC<ExtraEventCardProps> = ({
  event,
  onCopyLink,
  basePath = "/dashboard/academy/management/extra-events",
}) => {
  const statusLabel = getStatusLabel(event);
  const isClub = isClubEvent(event);
  const feeText =
    event.feeFormatted || (event.registrationFee ? formatMoney(event.registrationFee, event.currency) : "Free");
  const capacityText =
    (event.capacityRatio !== undefined && event.capacityRatio !== null && String(event.capacityRatio)) ||
    (event.maxCapacity ? `${event.currentAttendees || 0}/${event.maxCapacity}` : `${event.currentAttendees || 0} / Unlimited`);
  const dateText = event.formattedDateRange || event.formattedDate || formatDate(event.eventDate);
  const tournamentStage = isClub && event.tournamentStatus ? humanize(event.tournamentStatus) : "";

  return (
    <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-6 flex flex-col gap-5 md:gap-6 hover:border-white/25 transition-all shadow-xl group min-w-0">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-2 min-w-0">
          <span
            className={cn(
              "px-3 md:px-4 py-1.5 rounded-xl border text-[9px] md:text-[10px] font-black uppercase tracking-widest w-fit",
              statusTone(statusLabel)
            )}
          >
            {statusLabel}
          </span>
          {event.closedReason && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 truncate">{event.closedReason}</span>
          )}
        </div>
        {event.bannerImage ? (
          <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
            <Image fill src={event.bannerImage} alt={event.eventName || "Event banner"} className="object-cover" />
          </div>
        ) : isClub ? (
          <div className="size-10 text-white select-none shrink-0" dangerouslySetInnerHTML={{ __html: TOURNAMENT_PRESET_LOGOS[0].svg }} />
        ) : null}
      </div>

      <div className="flex flex-col gap-4 min-w-0">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-black uppercase text-white font-orbitron leading-tight min-h-12 line-clamp-2 wrap-break-word">
            {event.eventName}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {event.eventType && (
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/50">
                {event.eventType}
              </span>
            )}
            {event.ageGroup && (
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/50">
                {event.ageGroup}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
            <IconCalendar size={16} className="shrink-0" />
            <span className="truncate">{dateText}</span>
          </div>
          {event.venueName && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
              <IconMapPin size={16} className="shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
            <IconCurrencyDollar size={16} className="shrink-0" />
            <span className="truncate">{feeText}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
            <IconUsers size={16} className="shrink-0" />
            <span className="truncate">
              {capacityText} {isClub ? "clubs" : ""}
            </span>
          </div>
          {tournamentStage && (
            <div
              className={cn(
                "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest",
                event.isLiveMode ? "text-[#00FF62]" : "text-white/40"
              )}
            >
              {event.isLiveMode ? <IconActivity size={16} className="shrink-0 animate-pulse" /> : <IconTrophy size={16} className="shrink-0" />}
              <span className="truncate">{tournamentStage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-auto w-full">
        <Link
          href={`${basePath}/${event._id}`}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all text-center block min-w-0"
        >
          View Details
        </Link>
        <button
          type="button"
          onClick={() => onCopyLink(event._id)}
          className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
          title="Copy Event Link"
        >
          <IconCopy size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExtraEventCard;
