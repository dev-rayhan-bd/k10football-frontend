"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { useClubPlayerCv } from "./ClubPlayerCvContext";

const AttributeDonut = ({ score, color }: { score: number; color: string }) => {
  const data = [
    { name: "filled", value: score },
    { name: "empty", value: 100 - score },
  ];

  return (
    <ResponsiveContainer width={100} height={100}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={45}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          <Cell fill={color} />
          <Cell fill="#222222" />
          <Label
            value={score}
            position="center"
            fill={color}
            className="text-xl font-black"
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export const ClubAttributeAnalysis = () => {
  const { playerData } = useClubPlayerCv();

  const cards = useMemo(() => {
    const s = playerData.strengths;
    return [
      { name: "Pace", score: s.pace, color: "#00FF62" },
      { name: "Shooting", score: s.shooting, color: "#0077FF" },
      { name: "Passing", score: s.passing, color: "#FFD700" },
      { name: "Dribbling", score: s.dribbling, color: "#FF1010" },
      { name: "Defending", score: s.defending, color: "#00FFFF" },
      { name: "Physicality", score: s.physical, color: "#FF0055" },
    ];
  }, [playerData.strengths]);

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Attribute Rating Breakdown
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Standard scouting attribute ratings calculated against peer division averages.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 w-full">
          {cards.map((c, i) => (
            <div
              key={i}
              className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 text-center"
            >
              <div className="size-24 flex items-center justify-center">
                <AttributeDonut score={c.score} color={c.color} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  {c.name}
                </h4>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {c.score >= 80 ? "Top Tier" : c.score >= 60 ? "Competitive" : "Developing"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
