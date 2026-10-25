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

const MyImagesSection = ({ editable = true }: { editable?: boolean }) => {
  const { cvData, playerData } = usePlayer();
  const { startUpload } = useMediaUpload();

  const isViewingSpecificPlayer =
    typeof window !== "undefined" &&
    Boolean(new URLSearchParams(window.location.search).get("playerId"));

  // Fetch Images from API: GET /players/me/media?mediaType=IMAGE (skip if viewing specific player)
  const { data: imagesResponse, isLoading } = useGetMyPlayerMediaQuery(
    [
      { name: "mediaType", value: "IMAGE" },
      { name: "page", value: "1" },
      { name: "limit", value: "50" },
    ],
    { skip: isViewingSpecificPlayer }
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const apiImages = imagesResponse?.data?.media ?? [];

  const mappedApiImages: MediaItem[] = apiImages.map((item: any) => {
    const hasImage = typeof item.url === "string" && item.url.trim().length > 0;
    return {
      id: item._id,
      title: item.title || "Untitled Image",
      date: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recent",
      views: item.views ?? 0,
      likes: item.likes ?? 0,
      img: hasImage ? item.url.trim() : "/placeholder_img.jpg",
      mediaType: "IMAGE",
    };
  });

  const fallbackImages: MediaItem[] =
    (playerData.playerImage || cvData?.profileImage)
      ? [
          {
            id: "profile-1",
            title: playerData.fullName || "Player Profile Image",
            date: "Recent",
            views: cvData?.profileViews ?? 127,
            likes: cvData?.totalLikes ?? 8,
            img: playerData.playerImage || cvData?.profileImage,
            mediaType: "IMAGE",
          },
        ]
      : [];

  const images: MediaItem[] = mappedApiImages.length > 0 ? mappedApiImages : fallbackImages;

  return (
    <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
      <MediaSection
        title="My Images"
        type="image"
        items={images}
        isLoading={isLoading}
        onUploadClick={editable ? () => setIsUploadModalOpen(true) : undefined}
        onItemClick={(item) =>
          setPreviewMedia({ type: "image", url: item.img, title: item.title })
        }
      />

      {/* Upload Media Modal */}
      {editable && (
        <UploadMediaModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          type="image"
          onStartUpload={startUpload}
        />
      )}

      {/* Lightbox / Image Viewer Modal */}
      <MediaViewerModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};

export default MyImagesSection;
