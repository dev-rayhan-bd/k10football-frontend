/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  useGetMyMediaQuery,
  useGetUserMediaQuery,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} from "@/redux/features/media/mediaApi";
import { useMediaUpload } from "@/providers/MediaUploadProvider";
import {
  MediaItem,
  PreviewMedia,
  MediaSection,
  UploadMediaModal,
  MediaViewerModal,
} from "@/components/user-wise-dashboard/player-dashboard/images-videos";
import { usePlayer } from "@/hooks/usePlayer";
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
import { IconTrash, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface MyImagesSectionProps {
  editable?: boolean;
  playerId?: string;
}

const MyImagesSection = ({ editable = true, playerId }: MyImagesSectionProps) => {
  const { cvData, playerData } = usePlayer();
  const { startUpload } = useMediaUpload();

  const queryPlayerId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("playerId")
      : null;
  const targetPlayerId = playerId || queryPlayerId || "";
  const isViewingSpecificPlayer = Boolean(targetPlayerId);

  // Fetch current user's images
  const { data: myImagesResponse, isLoading: isMyLoading } = useGetMyMediaQuery(
    { mediaType: "IMAGE", page: 1, limit: 50 },
    { skip: isViewingSpecificPlayer }
  );

  // Fetch another player's public images if viewing specific player
  const { data: userImagesResponse, isLoading: isUserLoading } = useGetUserMediaQuery(
    { userId: targetPlayerId, mediaType: "IMAGE", page: 1, limit: 50 },
    { skip: !isViewingSpecificPlayer }
  );

  const imagesResponse = isViewingSpecificPlayer ? userImagesResponse : myImagesResponse;
  const isLoading = isViewingSpecificPlayer ? isUserLoading : isMyLoading;

  // Mutations
  const [updateMedia, { isLoading: isUpdating }] = useUpdateMediaMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  // Edit & Delete state
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);

  const handleEditClick = (item: MediaItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;
    try {
      await updateMedia({ mediaId: editingItem.id, title: editTitle.trim() }).unwrap();
      toast.success("Media title updated");
      setEditingItem(null);
    } catch {
      toast.error("Failed to update media title");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMedia(deletingItem.id).unwrap();
      toast.success("Media deleted successfully");
      setDeletingItem(null);
    } catch {
      toast.error("Failed to delete media");
    }
  };

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
        onEdit={editable ? handleEditClick : undefined}
        onDelete={editable ? (item) => setDeletingItem(item) : undefined}
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

      {/* Edit Title Dialog */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-[#161616] border border-white/20 text-white rounded-2xl p-6 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              Edit Media Title
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-title-img" className="text-xs text-white/60 font-semibold uppercase">
                Title
              </Label>
              <Input
                id="edit-title-img"
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
              <IconTrash size={18} className="text-destructive" />
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
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              {isDeleting ? <IconLoader2 size={16} className="animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyImagesSection;
