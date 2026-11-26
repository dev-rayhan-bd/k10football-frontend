"use client";

import React from "react";
import { IconTrophy } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ParsedBracket, ParsedFixture } from "./extraEventUtils";
import { ClubLogo, SectionCard } from "./ManageUi";

const winnerSide = (m: ParsedFixture): "home" | "away" | null => {
  if (m.winner) return m.winner === m.home ? "home" : m.winner === m.away ? "away" : null;
  if (m.status !== "COMPLETED" || m.homeScore === null || m.awayScore === null || m.homeScore === m.awayScore) return null;
  return m.homeScore > m.awayScore ? "home" : "away";
};

const BracketSide = ({ match, side, w }: { match: ParsedFixture | null; side: "home" | "away"; w: "home" | "away" | null }) => {
  const name = match ? (side === "home" ? match.home : match.away) : "TBD";
  const score = match ? (side === "home" ? match.homeScore : match.awayScore) : null;
  const logo = match ? (side === "home" ? match.homeLogo : match.awayLogo) : {};
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2", w === side ? "text-white" : w ? "text-white/40" : "text-white/80")}>
      <ClubLogo logo={logo} name={name} className="size-6 rounded-md" />
      <span className="flex-1 min-w-0 truncate text-xs font-black uppercase">{name}</span>
      <span className={cn("text-sm font-black font-orbitron", w === side && "text-[#00FF62]")}>{score ?? "-"}</span>
    </div>
  );
};

const BracketMatch = ({ match, label }: { match: ParsedFixture | null; label: string }) => {
  const w = match ? winnerSide(match) : null;
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</span>
      <div className="bg-[#151515] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
        <BracketSide match={match} side="home" w={w} />
        <BracketSide match={match} side="away" w={w} />
      </div>
    </div>
  );
};

export const BracketView = ({ bracket }: { bracket: ParsedBracket }) => {
  const semis: (ParsedFixture | null)[] = [bracket.semis[0] ?? null, bracket.semis[1] ?? null];
  return (
    <SectionCard title="Knockout Bracket" subtitle="Semifinals → Grand Final">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col gap-6">
          {semis.map((m, i) => (
            <BracketMatch key={i} match={m} label={`Semifinal ${i + 1}`} />
          ))}
        </div>
        <BracketMatch match={bracket.final} label="Grand Final" />
        <div className="flex flex-col items-center justify-center gap-3 text-center bg-linear-to-b from-[#FDC700]/10 to-transparent border border-[#FDC700]/20 rounded-3xl p-6">
          <IconTrophy size={40} className={bracket.champion ? "text-[#FDC700]" : "text-white/20"} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Champion</span>
          <span className="text-base font-black uppercase text-white font-orbitron wrap-break-word">{bracket.champion || "TBD"}</span>
        </div>
      </div>
    </SectionCard>
  );
};

export default BracketView;
