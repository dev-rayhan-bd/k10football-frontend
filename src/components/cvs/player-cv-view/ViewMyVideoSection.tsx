/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { usePlayerCvView } from "./PlayerCvViewContext";
import { useGetUserMediaQuery } from "@/redux/features/media/mediaApi";
import {
  MediaItem,
  PreviewMedia,
  MediaSection,
  MediaViewerModal,
} from "@/components/user-wise-dashboard/player-dashboard/images-videos";

export const ViewMyVideoSection = () => {
  const { playerData } = usePlayerCvView();
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const targetUserId = playerData.userId || playerData.id || "";

  const { data: userVideosResponse, isLoading } = useGetUserMediaQuery(
    { userId: targetUserId, mediaType: "VIDEO", page: 1, limit: 50 },
    { skip: !targetUserId }
  );

  const videos: MediaItem[] = useMemo(() => {
    const rawMedia = Array.isArray(userVideosResponse?.data?.media)
      ? userVideosResponse.data.media
      : Array.isArray(userVideosResponse?.data)
        ? (userVideosResponse.data as any[])
        : [];

    const mappedApiVideos: MediaItem[] = rawMedia.map((item: any) => {
      const hasThumbnail =
        typeof item.thumbnailUrl === "string" && item.thumbnailUrl.trim().length > 0;
      return {
        id: item._id || item.id,
        title: item.title || "Untitled Video",
        date: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recent",
        views: item.views ?? 0,
        likes: item.likes ?? 0,
        img: hasThumbnail ? item.thumbnailUrl.trim() : (item.url || "/placeholder_img.jpg"),
        videoUrl: item.url,
        mediaType: "VIDEO",
        hasThumbnail,
      };
    });

    if (
      playerData.highlightVideo &&
      !mappedApiVideos.some((v) => v.videoUrl === playerData.highlightVideo)
    ) {
      mappedApiVideos.push({
        id: "highlight-video-1",
        title: `${playerData.fullName || "Player"} - Scouting Highlight Reel`,
        date: "Highlight Video",
        views: playerData.profileViews ?? 0,
        likes: playerData.totalLikes ?? 0,
        img: playerData.profileImage || playerData.playerImage || "/placeholder_img.jpg",
        videoUrl: playerData.highlightVideo,
        mediaType: "VIDEO",
        hasThumbnail: Boolean(playerData.profileImage || playerData.playerImage),
      });
    }

    return mappedApiVideos;
  }, [userVideosResponse, playerData.highlightVideo, playerData.fullName, playerData.profileViews, playerData.totalLikes, playerData.profileImage, playerData.playerImage]);

  return (
    <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
      <MediaSection
        title="Highlight Videos"
        type="video"
        items={videos}
        isLoading={isLoading}
        onItemClick={(item) =>
          setPreviewMedia({
            type: "video",
            url: item.videoUrl || item.img || "",
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
