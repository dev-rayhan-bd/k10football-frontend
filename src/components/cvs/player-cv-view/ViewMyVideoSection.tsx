/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { usePlayerCvView } from "./PlayerCvViewContext";
import {
  MediaItem,
  PreviewMedia,
  MediaSection,
  MediaViewerModal,
} from "@/components/user-wise-dashboard/player-dashboard/images-videos";

export const ViewMyVideoSection = () => {
  const { playerData, cvData } = usePlayerCvView();
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const videos: MediaItem[] = playerData.highlightVideo
    ? [
        {
          id: "highlight-video-1",
          title: `${playerData.fullName || "Player"} - Scouting Highlight Reel`,
          date: "Verified Match Video",
          views: cvData?.profileViews ?? 127,
          likes: cvData?.totalLikes ?? 8,
          img: playerData.profileImage || playerData.playerImage || "/placeholder_img.jpg",
          videoUrl: playerData.highlightVideo,
          mediaType: "VIDEO",
        },
      ]
    : [];

  return (
    <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
      <MediaSection
        title="Highlight Videos"
        type="video"
        items={videos}
        isLoading={false}
        onItemClick={(item) =>
          setPreviewMedia({
            type: "video",
            url: item.videoUrl || "",
            title: item.title,
          })
        }
      />

      <MediaViewerModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
