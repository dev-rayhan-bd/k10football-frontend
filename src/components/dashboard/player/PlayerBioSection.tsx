'use client'
import Image from "next/image";

import React from "react";
import backgroundImage from "@/assets/player-dashboard/backgroundImage.png";
import { Clock, Mail, Phone, Shield } from 'lucide-react';
import { useRouter } from "next/navigation";

import { usePlayer } from "@/hooks/usePlayer";
import { getFullWithShortForm } from "@/lib/utils";

const PlayerBioSection = () => {
  const { playerData } = usePlayer();
  const router = useRouter();

  return (
    <div className="pb-8 sm:pb-16 md:pb-20">
      {/* Background with stadium image */}
      <div
        className="relative w-full min-h-150 md:h-screen bg-cover bg-center flex items-center px-4 sm:px-8 md:px-12 py-10 md:py-0 overflow-hidden rounded-3xl"
        style={{
          backgroundImage: `url(${backgroundImage.src})`,
          backgroundPosition: 'center',
          backgroundSize: "cover"
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 md:via-transparent to-transparent z-10" />

        {/* Player Image absolute overlay - Full height aligned to the bottom right */}
        <div className="absolute right-0 bottom-0 h-full w-[60%] sm:w-[50%] md:w-[55%] flex items-end justify-end pointer-events-none opacity-25 sm:opacity-40 md:opacity-100 z-10">
          <Image
            src={typeof playerData.playerImage === 'string' ? playerData.playerImage : (playerData.playerImage?.src || "/ronaldo.png")}
            alt={playerData.fullName}
            className="h-[85%] md:h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
            width={500}
            height={500}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-20 flex items-center w-full">
          {/* Left Side - Player Info */}
          <div className="w-full max-w-sm">
            {/* Jersey Rating Circle */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center mb-6 md:mb-8 bg-white/10 bg-opacity-50">
              <span className="text-3xl md:text-5xl font-heading text-white">{playerData.rating}</span>
            </div>

            {/* Active Player Badge */}
            <div className="inline-block border border-white/40 bg-black/40 backdrop-blur-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6">
              <span className="text-white text-xs sm:text-sm font-semibold tracking-widest font-orbitron">{playerData.transferStatus.toUpperCase()} PLAYER</span>
            </div>

            {/* Player Name */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-white mb-2 tracking-tight leading-tight">{playerData.fullName}</h1>

            {/* Position, Age, Country */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm">
              <span className="text-red-500 font-semibold text-sm sm:text-lg font-orbitron">{getFullWithShortForm(playerData.position)}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300">{playerData.age} Years Old</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300 flex items-center gap-1.5">
                <span>{playerData.birthCountry === 'France' ? '🇫🇷' : '🇧🇷'}</span> {playerData.birthCountry}
              </span>
            </div>

            {/* Request Game Report Button */}
            <button 
              onClick={() => router.push("/dashboard/player/game-reports/create")}
              className="w-full mb-6 sm:mb-8 px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white uppercase tracking-widest sm:tracking-widest transition-all shadow-[0_0_20px_rgba(227,27,35,0.2)] text-[10px] sm:text-xs cursor-pointer font-orbitron"
            >
              Create Game Report
            </button>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Current Club */}
              <div className="bg-black/70 backdrop-blur-sm border border-gray-700/80 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <Shield className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Current Club</span>
                </div>
                <p className="text-white font-bold text-xs sm:text-sm truncate">{playerData.agency}</p>
              </div>

              {/* Contact */}
              <div className="bg-black/70 backdrop-blur-sm border border-gray-700/80 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Contact</span>
                </div>
                <p className="text-white font-bold text-xs sm:text-sm truncate">{playerData.phone}</p>
              </div>

              {/* Contract Until */}
              <div className="bg-black/70 backdrop-blur-sm border border-gray-700/80 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Contract Until</span>
                </div>
                <p className="text-orange-400 font-bold text-xs sm:text-sm truncate">{playerData.contractUntil}</p>
              </div>

              {/* Email */}
              <div className="bg-black/70 backdrop-blur-sm border border-gray-700/80 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Email</span>
                </div>
                <p className="text-white font-bold text-xs sm:text-sm truncate">{playerData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBioSection;
