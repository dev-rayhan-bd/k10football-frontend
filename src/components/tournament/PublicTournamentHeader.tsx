"use client";

import Link from "next/link";
import { IconBallFootball } from "@tabler/icons-react";

interface PublicTournamentHeaderProps {
  status: "registration" | "live" | "completed";
}

const PublicTournamentHeader = ({ status }: PublicTournamentHeaderProps) => {
  return (
    <div className="bg-[#0E0E10] border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E31B23] flex items-center justify-center">
            <IconBallFootball size={18} className="text-white" />
          </div>
          <span className="text-sm font-black uppercase tracking-wider text-white font-orbitron">
            K10 Football
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1.5 border ${
              status === "live"
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : status === "completed"
                ? "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62]"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === "live"
                  ? "bg-red-500 animate-ping"
                  : status === "completed"
                  ? "bg-[#00FF62]"
                  : "bg-amber-400"
              }`}
            />
            {status === "live"
              ? "LIVE"
              : status === "completed"
              ? "COMPLETED"
              : "UPCOMING"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PublicTournamentHeader;
