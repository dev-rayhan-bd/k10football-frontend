import React from "react";
import { MediaStat } from "./types";

interface MediaStatsHeaderProps {
  stats: MediaStat[];
}

export const MediaStatsHeader: React.FC<MediaStatsHeaderProps> = ({ stats }) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 px-2 sm:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
          My Images & Videos
        </h1>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-tight">
          My Professional Football Profile
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-8 rounded-3xl border border-white/5 bg-[#0D0D0D]/60 backdrop-blur-md group hover:border-white/10 transition-all duration-500"
            >
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="size-10 sm:size-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-500">
                  <Icon size={20} stroke={1.5} className="sm:hidden block" />
                  <Icon size={24} stroke={1.5} className="hidden sm:block" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tighter font-orbitron">
                    {stat.value}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    {stat.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
