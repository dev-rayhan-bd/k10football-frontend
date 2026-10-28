"use client";

import React, { useState } from "react";
import { useClubPlayerCv } from "./ClubPlayerCvContext";
import {
  MediaItem,
  PreviewMedia,
  MediaSection,
  MediaViewerModal,
} from "@/components/user-wise-dashboard/player-dashboard/images-videos";

export const ClubMyImageSection = () => {
  const { playerData, cvData } = useClubPlayerCv();
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const images: MediaItem[] = [
    {
      id: "profile-1",
      title: playerData.fullName ? `${playerData.fullName} - Official Profile` : "Official Profile",
      date: "Verified",
      views: cvData?.profileViews ?? 127,
      likes: cvData?.totalLikes ?? 8,
      img: playerData.profileImage || playerData.playerImage || "/placeholder_img.jpg",
      mediaType: "IMAGE",
    },
  ];

  return (
    <div className="mt-10 min-w-0 overflow-hidden">
      <MediaSection
        title="Player Gallery"
        type="image"
        items={images}
        isLoading={false}
        onItemClick={(item) =>
          setPreviewMedia({ type: "image", url: item.img, title: item.title })
        }
      />

      <MediaViewerModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};
