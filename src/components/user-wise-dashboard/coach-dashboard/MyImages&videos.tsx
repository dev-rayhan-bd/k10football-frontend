/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import React, { useState, useMemo } from "react";
import {
  IconPlayerPlay,
  IconEye,
  IconHeart,
  IconPlus,
  IconUpload,
  IconTrash,
  IconEdit,
  IconShare,
  IconLoader2,
  IconPhoto,
  IconVideo,
  IconAlertCircle,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetMyMediaQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} from "@/redux/features/media/mediaApi";
import { IMediaItem } from "@/types/media.type";
import { toast } from "sonner";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return dateStr;
  }
};

const formatCount = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(num);
};

const MediaCardSkeleton = ({ isVideo }: { isVideo?: boolean }) => (
  <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#111] flex flex-col animate-pulse shadow-md">
    <div className="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
      {isVideo && (
        <div className="size-12 rounded-full bg-white/10 flex items-center justify-center">
          <div className="size-5 rounded-full bg-white/15" />
        </div>
      )}
    </div>
    <div className="p-4 bg-linear-to-b from-[#111] to-[#0D0D0D] flex flex-col gap-2.5">
      <div className="flex flex-col gap-1.5">
        <div className="h-4 w-3/4 rounded-md bg-white/10" />
        <div className="h-2.5 w-1/3 rounded-md bg-white/5" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-3 w-10 rounded bg-white/5" />
          <div className="h-3 w-10 rounded bg-white/5" />
        </div>
        <div className="size-4 rounded bg-white/5" />
      </div>
    </div>
  </div>
);

const MyImagesAndVideos = () => {
  // Queries
  const {
    data: imagesResponse,
    isLoading: isLoadingImages,
  } = useGetMyMediaQuery({ mediaType: "IMAGE", limit: 50 });

  const {
    data: videosResponse,
    isLoading: isLoadingVideos,
  } = useGetMyMediaQuery({ mediaType: "VIDEO", limit: 50 });

  // Mutations
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [updateMedia, { isLoading: isUpdating }] = useUpdateMediaMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  // Modals state
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);
  const [isUploadVideoOpen, setIsUploadVideoOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<IMediaItem | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<IMediaItem | null>(null);
  const [previewMedia, setPreviewMedia] = useState<IMediaItem | null>(null);

  // Upload Image Form state
  const [imageTitle, setImageTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  // Upload Video Form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);
  const [videoThumbnailPreviewUrl, setVideoThumbnailPreviewUrl] = useState<string>("");

  // Edit Title state
  const [editTitle, setEditTitle] = useState("");

  const imagesList = imagesResponse?.data?.media || [];
  const videosList = videosResponse?.data?.media || [];

  // Compute stats
  const stats = useMemo(() => {
    const totalVideos = videosResponse?.data?.meta?.total ?? videosList.length;
    const allMedia = [...imagesList, ...videosList];
    const totalViews = allMedia.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = allMedia.reduce((acc, curr) => acc + (curr.likes || 0), 0);

    // This month count
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthCount = allMedia.filter((item) => {
      if (!item.createdAt) return false;
      const d = new Date(item.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return [
      { label: "Total Videos", value: String(totalVideos), icon: IconPlayerPlay },
      { label: "Total Views", value: formatCount(totalViews), icon: IconEye },
      { label: "Total Likes", value: formatCount(totalLikes), icon: IconHeart },
      { label: "This Month", value: String(thisMonthCount), icon: IconUpload },
    ];
  }, [imagesList, videosList, videosResponse]);

  // Handle Image File selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  // Handle Video File selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file (MP4, MOV, etc.)");
        return;
      }
      setVideoFile(file);
    }
  };

  // Handle Video Thumbnail selection
  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file for thumbnail");
        return;
      }
      setVideoThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setVideoThumbnailPreviewUrl(url);
    }
  };

  // Submit Upload Image
  const handleUploadImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageTitle.trim()) {
      toast.error("Please provide an image title");
      return;
    }
    if (!imageFile) {
      toast.error("Please select an image file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ title: imageTitle.trim() }));
      formData.append("image", imageFile);

      await uploadMedia(formData).unwrap();
      setIsUploadImageOpen(false);
      setImageTitle("");
      setImageFile(null);
      setImagePreviewUrl("");
    } catch {
      // Toast handled by mediaApi
    }
  };

  // Submit Upload Video
  const handleUploadVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      toast.error("Please provide a video title");
      return;
    }
    if (!videoFile) {
      toast.error("Please select a video file to upload");
      return;
    }
    if (!videoThumbnailFile) {
      toast.error("Please select a cover thumbnail image for the video");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ title: videoTitle.trim() }));
      formData.append("video", videoFile);
      formData.append("thumbnail", videoThumbnailFile);

      await uploadMedia(formData).unwrap();
      setIsUploadVideoOpen(false);
      setVideoTitle("");
      setVideoFile(null);
      setVideoThumbnailFile(null);
      setVideoThumbnailPreviewUrl("");
    } catch {
      // Toast handled by mediaApi
    }
  };

  // Open Edit Title Modal
  const handleOpenEdit = (item: IMediaItem) => {
    setEditingMedia(item);
    setEditTitle(item.title || "");
  };

  // Submit Edit Title
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia || !editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await updateMedia({
        mediaId: editingMedia._id,
        title: editTitle.trim(),
      }).unwrap();
      setEditingMedia(null);
      setEditTitle("");
    } catch {
      // Toast handled by mediaApi
    }
  };

  // Submit Delete Media
  const handleDeleteSubmit = async () => {
    if (!deletingMedia) return;

    try {
      await deleteMedia(deletingMedia._id).unwrap();
      setDeletingMedia(null);
    } catch {
      // Toast handled by mediaApi
    }
  };

  // Share link handler
  const handleShare = async (item: IMediaItem) => {
    const shareUrl = item.url;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          url: shareUrl,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Media link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase font-orbitron">
          My Images & Videos
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          Your professional football media gallery
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 sm:p-6 rounded-2xl border border-white/20 bg-[#0D0D0D] group hover:border-[#E31B23]/40 transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-4">
              <div className="size-10 sm:size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-[#E31B23]/10 group-hover:text-[#E31B23] transition-colors shrink-0">
                <stat.icon className="size-5" />
              </div>
              <div>
                {isLoadingImages && isLoadingVideos ? (
                  <div className="h-8 w-16 rounded-md bg-white/10 animate-pulse my-1" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-black text-white italic mb-1 font-orbitron truncate">
                    {stat.value}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] truncate">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {/* MY IMAGES SECTION */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <IconPhoto className="size-5 sm:size-6 text-[#00FF85]" />
                <h2 className="text-lg sm:text-xl font-bold text-white italic uppercase tracking-tight font-orbitron">
                  My Images
                </h2>
                <span className="text-xs font-bold text-white/40 font-mono">
                  ({imagesList.length})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Match highlights & training captures
              </p>
            </div>

            <button
              onClick={() => {
                setImageTitle("");
                setImageFile(null);
                setImagePreviewUrl("");
                setIsUploadImageOpen(true);
              }}
              className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm hover:scale-102"
            >
              <IconPlus size={16} className="shrink-0 text-[#00FF85]" />
              <span>Upload Image</span>
            </button>
          </div>

          {isLoadingImages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <MediaCardSkeleton key={`img-skeleton-${i}`} isVideo={false} />
              ))}
            </div>
          ) : imagesList.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                <IconPhoto size={24} />
              </div>
              <p className="text-sm font-bold text-white/70">No images uploaded yet</p>
              <p className="text-xs text-white/40 max-w-sm">
                Upload your match photos and training images to show scouts and clubs your progress.
              </p>
              <button
                onClick={() => {
                  setImageTitle("");
                  setImageFile(null);
                  setImagePreviewUrl("");
                  setIsUploadImageOpen(true);
                }}
                className="mt-2 text-xs font-bold uppercase tracking-wider text-[#00FF85] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <IconPlus size={14} />
                <span>Upload First Image</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {imagesList.map((item) => (
                <div
                  key={item._id}
                  className="group relative rounded-2xl overflow-hidden border border-white/15 bg-[#111] hover:border-white/30 transition-all duration-300 flex flex-col shadow-lg"
                >
                  <div
                    onClick={() => setPreviewMedia(item)}
                    className="relative aspect-video overflow-hidden cursor-pointer bg-black/40"
                  >
                    <Image
                      src={item.url}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/placeholder_img.jpg";
                      }}
                    />

                    {/* Hover Action Buttons */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2.5 right-2.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
                    >
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit title"
                        className="size-8 rounded-lg bg-black/75 hover:bg-[#E31B23] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingMedia(item)}
                        title="Delete image"
                        className="size-8 rounded-lg bg-black/75 hover:bg-red-600 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-linear-to-b from-[#111] to-[#0D0D0D] flex flex-col gap-2.5">
                    <div className="flex flex-col">
                      <h4
                        className="text-sm font-bold text-white truncate"
                        title={item.title}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <IconEye size={13} />
                          <span>{item.views ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <IconHeart size={13} className="text-[#E31B23]" />
                          <span>{item.likes ?? 0}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShare(item)}
                        title="Share media"
                        className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <IconShare size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY VIDEOS SECTION */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <IconVideo className="size-5 sm:size-6 text-[#E31B23]" />
                <h2 className="text-lg sm:text-xl font-bold text-white italic uppercase tracking-tight font-orbitron">
                  My Videos
                </h2>
                <span className="text-xs font-bold text-white/40 font-mono">
                  ({videosList.length})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Match highlights & training video clips
              </p>
            </div>

            <button
              onClick={() => {
                setVideoTitle("");
                setVideoFile(null);
                setVideoThumbnailFile(null);
                setVideoThumbnailPreviewUrl("");
                setIsUploadVideoOpen(true);
              }}
              className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm hover:scale-102"
            >
              <IconUpload size={16} className="shrink-0 text-[#E31B23]" />
              <span>Upload Video</span>
            </button>
          </div>

          {isLoadingVideos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <MediaCardSkeleton key={`vid-skeleton-${i}`} isVideo={true} />
              ))}
            </div>
          ) : videosList.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                <IconVideo size={24} />
              </div>
              <p className="text-sm font-bold text-white/70">No videos uploaded yet</p>
              <p className="text-xs text-white/40 max-w-sm">
                Upload your video clips with a custom thumbnail image to showcase drills and match highlights.
              </p>
              <button
                onClick={() => {
                  setVideoTitle("");
                  setVideoFile(null);
                  setVideoThumbnailFile(null);
                  setVideoThumbnailPreviewUrl("");
                  setIsUploadVideoOpen(true);
                }}
                className="mt-2 text-xs font-bold uppercase tracking-wider text-[#E31B23] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <IconUpload size={14} />
                <span>Upload First Video</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videosList.map((item) => (
                <div
                  key={item._id}
                  className="group relative rounded-2xl overflow-hidden border border-white/15 bg-[#111] hover:border-white/30 transition-all duration-300 flex flex-col shadow-lg"
                >
                  <div
                    onClick={() => setPreviewMedia(item)}
                    className="relative aspect-video overflow-hidden cursor-pointer bg-black/60"
                  >
                    <Image
                      src={item.thumbnailUrl || item.url || "/placeholder_img.jpg"}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/placeholder_img.jpg";
                      }}
                    />

                    {/* Big Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15 transition-colors">
                      <div className="size-12 rounded-full bg-[#E31B23] flex items-center justify-center shadow-[0_0_25px_rgba(227,27,35,0.5)] group-hover:scale-110 transition-transform">
                        <IconPlayerPlay size={22} className="text-white fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Hover Action Buttons */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2.5 right-2.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
                    >
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit title"
                        className="size-8 rounded-lg bg-black/75 hover:bg-[#E31B23] backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingMedia(item)}
                        title="Delete video"
                        className="size-8 rounded-lg bg-black/75 hover:bg-red-600 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-linear-to-b from-[#111] to-[#0D0D0D] flex flex-col gap-2.5">
                    <div className="flex flex-col">
                      <h4
                        className="text-sm font-bold text-white truncate"
                        title={item.title}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <IconEye size={13} />
                          <span>{item.views ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <IconHeart size={13} className="text-[#E31B23]" />
                          <span>{item.likes ?? 0}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShare(item)}
                        title="Share media"
                        className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <IconShare size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Upload Image Modal */}
      <Dialog open={isUploadImageOpen} onOpenChange={setIsUploadImageOpen}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl sm:rounded-3xl max-w-lg w-[92vw] sm:w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-2.5">
              <IconPhoto className="text-[#00FF85] size-6 shrink-0" />
              <span>Upload Image</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUploadImageSubmit} className="flex flex-col gap-5 mt-2">
            {/* Title Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Image Title <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="e.g. Training Highlights 2026"
                className="w-full h-11 bg-white/3 border border-white/15 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF85]/50 transition-all"
                required
              />
            </div>

            {/* Image File Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Choose Image File <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-[#00FF85]/50 rounded-2xl p-4 sm:p-6 bg-white/[0.02] flex flex-col items-center justify-center gap-3 transition-colors text-center group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!imageFile}
                />

                {imagePreviewUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={imagePreviewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
                        Click to change image
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#00FF85] transition-colors">
                      <IconPhoto size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Click or drag & drop image</p>
                      <p className="text-xs text-white/40 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadImageOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !imageTitle.trim() || !imageFile}
                className={cn(
                  "w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  !isUploading && imageTitle.trim() && imageFile
                    ? "bg-[#00FF85] hover:bg-[#00E577] text-black shadow-[0_0_15px_rgba(0,255,133,0.3)] cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Image</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Upload Video Modal */}
      <Dialog open={isUploadVideoOpen} onOpenChange={setIsUploadVideoOpen}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl sm:rounded-3xl max-w-lg w-[92vw] sm:w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-2.5">
              <IconVideo className="text-[#E31B23] size-6 shrink-0" />
              <span>Upload Video</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUploadVideoSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2">
            {/* Title Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Video Title <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. Best Dribbling Goals 2026"
                className="w-full h-11 bg-white/3 border border-white/15 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23]/50 transition-all"
                required
              />
            </div>

            {/* Video File Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Select Video File <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-[#E31B23]/50 rounded-2xl p-4 bg-white/[0.02] flex flex-col items-center justify-center gap-2 text-center transition-colors group cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!videoFile}
                />
                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#E31B23] transition-colors">
                  <IconVideo size={20} />
                </div>
                {videoFile ? (
                  <div className="flex flex-col items-center max-w-full px-2">
                    <span className="text-xs font-bold text-white truncate max-w-xs">
                      {videoFile.name}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-white">Click or drag & drop video</p>
                    <p className="text-[10px] text-white/40 mt-0.5">MP4, MOV, WebM</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Thumbnail Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center justify-between">
                <span>Cover Thumbnail <span className="text-[#E31B23]">*</span></span>
                <span className="text-[10px] text-[#00FF85] font-semibold">Required for Video</span>
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-[#00FF85]/50 rounded-2xl p-4 bg-white/[0.02] flex flex-col items-center justify-center gap-2 text-center transition-colors group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!videoThumbnailFile}
                />

                {videoThumbnailPreviewUrl ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/10">
                    <Image
                      src={videoThumbnailPreviewUrl}
                      alt="Thumbnail Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-lg border border-white/20">
                        Change Thumbnail
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#00FF85] transition-colors">
                      <IconPhoto size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Select video cover image</p>
                      <p className="text-[10px] text-white/40 mt-0.5">PNG, JPG, WEBP</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadVideoOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !videoTitle.trim() || !videoFile || !videoThumbnailFile}
                className={cn(
                  "w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  !isUploading && videoTitle.trim() && videoFile && videoThumbnailFile
                    ? "bg-[#E31B23] hover:bg-[#ff2d35] text-white shadow-[0_0_15px_rgba(227,27,35,0.3)] cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Video</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Edit Media Title Modal */}
      <Dialog open={!!editingMedia} onOpenChange={(open) => !open && setEditingMedia(null)}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl sm:rounded-3xl max-w-md w-[92vw] sm:w-full p-5 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-2.5">
              <IconEdit className="text-[#00FF85] size-5 shrink-0" />
              <span>Edit Media Title</span>
            </DialogTitle>
          </DialogHeader>

          {editingMedia && (
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-2">
              {/* Media Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/10">
                <div className="size-14 rounded-lg overflow-hidden relative border border-white/10 bg-black/50 shrink-0">
                  <Image
                    src={editingMedia.thumbnailUrl || editingMedia.url || "/placeholder_img.jpg"}
                    alt={editingMedia.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#00FF85] tracking-wider">
                    {editingMedia.mediaType || "MEDIA"}
                  </span>
                  <span className="text-xs text-white/50 truncate">
                    Uploaded: {formatDate(editingMedia.createdAt)}
                  </span>
                </div>
              </div>

              {/* Title Field */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter new title..."
                  className="w-full h-11 bg-white/3 border border-white/15 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF85]/50 transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editTitle.trim()}
                  className={cn(
                    "w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                    !isUpdating && editTitle.trim()
                      ? "bg-[#00FF85] hover:bg-[#00E577] text-black shadow-[0_0_15px_rgba(0,255,133,0.3)] cursor-pointer"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  )}
                >
                  {isUpdating ? (
                    <>
                      <IconLoader2 className="animate-spin size-4" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Delete Confirmation Dialog */}
      <Dialog open={!!deletingMedia} onOpenChange={(open) => !open && setDeletingMedia(null)}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl sm:rounded-3xl max-w-md w-[92vw] sm:w-full p-5 sm:p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <IconAlertCircle size={28} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
                Delete Media Item?
              </h3>
              <p className="text-xs text-white/60 max-w-xs">
                Are you sure you want to delete &quot;<span className="text-white font-bold">{deletingMedia?.title}</span>&quot;? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full mt-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Media</span>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: Preview Lightbox / Video Player Modal */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="bg-[#0A0A0A] border border-white/20 text-white rounded-2xl sm:rounded-3xl max-w-4xl w-[94vw] sm:w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
          {previewMedia && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {previewMedia.title}
                  </h3>
                  <span className="text-[10px] text-white/50 uppercase font-semibold">
                    {previewMedia.mediaType} • {formatDate(previewMedia.createdAt)}
                  </span>
                </div>
              </div>

              {previewMedia.mediaType === "VIDEO" ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    src={previewMedia.url}
                    controls
                    autoPlay
                    className="size-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="relative max-h-[70vh] w-full flex items-center justify-center rounded-xl overflow-hidden bg-black/60">
                  <Image
                    src={previewMedia.url}
                    alt={previewMedia.title}
                    width={1200}
                    height={800}
                    className="max-h-[70vh] w-auto object-contain rounded-xl"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyImagesAndVideos;
