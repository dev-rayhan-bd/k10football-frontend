/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  IconPlayerPlay,
  IconEye,
  IconHeart,
  IconUpload,
} from "@tabler/icons-react";
import { useGetMyPlayerMediaQuery } from "@/redux/features/player/playerApi";
import { useMediaUpload } from "@/providers/MediaUploadProvider";
import {
  MediaItem,
  MediaStat,
  PreviewMedia,
  UploadMediaType,
  MediaStatsHeader,
  MediaSection,
  UploadMediaModal,
  MediaViewerModal,
  MediaUploadProgressWidget,
} from "./images-videos";

const PlayerImagesAndVideos = () => {
  // Global Upload Context
  const { activeUploadTask, startUpload, cancelUpload, dismissUpload } = useMediaUpload();

  // Fetch Images from API
  const {
    data: imagesResponse,
    isLoading: isImagesLoading,
  } = useGetMyPlayerMediaQuery([
    { name: "mediaType", value: "IMAGE" },
    { name: "page", value: "1" },
    { name: "limit", value: "50" },
  ]);

  // Fetch Videos from API
  const {
    data: videosResponse,
    isLoading: isVideosLoading,
  } = useGetMyPlayerMediaQuery([
    { name: "mediaType", value: "VIDEO" },
    { name: "page", value: "1" },
    { name: "limit", value: "50" },
  ]);

  // Modal States
  const [uploadModalType, setUploadModalType] = useState<UploadMediaType>("image");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  // Format data from API responses
  const apiImages = imagesResponse?.data?.media ?? [];
  const apiVideos = videosResponse?.data?.media ?? [];

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

  const videos: MediaItem[] = apiVideos.map((item: any) => {
    const hasThumbnail = typeof item.thumbnailUrl === "string" && item.thumbnailUrl.trim().length > 0;
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
      img: hasThumbnail ? item.thumbnailUrl.trim() : "/placeholder_img.jpg",
      videoUrl: item.url,
      mediaType: "VIDEO",
    };
  });

  // Calculate live stats
  const totalVideos = videosResponse?.data?.meta?.total ?? apiVideos.length;
  const totalImages = imagesResponse?.data?.meta?.total ?? apiImages.length;
  const totalViews = [...apiImages, ...apiVideos].reduce((sum: number, it: any) => sum + (it.views || 0), 0);
  const totalLikes = [...apiImages, ...apiVideos].reduce((sum: number, it: any) => sum + (it.likes || 0), 0);

  const stats: MediaStat[] = [
    { label: "Total Videos", value: totalVideos.toString(), icon: IconPlayerPlay },
    {
      label: "Total Views",
      value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews.toString(),
      icon: IconEye,
    },
    {
      label: "Total Likes",
      value: totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(1)}k` : totalLikes.toString(),
      icon: IconHeart,
    },
    { label: "Total Images", value: totalImages.toString(), icon: IconUpload },
  ];

  const handleOpenUploadModal = (type: UploadMediaType) => {
    setUploadModalType(type);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Live Upload Percentage Widget (Above Header Cards) */}
      {activeUploadTask && (
        <MediaUploadProgressWidget
          task={activeUploadTask}
          onCancel={cancelUpload}
          onDismiss={dismissUpload}
        />
      )}

      {/* Header & Stats */}
      <MediaStatsHeader stats={stats} />

      {/* Media Sections */}
      <div className="flex flex-col gap-12">
        {/* Images Section */}
        <MediaSection
          title="My Images"
          type="image"
          items={images}
          isLoading={isImagesLoading}
          onUploadClick={() => handleOpenUploadModal("image")}
          onItemClick={(item) =>
            setPreviewMedia({ type: "image", url: item.img, title: item.title })
          }
        />

        {/* Videos Section */}
        <MediaSection
          title="My Videos"
          type="video"
          items={videos}
          isLoading={isVideosLoading}
          onUploadClick={() => handleOpenUploadModal("video")}
          onItemClick={(item) =>
            setPreviewMedia({
              type: "video",
              url: item.videoUrl || item.img,
              title: item.title,
            })
          }
        />
      </div>

      {/* Upload Media Modal (Image & Video) */}
      <UploadMediaModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        type={uploadModalType}
        onStartUpload={startUpload}
      />

      {/* Lightbox / Video Viewer Modal */}
      <MediaViewerModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </div>
  );
};

export default PlayerImagesAndVideos;
