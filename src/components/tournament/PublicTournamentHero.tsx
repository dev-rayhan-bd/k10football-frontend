"use client";

import Image from "next/image";
import {
  IconCalendarEvent,
  IconCheck,
  IconCopy,
  IconEye,
  IconMapPin,
  IconRefresh,
  IconTrophy,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { IPublicEvent } from "@/types/extraEvent.type";
import { StatusPill } from "./PublicTournamentHeader";
import { formatDate } from "./tournament.utils";

type TProps = {
  event: IPublicEvent;
  copied: boolean;
  onCopyLink: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated?: string;
};

const PublicTournamentHero = ({ event, copied, onCopyLink, onRefresh, refreshing, lastUpdated }: TProps) => {
  const academy = event.academy;
  const academyPlace = [academy?.city, academy?.country].filter(Boolean).join(", ");
  const date = event.formattedDate || formatDate(event.eventDate);
  const venue = [event.venueName, event.venueAddress].filter(Boolean).join(" · ");

  return (
    <div className="bg-linear-to-r from-amber-500/10 via-[#161618] to-black rounded-4xl border border-amber-500/30 p-8 md:p-10 shadow-2xl relative overflow-hidden">
      {event.bannerImage && (
        <>
          <Image
            src={event.bannerImage}
            alt=""
            fill
            unoptimized
            className="object-cover opacity-25 pointer-events-none"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-black/40 pointer-events-none" />
        </>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="flex items-center gap-6 min-w-0">
          {/* Academy logo / trophy */}
          <div className="size-20 md:size-24 shrink-0 bg-[#161616] rounded-3xl border border-white/10 p-4 flex items-center justify-center shadow-lg">
            {academy?.logo ? (
              <Image
                width={80}
                height={80}
                unoptimized
                src={academy.logo}
                alt={academy.name || "Academy"}
                className="size-full object-contain"
              />
            ) : (
              <IconTrophy className="size-full text-amber-400" />
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest font-orbitron">
                <IconEye size={14} />
                Public Live Results
              </div>
              <StatusPill tournamentStatus={event.tournamentStatus} isLive={event.isLiveMode} />
            </div>
            <h1 className="text-2xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-tight break-words">
              {event.eventName}
            </h1>
            {(academy?.name || event.eventType) && (
              <p className="text-sm text-white/70 font-bold">
                {[academy?.name, academyPlace].filter(Boolean).join(" — ")}
                {event.eventType && (
                  <span className="text-white/40 font-normal">
                    {academy?.name ? " · " : ""}
                    {event.eventType}
                  </span>
                )}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
              {date && (
                <span className="flex items-center gap-1.5">
                  <IconCalendarEvent size={14} /> {date}
                </span>
              )}
              {venue && (
                <span className="flex items-center gap-1.5 min-w-0">
                  <IconMapPin size={14} className="shrink-0" /> <span className="truncate">{venue}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Share & Refresh */}
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto min-w-60">
          <button
            type="button"
            onClick={onCopyLink}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] py-3 px-4 rounded-xl transition-all font-orbitron cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            {copied ? "Link Copied!" : "Copy Share Link"}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider text-[10px] py-2.5 px-4 rounded-xl transition-all border border-white/10 cursor-pointer disabled:opacity-60"
          >
            <IconRefresh size={14} className={cn(refreshing && "animate-spin")} />
            Refresh Results
          </button>
          <p className="text-[10px] text-white/40 text-center uppercase tracking-widest">
            {lastUpdated ? `Last updated ${lastUpdated}` : "Updating…"}
            {event.isLiveMode && " · auto-refresh 30s"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicTournamentHero;
