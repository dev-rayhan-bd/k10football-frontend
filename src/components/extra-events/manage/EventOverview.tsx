"use client";

import React from "react";
import Image from "next/image";
import {
  IconCalendarEvent,
  IconClock,
  IconCurrencyDollar,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
  IconUsers,
  IconHourglass,
} from "@tabler/icons-react";
import type { IAcademyEventDetail } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";
import { TOURNAMENT_PRESET_LOGOS } from "@/components/user-wise-dashboard/academy-management/extra-events/extra-events.constants";
import { formatDate, formatMoney, getStatusLabel, humanize, isClubEvent, statusTone } from "./extraEventUtils";
import { Pill } from "./ManageUi";

const StatBox = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) => (
  <div className="bg-[#151515] border border-white/5 rounded-3xl p-5 flex flex-col gap-2 min-w-0">
    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 font-orbitron">
      <span className="text-[#E31B23] shrink-0">{icon}</span> {label}
    </span>
    <span className={cn("text-sm md:text-base font-black uppercase wrap-break-word", accent ? "text-[#00FF62]" : "text-white")}>{value}</span>
  </div>
);

export const EventOverview = ({ event }: { event: IAcademyEventDetail }) => {
  const statusLabel = getStatusLabel(event);
  const isClub = isClubEvent(event);
  const dateText =
    event.formattedDateRange ||
    event.formattedDate ||
    (event.eventEndDate && event.eventEndDate !== event.eventDate
      ? `${formatDate(event.eventDate)} – ${formatDate(event.eventEndDate)}`
      : formatDate(event.eventDate));
  const fee = event.feeFormatted || (event.registrationFee ? formatMoney(event.registrationFee, event.currency) : "Free");
  const capacity =
    (event.capacityRatio !== undefined && event.capacityRatio !== null && String(event.capacityRatio)) ||
    (event.maxCapacity ? `${event.currentAttendees ?? 0} / ${event.maxCapacity}` : `${event.currentAttendees ?? 0} / Unlimited`);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      <div className="xl:col-span-2 bg-linear-to-b from-[#111111] to-[#050505] rounded-4xl border border-white/10 overflow-hidden min-w-0">
        {/* Banner */}
        <div className="relative h-44 md:h-64 bg-black/40 border-b border-white/10">
          {event.bannerImage ? (
            <Image fill src={event.bannerImage} alt={event.eventName} className="object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-28 md:size-36 opacity-80" dangerouslySetInnerHTML={{ __html: TOURNAMENT_PRESET_LOGOS[0].svg }} />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Pill className={statusTone(statusLabel)}>{statusLabel}</Pill>
              {event.eventType && <Pill className="bg-black/50 border-white/15 text-white/70">{event.eventType}</Pill>}
              {isClub && event.tournamentStatus && (
                <Pill className={event.isLiveMode ? "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62]" : "bg-black/50 border-white/15 text-white/70"}>
                  {humanize(event.tournamentStatus)}
                </Pill>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
              {event.eventName}
            </h1>
            {event.closedReason && (
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white/50">{event.closedReason}</p>
            )}
          </div>
        </div>

        <div className="p-5 md:p-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatBox icon={<IconCalendarEvent size={18} />} label="Date" value={dateText} />
            <StatBox
              icon={<IconClock size={18} />}
              label="Time"
              value={event.startTime || event.endTime ? `${event.startTime ?? "?"} – ${event.endTime ?? "?"}` : "TBA"}
            />
            <StatBox icon={<IconHourglass size={18} />} label="Registration Deadline" value={formatDate(event.registrationDeadline)} />
            <StatBox icon={<IconCurrencyDollar size={18} />} label="Registration Fee" value={fee} accent />
            <StatBox icon={<IconUsers size={18} />} label={isClub ? "Registered Clubs" : "Capacity"} value={capacity} />
            <StatBox
              icon={<IconUsers size={18} />}
              label="Audience"
              value={[event.group, event.ageGroup, event.targetAttendees].filter(Boolean).join(" · ") || "—"}
            />
          </div>

          {event.description && (
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Description</h3>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}
          {event.requirements && (
            <div className="flex flex-col gap-3 border-t border-white/5 pt-6">
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Requirements / What to Bring</h3>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{event.requirements}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 min-w-0">
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 flex flex-col gap-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white/40 font-orbitron">Venue</h4>
          <div className="flex items-start gap-3">
            <IconMapPin size={20} className="text-[#E31B23] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-black text-white uppercase wrap-break-word">{event.venueName || "TBA"}</p>
              {event.venueAddress && <p className="text-xs text-white/50 mt-1 wrap-break-word">{event.venueAddress}</p>}
            </div>
          </div>
          {event.latitude != null && event.longitude != null && (
            <a
              href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-black uppercase tracking-widest text-[#E31B23] hover:underline"
            >
              Open in Maps
            </a>
          )}
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 flex flex-col gap-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white/40 font-orbitron">Contact</h4>
          <div className="flex flex-col gap-3.5 text-xs text-white/70">
            <div className="flex items-center gap-3">
              <IconUser size={16} className="text-white/40 shrink-0" />
              <span className="font-bold text-white truncate">{event.contactPerson || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <IconPhone size={16} className="text-white/40 shrink-0" />
              <span className="truncate">{event.contactPhone || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <IconMail size={16} className="text-white/40 shrink-0" />
              <span className="truncate">{event.contactEmail || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventOverview;
