"use client";

import React from "react";
import { IconTable } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ParsedStanding } from "./extraEventUtils";
import { ClubLogo, EmptyState, SectionCard } from "./ManageUi";

const COLS: { key: keyof ParsedStanding; label: string }[] = [
  { key: "p", label: "P" },
  { key: "w", label: "W" },
  { key: "d", label: "D" },
  { key: "l", label: "L" },
  { key: "gf", label: "GF" },
  { key: "ga", label: "GA" },
  { key: "gd", label: "GD" },
  { key: "pts", label: "PTS" },
];

export const StandingsTables = ({ groups }: { groups: { label: string; rows: ParsedStanding[] }[] }) => (
  <SectionCard title="Standings" subtitle="Top two of each group advance to the semifinals">
    {groups.length === 0 || groups.every((g) => g.rows.length === 0) ? (
      <EmptyState icon={<IconTable size={28} />} title="No standings yet" text="Standings appear once group matches are played." />
    ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {groups.map((g) => (
          <div key={g.label} className="bg-[#151515] border border-white/5 rounded-3xl p-4 flex flex-col gap-3 min-w-0">
            <h4 className="text-xs font-black uppercase tracking-widest text-white font-orbitron">{g.label}</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-110 text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/10">
                    <th className="py-2 pr-2 w-6">#</th>
                    <th className="py-2 pr-2">Club</th>
                    {COLS.map((c) => (
                      <th key={c.key} className="py-2 px-1 text-center">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r, i) => (
                    <tr key={r.id || i} className={cn("border-b border-white/5 text-xs text-white/80", i < 2 && "bg-[#00FF62]/3")}>
                      <td className={cn("py-2 pr-2 font-black", i < 2 ? "text-[#00FF62]" : "text-white/40")}>{i + 1}</td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <ClubLogo logo={r.logo} name={r.name} className="size-7 rounded-lg" />
                          <span className="font-bold text-white truncate">{r.name}</span>
                        </div>
                      </td>
                      {COLS.map((c) => (
                        <td key={c.key} className={cn("py-2 px-1 text-center", c.key === "pts" && "font-black text-white")}>
                          {String(r[c.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )}
  </SectionCard>
);

export default StandingsTables;
