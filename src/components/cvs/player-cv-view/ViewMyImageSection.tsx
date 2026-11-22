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

export const ViewMyImageSection = () => {
  const { playerData } = usePlayerCvView();
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const targetUserId = playerData.userId || playerData.id || "";

  const { data: userImagesResponse, isLoading } = useGetUserMediaQuery(
    { userId: targetUserId, mediaType: "IMAGE", page: 1, limit: 50 },
    { skip: !targetUserId }
  );

  const images: MediaItem[] = useMemo(() => {
    const rawMedia = Array.isArray(userImagesResponse?.data?.media)
      ? userImagesResponse.data.media
      : Array.isArray(userImagesResponse?.data)
        ? (userImagesResponse.data as any[])
        : [];

    return rawMedia.map((item: any) => {
      const hasImage = typeof item.url === "string" && item.url.trim().length > 0;
      return {
        id: item._id || item.id,
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
  }, [userImagesResponse]);

  return (
    <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
      <MediaSection
        title="Player Gallery"
        type="image"
        items={images}
        isLoading={isLoading}
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
