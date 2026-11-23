/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  IconPlayerPlay,
  IconEye,
  IconHeart,
  IconUpload,
  IconLoader2,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import {
  useGetMyMediaQuery,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} from "@/redux/features/media/mediaApi";
import { useMediaUpload } from "@/providers/MediaUploadProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MediaItem,
  MediaStat,
  PreviewMedia,
  UploadMediaType,
  MediaStatsHeader,
  MediaSection,
  UploadMediaModal,
  MediaViewerModal,
} from "./images-videos";
import { toast } from "sonner";

const PlayerImagesAndVideos = () => {
  // Global Upload Context
  const { startUpload } = useMediaUpload();

  // Fetch Images from API: GET /media/me?mediaType=IMAGE
  const {
    data: imagesResponse,
    isLoading: isImagesLoading,
  } = useGetMyMediaQuery({ mediaType: "IMAGE", limit: 50 });

  // Fetch Videos from API: GET /media/me?mediaType=VIDEO
  const {
    data: videosResponse,
    isLoading: isVideosLoading,
  } = useGetMyMediaQuery({ mediaType: "VIDEO", limit: 50 });

  // CRUD Mutations
  const [updateMedia, { isLoading: isUpdating }] = useUpdateMediaMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  // Modal States
  const [uploadModalType, setUploadModalType] = useState<UploadMediaType>("image");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  // Edit / Delete states
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);

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
      img: hasThumbnail ? item.thumbnailUrl.trim() : (item.url || "/placeholder_img.jpg"),
      videoUrl: item.url,
      mediaType: "VIDEO",
      hasThumbnail,
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

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;

    try {
      await updateMedia({ mediaId: editingItem.id, title: editTitle.trim() }).unwrap();
      setEditingItem(null);
      setEditTitle("");
    } catch {
      // Error handled by mediaApi toast
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await deleteMedia(deletingItem.id).unwrap();
      setDeletingItem(null);
    } catch {
      // Error handled by mediaApi toast
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-16">

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
          onEdit={handleOpenEdit}
          onDelete={(item) => setDeletingItem(item)}
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
          onEdit={handleOpenEdit}
          onDelete={(item) => setDeletingItem(item)}
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

      {/* Edit Title Dialog */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-[#161616] border border-white/20 text-white rounded-2xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <IconPencil size={18} className="text-[#E31B23]" />
              Edit Media Title
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-title" className="text-xs text-white/60 font-semibold uppercase">
                Title
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter new title..."
                className="bg-white/5 border-white/10 text-white rounded-xl focus-visible:border-[#E31B23]"
                autoFocus
                required
              />
            </div>
            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingItem(null)}
                className="text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !editTitle.trim()}
                className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                {isUpdating ? <IconLoader2 size={16} className="animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="bg-[#161616] border border-white/20 text-white rounded-2xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <IconTrash size={18} className="text-red-500" />
              Delete Media
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/70 mt-1">
            Are you sure you want to delete &quot;{deletingItem?.title}&quot;? This action cannot be undone.
          </p>
          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingItem(null)}
              className="text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              {isDeleting ? <IconLoader2 size={16} className="animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerImagesAndVideos;
