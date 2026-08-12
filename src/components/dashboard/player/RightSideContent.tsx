'use client'

import React from "react";
import { FileText, Heart } from 'lucide-react';
import Image from 'next/image';
import clubLogo from "@/assets/cvs-page/club1.png";

import { useAppSelector } from "@/lib/hooks/reduxHooks";

const RightSideContent = () => {
  const reports = useAppSelector(state => state.reports.reports);
  const gameReports = reports
    .filter(r => r.status === "Paid")
    .slice(0, 3)
    .map(r => ({
      id: r.id,
      opponent: `vs ${r.team2}`,
      rating: r.rating
    }));

  const clubsInterested = [
    {
      id: 1,
      name: 'Manchester City',
      subtitle: 'Viewed your profile',
      logo: clubLogo
    },
    {
      id: 2,
      name: 'Liverpool FC',
      subtitle: 'Viewed your profile',
      logo: clubLogo
    },
    {
      id: 3,
      name: 'Chelsea FC',
      subtitle: 'Viewed your profile',
      logo: clubLogo
    }
  ];

  const stats = [
    { label: 'Profile Views', value: '127', color: 'text-gray-400' },
    { label: 'Total Likes', value: '8', color: 'text-red-500' },
    { label: 'Reports', value: '12', color: 'text-green-500' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* New Game Reports */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-white font-heading text-base sm:text-lg uppercase">New Game Reports</h2>
        </div>

        <div className="space-y-3">
          {gameReports.map((report) => (
            <div key={report.id} className="border border-white/10 rounded-xl p-3.5 flex items-center justify-between hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-gray-300 text-xs sm:text-sm font-medium truncate">{report.opponent}</span>
              </div>
              <span className="text-white font-bold text-sm sm:text-base font-orbitron shrink-0 ml-2">{report.rating}</span>
            </div>
          ))}
          {gameReports.length === 0 && (
            <p className="text-gray-500 text-xs italic text-center py-2">No recent reports available.</p>
          )}
        </div>
      </div>

      {/* Clubs Interested */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
          <h2 className="text-white font-heading text-base sm:text-lg uppercase">Clubs Interested</h2>
        </div>

        <div className="space-y-3">
          {clubsInterested.map((club) => (
            <div key={club.id} className="border border-white/10 rounded-xl p-3.5 flex items-center gap-3 sm:gap-4 hover:bg-white/5 transition-all">
              <Image
                src={club.logo}
                alt={club.name}
                width={80}
                height={80}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-xs sm:text-sm truncate">{club.name}</p>
                <p className="text-gray-400 text-[10px] sm:text-xs">{club.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <h2 className="text-white text-base sm:text-lg mb-4 font-orbitron uppercase">Overview Stats</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <p className={`text-lg sm:text-xl font-bold ${s.color} font-orbitron mb-1`}>{s.value}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSideContent;
