/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useGetMyPlayerMediaQuery } from "@/redux/features/player/playerApi";
import { useMediaUpload } from "@/providers/MediaUploadProvider";
import {
  MediaItem,
  PreviewMedia,
  MediaSection,
  UploadMediaModal,
  MediaViewerModal,
} from "@/components/user-wise-dashboard/player-dashboard/images-videos";
import { usePlayer } from "@/hooks/usePlayer";

const MyVideosSection = ({ editable = true }: { editable?: boolean }) => {
  const { cvData, playerData } = usePlayer();
  const { startUpload } = useMediaUpload();

  const isViewingSpecificPlayer =
    typeof window !== "undefined" &&
    Boolean(new URLSearchParams(window.location.search).get("playerId"));

  // Fetch Videos from API: GET /players/me/media?mediaType=VIDEO (skip if viewing specific player)
  const { data: videosResponse, isLoading } = useGetMyPlayerMediaQuery(
    [
      { name: "mediaType", value: "VIDEO" },
      { name: "page", value: "1" },
      { name: "limit", value: "50" },
    ],
    { skip: isViewingSpecificPlayer }
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const apiVideos = videosResponse?.data?.media ?? [];

  const mappedApiVideos: MediaItem[] = apiVideos.map((item: any) => {
    const hasThumbnail =
      typeof item.thumbnailUrl === "string" && item.thumbnailUrl.trim().length > 0;
    return {
      id: item._id,
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
    };
  });

  const fallbackVideos: MediaItem[] = cvData?.highlightVideo
    ? [
        {
          id: "highlight-video-1",
          title: "Player Highlight Video",
          date: "Recent",
          views: cvData?.profileViews ?? 127,
          likes: cvData?.totalLikes ?? 8,
          img: playerData?.playerImage || cvData?.profileImage || "/placeholder_img.jpg",
          videoUrl: cvData.highlightVideo,
          mediaType: "VIDEO",
        },
      ]
    : [];

  const videos: MediaItem[] = mappedApiVideos.length > 0 ? mappedApiVideos : fallbackVideos;

  return (
    <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
      <MediaSection
        title="My Videos"
        type="video"
        items={videos}
        isLoading={isLoading}
        onUploadClick={editable ? () => setIsUploadModalOpen(true) : undefined}
        onItemClick={(item) =>
          setPreviewMedia({
            type: "video",
            url: item.videoUrl || item.img,
            title: item.title,
          })
        }
      />

      {/* Upload Media Modal */}
      {editable && (
        <UploadMediaModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          type="video"
          onStartUpload={startUpload}
        />
      )}

      {/* Video Viewer Modal */}
      <MediaViewerModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};

export default MyVideosSection;
