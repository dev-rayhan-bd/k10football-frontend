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

const MyImagesSection = ({ editable = true }: { editable?: boolean }) => {
  const { startUpload } = useMediaUpload();

  // Fetch Images from API: GET /media/me?mediaType=IMAGE
  const { data: imagesResponse, isLoading } = useGetMyMediaQuery({
    mediaType: "IMAGE",
    page: 1,
    limit: 50,
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const apiImages = imagesResponse?.data?.media ?? [];

  const images: MediaItem[] = apiImages.map((item: any) => {
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

      {/* Lightbox Modal */}
      <MediaViewerModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};

export default MyImagesSection;
