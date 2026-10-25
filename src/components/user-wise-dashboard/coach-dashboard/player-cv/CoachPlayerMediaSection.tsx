/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCoachPlayerCv } from "./CoachPlayerCvContext";
import { CoachMediaModal, CoachPreviewMedia } from "./CoachMediaModal";
import { IconPlayerPlay, IconPhoto, IconEye, IconHeart, IconVideo } from "@tabler/icons-react";

export const CoachPlayerMediaSection = () => {
  const { playerData, cvData } = useCoachPlayerCv();
  const [previewMedia, setPreviewMedia] = useState<CoachPreviewMedia | null>(null);

  const images = [
    {
      id: "coach-media-img-1",
      title: playerData.fullName ? `${playerData.fullName} - Official Profile` : "Official Profile",
      date: "Verified Photo",
      views: cvData?.profileViews ?? 127,
      likes: cvData?.totalLikes ?? 8,
      img: playerData.profileImage || playerData.playerImage || "/placeholder_img.jpg",
      type: "image" as const,
    },
  ];

  const videos = playerData.highlightVideo
    ? [
        {
          id: "coach-media-vid-1",
          title: `${playerData.fullName || "Player"} - Scouting Highlight Reel`,
          date: "Match Highlight Video",
          views: cvData?.profileViews ?? 127,
          likes: cvData?.totalLikes ?? 8,
          img: playerData.profileImage || playerData.playerImage || "/placeholder_img.jpg",
          videoUrl: playerData.highlightVideo,
          type: "video" as const,
        },
      ]
    : [];

  return (
    <div className="mt-10 sm:mt-20 w-full min-w-0 overflow-hidden flex flex-col gap-10">
      {/* Video Reels Section */}
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <IconVideo size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white uppercase tracking-wider">
              Scouting Video Reels
            </h2>
            <p className="text-xs text-muted-foreground">
              Official match highlights and tactical movement footage uploaded for coach evaluation.
            </p>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20">
            <p className="text-xs sm:text-sm text-gray-400">
              No match highlight videos uploaded for this player yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() =>
                  setPreviewMedia({
                    type: "video",
                    url: vid.videoUrl,
                    title: vid.title,
                  })
                }
                className="group relative bg-black/30 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all shadow-lg"
              >
                <div className="relative aspect-video w-full bg-black/50 overflow-hidden">
                  <Image
                    src={vid.img}
                    alt={vid.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="size-12 rounded-full bg-primary/90 flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-xl">
                      <IconPlayerPlay className="size-6 fill-black translate-x-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                    {vid.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
                    <span>{vid.date}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <IconEye className="size-3.5" /> {vid.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconHeart className="size-3.5" /> {vid.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Gallery Section */}
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <IconPhoto size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white uppercase tracking-wider">
              Player Photo Gallery
            </h2>
            <p className="text-xs text-muted-foreground">
              Official player photos and action shots.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() =>
                setPreviewMedia({
                  type: "image",
                  url: img.img,
                  title: img.title,
                })
              }
              className="group relative bg-black/30 border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all shadow-lg"
            >
              <div className="relative aspect-square w-full bg-black/50 overflow-hidden">
                <Image
                  src={img.img}
                  alt={img.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3.5 flex flex-col gap-1.5">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">
                  {img.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1.5 border-t border-white/10">
                  <span>{img.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <IconEye className="size-3" /> {img.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconHeart className="size-3" /> {img.likes}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Viewer Modal */}
      <CoachMediaModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
