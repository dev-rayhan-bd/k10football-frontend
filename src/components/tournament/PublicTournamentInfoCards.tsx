"use client";

import type { ReactNode } from "react";
import { IconCalendarEvent, IconCoin, IconMapPin, IconTrophy } from "@tabler/icons-react";
import type { IPublicEvent } from "@/types/extraEvent.type";
import { formatDate, stageLabel } from "./tournament.utils";

type TProps = {
  event: IPublicEvent;
};

const InfoCard = ({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: string }) => (
  <div className="bg-[#111] border border-white/10 rounded-2xl p-5 flex flex-col gap-1.5 min-w-0">
    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
      {icon} {label}
    </span>
    <p className="text-sm font-bold text-white truncate">{value}</p>
    {sub && <p className="text-[11px] text-white/40 truncate">{sub}</p>}
  </div>
);

const formatFee = (event: IPublicEvent) => {
  if (event.feeFormatted) return event.feeFormatted;
  if (!event.registrationFee) return "Free";
  return `${event.currency ? `${event.currency.toUpperCase()} ` : ""}${event.registrationFee}`;
};

const PublicTournamentInfoCards = ({ event }: TProps) => {
  const start = formatDate(event.eventDate);
  const end = formatDate(event.eventEndDate);
  const dates = event.formattedDate || (start && end && end !== start ? `${start} – ${end}` : start) || "TBA";
  const times = [event.startTime, event.endTime].filter(Boolean).join(" – ");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <InfoCard icon={<IconCalendarEvent size={12} />} label="Dates" value={dates} sub={times || undefined} />
      <InfoCard
        icon={<IconMapPin size={12} />}
        label="Venue"
        value={event.venueName || event.venueAddress || "TBA"}
        sub={event.venueName ? event.venueAddress : undefined}
      />
      <InfoCard icon={<IconCoin size={12} />} label="Entry Fee" value={<span className="text-[#00FF62]">{formatFee(event)}</span>} sub="Per team" />
      <InfoCard
        icon={<IconTrophy size={12} />}
        label="Stage"
        value={stageLabel(event.tournamentStatus)}
        sub={event.isLiveMode ? "Live now" : undefined}
      />
    </div>
  );
};

export default PublicTournamentInfoCards;
