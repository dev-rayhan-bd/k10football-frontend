'use client'

import React from "react";
import { FileText, Heart, Lock, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import clubLogo from "@/assets/cvs/club1.png";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { useGetMyAcademyHomepageQuery } from "@/redux/features/academy/academyApi";
import { cn } from "@/lib/utils";

const RightSideContent = () => {
  const router = useRouter();
  const reports = useAppSelector(state => state.reports.reports);
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const { data: academyHomepageResponse } = useGetMyAcademyHomepageQuery();
  const affiliatedAcademy = academyHomepageResponse?.data?.academyInfo;
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

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
      {/* Affiliated Academy Card (if connected) */}
      {affiliatedAcademy && (
        <div className="border border-primary/20 rounded-2xl p-4 sm:p-5 bg-black/40 backdrop-blur-xs shadow-xl flex items-center gap-3.5">
          <div className="size-12 rounded-xl bg-black/60 border border-white/10 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src={affiliatedAcademy.logo || clubLogo}
              alt={affiliatedAcademy.name || "Academy"}
              width={48}
              height={48}
              className="size-full object-contain"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = "/placeholder_img.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-orbitron">
              Affiliated Academy
            </span>
            <p className="text-white font-bold text-sm truncate">
              {affiliatedAcademy.name}
            </p>
            <p className="text-gray-400 text-[11px] truncate">
              {affiliatedAcademy.category || affiliatedAcademy.location}
            </p>
          </div>
        </div>
      )}

      {/* Scout & Agent Exposure Card */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", hasActiveSubscription ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500")}>
              {hasActiveSubscription ? <ShieldCheck className="size-4" /> : <Lock className="size-4" />}
            </div>
            <div>
              <h3 className="text-white text-xs sm:text-sm font-heading uppercase">Scout Exposure</h3>
              <p className="text-[10px] text-gray-400">Agent & Club Discovery</p>
            </div>
          </div>
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-orbitron", hasActiveSubscription ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
            {hasActiveSubscription ? "Active" : "Locked"}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
          {hasActiveSubscription
            ? "Your profile is active in verified scouting pools, club radars, and agent discovery algorithms."
            : "Profile hidden from scouting algorithms & featured recommendation lists on Free plan."}
        </p>
        {!hasActiveSubscription && (
          <button
            onClick={() => router.push("/dashboard/player/my-subscription")}
            className="w-full py-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 text-[10px] font-bold uppercase tracking-wider font-orbitron transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Lock className="size-3" />
            Unlock Scouting Exposure
          </button>
        )}
      </div>

      {/* New Game Reports */}
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 bg-black/40 backdrop-blur-xs shadow-xl">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="size-9 sm:size-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="size-5 sm:size-6 text-white" />
          </div>
          <h2 className="text-white font-heading text-base sm:text-lg uppercase">New Game Reports</h2>
        </div>

        <div className="space-y-3">
          {gameReports.map((report) => (
            <div key={report.id} className="border border-white/10 rounded-xl p-3.5 flex items-center justify-between hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="size-4 text-red-500 shrink-0" />
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
          <div className="size-9 sm:size-10 bg-red-600 rounded-xl flex items-center justify-center shrink-0">
            <Heart className="size-5 sm:size-6 text-white fill-white" />
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
                className="size-10 sm:size-12 rounded-full object-cover shrink-0"
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
