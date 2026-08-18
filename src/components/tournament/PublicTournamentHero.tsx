/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";

import { TOURNAMENT_PRESET_LOGOS } from "@/components/user-wise-dashboard/academy-management/ExtraEvents";
import { IconEye, IconCopy, IconCheck, IconRefresh } from "@tabler/icons-react";

type TProps = {
  event: any;
  copied: boolean;
  onCopyLink: () => void;
  onRefresh: () => void;
  lastRefreshed: string;
}

const PublicTournamentHero = ({
  event,
  copied,
  onCopyLink,
  onRefresh,
  lastRefreshed,
}: TProps) => {
  return (
    <div className="bg-linear-to-r from-amber-500/10 via-[#161618] to-black rounded-4xl border border-amber-500/30 p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="flex items-center gap-6">
          {/* Tournament Logo */}
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-[#161616] rounded-3xl border border-white/10 p-4 flex items-center justify-center shadow-lg">
            {event.customLogo ? (
              <Image
                width={80}
                height={80}
                src={event.customLogo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    TOURNAMENT_PRESET_LOGOS.find((l) => l.id === event.logoId)
                      ?.svg || TOURNAMENT_PRESET_LOGOS[0].svg,
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest font-orbitron">
              <IconEye size={14} />
              Public Live Results
            </div>
            <h1 className="text-2xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="text-sm text-white/60 leading-relaxed max-w-lg">
              Live scores, group standings, match fixtures, and championship knockout brackets.
            </p>
          </div>
        </div>

        {/* Share & Refresh Buttons */}
        <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto min-w-60">
          <button
            onClick={onCopyLink}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] py-3 px-4 rounded-xl transition-all font-orbitron cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {copied ? (
              <>
                <IconCheck size={14} />
                Link Copied!
              </>
            ) : (
              <>
                <IconCopy size={14} />
                Share This Page
              </>
            )}
          </button>
          <button
            onClick={onRefresh}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold uppercase tracking-wider text-[10px] py-2.5 px-4 rounded-xl transition-all border border-white/10 cursor-pointer"
          >
            <IconRefresh size={14} />
            Refresh Results{" "}
            {lastRefreshed && (
              <span className="text-white/30 normal-case">
                ({lastRefreshed})
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicTournamentHero;
