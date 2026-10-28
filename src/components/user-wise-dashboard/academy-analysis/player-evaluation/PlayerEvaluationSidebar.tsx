import React from "react";
import { IconClock, IconTrendingUp, IconHeart, IconStar } from "@tabler/icons-react";
import { IAcademyMostImprovedPlayer, IAcademyTopPerformer } from "@/types/academy.type";

interface PlayerEvaluationSidebarProps {
  mostImproved?: IAcademyMostImprovedPlayer[];
  topPerformers?: IAcademyTopPerformer[];
  isLoading?: boolean;
}

export const PlayerEvaluationSidebar: React.FC<PlayerEvaluationSidebarProps> = ({
  mostImproved = [],
  topPerformers = [],
  isLoading = false,
}) => {
  return (
    <div className="w-full xl:w-85 flex flex-col gap-8 shrink-0 min-w-0">
      {/* Most Improved */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
        <div className="flex items-center gap-3">
          <div className="size-8 md:size-10 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(227,27,35,0.2)] shrink-0">
            <IconClock className="text-white size-4 md:size-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
            Most Improved
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center shimmer py-2">
                <div className="flex items-center gap-3">
                  <div className="size-4 bg-white/10 rounded-sm" />
                  <div className="flex flex-col gap-1.5">
                    <div className="w-24 h-3.5 bg-white/10 rounded-sm" />
                    <div className="w-12 h-2.5 bg-white/5 rounded-sm" />
                  </div>
                </div>
                <div className="w-10 h-5 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        ) : mostImproved.length > 0 ? (
          <div className="flex flex-col gap-4">
            {mostImproved.map((player, i) => {
              const name = player.playerName || player.name || "Player";
              const team = player.ageGroup || player.team || "U-15";
              const rawDelta = player.improvementDelta !== undefined
                ? (player.improvementDelta > 0 ? `+${player.improvementDelta}` : `${player.improvementDelta}`)
                : (player.change !== undefined ? String(player.change) : "+0.0");
              const isNegative = String(rawDelta).startsWith("-") || Boolean(player.down);
              const textColor = isNegative ? "text-red-500" : "text-emerald-400";
              const bgColor = isNegative ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400";

              return (
                <div key={player.playerId || i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <IconTrendingUp size={16} className={`${textColor} shrink-0 ${isNegative ? "rotate-180" : ""}`} />
                    <div className="truncate">
                      <p className="text-white text-sm font-black truncate">{name}</p>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{team}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 ${bgColor}`}>
                    {rawDelta}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white/40 text-xs font-medium py-3 text-center">
            No improved player records available.
          </p>
        )}
      </div>

      {/* Top Performers */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
        <div className="flex items-center gap-3">
          <div className="size-8 md:size-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <IconHeart className="text-red-500 size-4 md:size-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
            Top Performers
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center shimmer py-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-3 bg-white/10 rounded-sm" />
                  <div className="flex flex-col gap-1.5">
                    <div className="w-28 h-3.5 bg-white/10 rounded-sm" />
                    <div className="w-16 h-2.5 bg-white/5 rounded-sm" />
                  </div>
                </div>
                <div className="w-10 h-4 bg-white/10 rounded-sm" />
              </div>
            ))}
          </div>
        ) : topPerformers.length > 0 ? (
          <div className="flex flex-col gap-6">
            {topPerformers.map((player, i) => {
              const name = player.playerName || "Player";
              const info = `${player.ageGroup || "U-18"} · ${player.position || "Player"}`;
              const ratingDisplay = typeof player.rating === "number" ? player.rating.toFixed(1) : player.rating;

              return (
                <div key={player.playerId || i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-red-500 text-[10px] font-black font-orbitron shrink-0">
                      #{player.rank || i + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-white text-sm font-bold truncate">{name}</p>
                      <p className="text-white/40 text-[10px] font-bold uppercase truncate">{info}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-white text-[10px] font-black font-orbitron shrink-0">
                    <IconStar size={14} className="text-red-500 fill-red-500/20" />
                    {ratingDisplay}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-white/40 text-xs font-medium py-3 text-center">
            No top performers available.
          </p>
        )}
      </div>
    </div>
  );
};
