"use client";

import { IconBallFootball, IconPhone, IconMail, IconUser } from "@tabler/icons-react";
import type { IPublicEvent } from "@/types/extraEvent.type";

interface PublicTournamentFooterProps {
  event: IPublicEvent;
}

const PublicTournamentFooter = ({ event }: PublicTournamentFooterProps) => {
  return (
    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <IconBallFootball size={20} className="text-[#E31B23]" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-white/40">
            {event.academy?.name ? `Organised by ${event.academy.name}` : "Powered by"}
          </p>
          <p className="text-sm font-black text-white uppercase font-orbitron">K10 Football Network</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
        {event.contactPerson && (
          <span className="flex items-center gap-1.5">
            <IconUser size={14} />
            {event.contactPerson}
          </span>
        )}
        {event.contactPhone && (
          <a href={`tel:${event.contactPhone}`} className="flex items-center gap-1.5 hover:text-white">
            <IconPhone size={14} />
            {event.contactPhone}
          </a>
        )}
        {event.contactEmail && (
          <a href={`mailto:${event.contactEmail}`} className="flex items-center gap-1.5 hover:text-white">
            <IconMail size={14} />
            {event.contactEmail}
          </a>
        )}
      </div>
    </div>
  );
};

export default PublicTournamentFooter;
