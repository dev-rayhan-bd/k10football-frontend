import React from "react";
import { IconHeart, IconStar, IconTrendingUp } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { display } from "@/components/evaluations/evaluationFormat";
import type { IAcademyEvaluationAnalyticsData } from "@/types/evaluation.type";

interface PlayerEvaluationSidebarProps {
  mostImproved?: IAcademyEvaluationAnalyticsData["mostImproved"];
  topPerformers?: IAcademyEvaluationAnalyticsData["topPerformers"];
  isLoading?: boolean;
}

const cardClass = "bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6";

const Skeleton = () => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex justify-between items-center shimmer py-2">
        <div className="flex flex-col gap-1.5">
          <div className="w-28 h-3.5 bg-white/10 rounded-sm" />
          <div className="w-16 h-2.5 bg-white/5 rounded-sm" />
        </div>
        <div className="w-10 h-4 bg-white/10 rounded-sm" />
      </div>
    ))}
  </div>
);

export const PlayerEvaluationSidebar: React.FC<PlayerEvaluationSidebarProps> = ({
  mostImproved = [],
  topPerformers = [],
  isLoading = false,
}) => {
  return (
    <div className="w-full xl:w-85 flex flex-col gap-8 shrink-0 min-w-0">
      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="size-8 md:size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <IconTrendingUp className="text-primary size-4 md:size-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">Most Improved</h2>
        </div>

        {isLoading ? (
          <Skeleton />
        ) : mostImproved.length > 0 ? (
          <div className="flex flex-col gap-4">
            {mostImproved.map((player, i) => {
              const negative = player.isPositive === false;
              return (
                <div key={`${player.playerName}-${i}`} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <IconTrendingUp
                      size={16}
                      className={cn("shrink-0", negative ? "text-destructive rotate-180" : "text-primary")}
                    />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-black truncate">{display(player.playerName)}</p>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider truncate">
                        {display(player.ageGroup)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black shrink-0",
                      negative ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    )}
                  >
                    {display(player.delta)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs font-medium py-3 text-center">No improvement data yet.</p>
        )}
      </div>

      <div className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="size-8 md:size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <IconHeart className="text-primary size-4 md:size-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">Top Performers</h2>
        </div>

        {isLoading ? (
          <Skeleton />
        ) : topPerformers.length > 0 ? (
          <div className="flex flex-col gap-5">
            {topPerformers.map((player, i) => (
              <div key={`${player.rank}-${player.playerName}-${i}`} className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-primary text-[10px] font-black font-orbitron shrink-0">#{display(player.rank)}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">{display(player.playerName)}</p>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase truncate">
                      {display(player.ageGroup)} · {display(player.position)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-white text-[10px] font-black font-orbitron shrink-0">
                  <IconStar size={14} className="text-primary" />
                  {display(player.rating)}
                  {player.rating !== null && player.rating !== undefined && player.rating !== "" && (
                    <span className="text-muted-foreground font-normal">/10</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs font-medium py-3 text-center">No top performers yet.</p>
        )}
      </div>
    </div>
  );
};
