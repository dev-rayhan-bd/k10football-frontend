/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IconCalendarEvent, IconMapPin, IconUsers, IconUser } from "@tabler/icons-react";

type TProps = {
  event: any;
  teamsCount: number;
}

const PublicTournamentInfoCards = ({
  event,
  teamsCount,
}: TProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
          <IconCalendarEvent size={12} /> Date
        </span>
        <p className="text-sm font-bold text-white">{event.date}</p>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
          <IconMapPin size={12} /> Venue
        </span>
        <p className="text-sm font-bold text-white truncate">
          {event.venueName || event.address || "TBA"}
        </p>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
          <IconUsers size={12} /> Teams
        </span>
        <p className="text-sm font-bold text-[#00FF62]">{teamsCount} Registered</p>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-1.5">
        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
          <IconUser size={12} /> Organizer
        </span>
        <p className="text-sm font-bold text-white truncate">
          {event.contactName || "Tournament Admin"}
        </p>
      </div>
    </div>
  );
};

export default PublicTournamentInfoCards;
