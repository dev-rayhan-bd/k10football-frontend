"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  IconCalendar, 
  IconCurrencyDollar, 
  IconUsers, 
  IconCopy 
} from "@tabler/icons-react";
import { IExtraEventItem } from "@/types/academy.type";
import { cn } from "@/lib/utils";
import { TOURNAMENT_PRESET_LOGOS } from "./extra-events.constants";

interface ExtraEventCardProps {
  event: IExtraEventItem;
  onCopyLink: (id: string | number) => void;
}

export const ExtraEventCard: React.FC<ExtraEventCardProps> = ({
  event,
  onCopyLink,
}) => {
  const eventId = event._id || event.id;
  const statusLabel = event.statusBadge?.label || event.status || "OPEN";
  const isStatusOpen = statusLabel.toUpperCase() === "OPEN";
  const isStatusClosing = statusLabel.toUpperCase().includes("CLOSING");
  const feeText = event.feeFormatted || (event.registrationFee !== undefined ? `${event.currency || "$"} ${event.registrationFee}` : "Free");
  const capacityText = event.capacityRatio || (event.maxCapacity ? `${event.currentAttendees || 0}/${event.maxCapacity}` : "Open");
  const dateText = event.formattedDate || (event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBA");

  return (
    <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-6 flex flex-col gap-5 md:gap-6 hover:border-white/25 transition-all shadow-xl group min-w-0">
      <div className="flex justify-between items-start gap-2">
        <span className={cn(
          "px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0",
          isStatusOpen 
            ? "bg-[#4ADE80]/10 text-[#4ADE80]" 
            : isStatusClosing 
            ? "bg-[#FBBF24]/10 text-[#FBBF24]" 
            : "bg-white/10 text-white/40"
        )}>
          {statusLabel}
        </span>
        {event.bannerImage ? (
          <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
            <Image fill src={event.bannerImage} alt={event.eventName || "Event banner"} className="object-cover" />
          </div>
        ) : (event.eventType === "tournament" || event.eventType === "Tournament Registration") ? (
          <div className="size-10 text-white select-none shrink-0">
            <div dangerouslySetInnerHTML={{ 
              __html: TOURNAMENT_PRESET_LOGOS.find(l => l.id === event.logoId)?.svg || TOURNAMENT_PRESET_LOGOS[0].svg 
            }} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 min-w-0">
        <h3 className="text-lg font-black uppercase text-white font-orbitron leading-tight min-h-12 line-clamp-2 wrap-break-word">
          {event.eventName || event.title}
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
            <IconCalendar size={16} className="shrink-0" />
            <span className="truncate">{dateText}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
            <IconCurrencyDollar size={16} className="shrink-0" />
            <span className="truncate">{feeText}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
            <IconUsers size={16} className="shrink-0" />
            <span className="truncate">{capacityText}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-auto w-full">
        <Link 
          href={`/dashboard/academy/management/extra-events/${eventId}`}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all text-center block min-w-0"
        >
          View Details
        </Link>
        <button 
          type="button"
          onClick={() => onCopyLink(String(eventId))}
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
