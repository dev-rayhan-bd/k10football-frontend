/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { IconBallFootball, IconPhone, IconMail } from "@tabler/icons-react";

interface PublicTournamentFooterProps {
  event: any;
}

const PublicTournamentFooter = ({ event }: PublicTournamentFooterProps) => {
  return (
    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <IconBallFootball size={20} className="text-[#E31B23]" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-white/40">Powered by</p>
          <p className="text-sm font-black text-white uppercase font-orbitron">K10 Football Network</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-xs text-white/50">
        {event.contactPhone && (
          <span className="flex items-center gap-1.5">
            <IconPhone size={14} />
            {event.contactPhone}
          </span>
        )}
        {event.contactEmail && (
          <span className="flex items-center gap-1.5">
            <IconMail size={14} />
            {event.contactEmail}
          </span>
        )}
      </div>
    </div>
  );
};

export default PublicTournamentFooter;
