/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useGetMyMediaQuery } from "@/redux/features/media/mediaApi";
import { useMediaUpload } from "@/providers/MediaUploadProvider";
import {
  MediaItem,
  PreviewMedia,
  MediaSection,
  UploadMediaModal,
  MediaViewerModal,
} from "@/components/user-wise-dashboard/player-dashboard/images-videos";

const MyVideosSection = ({ editable = true }: { editable?: boolean }) => {
  const { startUpload } = useMediaUpload();

  // Fetch Videos from API: GET /media/me?mediaType=VIDEO
  const { data: videosResponse, isLoading } = useGetMyMediaQuery({
    mediaType: "VIDEO",
    page: 1,
    limit: 50,
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const apiVideos = videosResponse?.data?.media ?? [];

  const videos: MediaItem[] = apiVideos.map((item: any) => {
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
      hasThumbnail: Boolean(hasThumbnail),
    };
  });

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
