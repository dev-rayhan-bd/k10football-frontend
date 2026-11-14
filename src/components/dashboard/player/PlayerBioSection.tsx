'use client'
import Image from "next/image";
import React, { useState, useRef } from "react";
import { Clock, Mail, Phone, Shield, Lock, Camera, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";

import { usePlayer } from "@/hooks/usePlayer";
import { getFullWithShortForm, formatDate } from "@/lib/utils";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { updatePlayerField } from "@/redux/features/player/playerSlice";

const PlayerBioSection = () => {
  const dispatch = useAppDispatch();
  const { playerData, cvData, updatePlayerProfile, isLoading } = usePlayer();
  const router = useRouter();
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const coverImgSrc =
    playerData.coverImage ||
    cvData?.coverImage ||
    "/placeholder_img.jpg";

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    setIsUploadingCover(true);

    // Optimistic preview
    const reader = new FileReader();
    reader.onload = () => {
      dispatch(updatePlayerField({ field: "coverImage", value: reader.result as string }));
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      formData.append("data", JSON.stringify({}));
      await updatePlayerProfile(formData);
      toast.success("Cover image updated successfully!");
    } catch (err: any) {
      console.error("Cover image upload failed:", err);
      toast.error(err?.data?.message || "Failed to update cover image");
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = "";
      }
    }
  };

  const currentClub =
    playerData.currentClub ||
    cvData?.currentClub ||
    cvData?.playerEvaluation?.currentClub ||
    playerData.clubs?.[0]?.name ||
    "Unattached";

  return (
    <div className="pb-8 sm:pb-16 md:pb-20">
      {/* Background with stadium image */}
      <div
        className="relative w-full min-h-150 md:h-screen bg-cover bg-center flex items-center px-4 sm:px-8 md:px-12 py-10 md:py-0 overflow-hidden rounded-3xl group"
        style={{
          backgroundImage: `url('${coverImgSrc}')`,
          backgroundPosition: 'center',
          backgroundSize: "cover"
        }}
      >
        {/* Cover Skeleton while loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center z-10">
            <div className="text-white/20 text-xs font-semibold tracking-wider uppercase">
              Loading Cover...
            </div>
          </div>
        )}

        {/* Change Cover Button */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 print:hidden">
          <button
            type="button"
            onClick={() => coverFileInputRef.current?.click()}
            disabled={isUploadingCover || isLoading}
            className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] md:text-xs font-bold px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-white/20 hover:border-white/40 transition-all shadow-xl cursor-pointer disabled:opacity-50"
          >
            {isUploadingCover ? (
              <>
                <Loader2 className="size-4 animate-spin text-[#E31B23]" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Camera className="size-4 text-white" />
                <span>Change Cover</span>
              </>
            )}
          </button>
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

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
              onClick={() => {
                if (!hasActiveSubscription) {
                  toast.error("Active Athlete Membership required to create game reports or request coach reviews.");
                  router.push("/dashboard/player/my-subscription");
                  return;
                }
                router.push("/dashboard/player/game-reports/create");
              }}
              className="w-full mb-6 sm:mb-8 px-2 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white uppercase tracking-widest sm:tracking-widest transition-all shadow-[0_0_20px_rgba(227,27,35,0.2)] text-[10px] sm:text-xs cursor-pointer font-orbitron flex items-center justify-center gap-2"
            >
              {!hasActiveSubscription && <Lock className="size-3.5" />}
              <span>Create Game Report</span>
            </button>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Current Club */}
              <div className="bg-black/70 backdrop-blur-sm border border-gray-700/80 rounded-xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <Shield className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Current Club</span>
                </div>
                <p className="text-white font-bold text-xs sm:text-sm truncate">{currentClub}</p>
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
                <p className="text-orange-400 font-bold text-xs sm:text-sm truncate">{formatDate(playerData.contractUntil)}</p>
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
