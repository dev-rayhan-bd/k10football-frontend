"use client";

import React from "react";
import { useGetPublicStatsQuery } from "@/redux/features/player/playerApi";

const StatsSection = () => {
  const { data, isLoading } = useGetPublicStatsQuery();
  const homeStats = data?.data?.homeStats;

  const stats = [
    {
      number: isLoading ? "..." : (homeStats?.players?.count ?? 0),
      label: homeStats?.players?.label || "Players",
    },
    {
      number: isLoading ? "..." : (homeStats?.coaches?.count ?? 0),
      label: homeStats?.coaches?.label || "Coaches",
    },
    {
      number: isLoading ? "..." : (homeStats?.clubs?.count ?? 0),
      label: homeStats?.clubs?.label || "Clubs",
    },
    {
      number: isLoading ? "..." : (homeStats?.scouts?.count ?? 0),
      label: homeStats?.scouts?.label || "Scouts",
    },
  ];

  return (
    <section className="relative bg-black py-10 px-5 lg:px-0">
      <div className="container relative mx-auto !p-[2px] ">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 border-2 border-transparent rounded-xl relative z-10 bg-black h-full py-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b rounded-xl from-black to-white"></div>
      </div>
    </section>
  );
};

export default StatsSection;

