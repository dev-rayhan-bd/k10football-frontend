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
import { useCoach } from "@/hooks/useCoach";
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

interface CoachImagesSectionProps {
  editable?: boolean;
  coachId?: string;
  userId?: string;
}

export const CoachImagesSection = ({
  editable = false,
  coachId,
  userId,
}: CoachImagesSectionProps) => {
  const { cvData, isViewingSpecificCoach, coachUserId } = useCoach(coachId);
  const { startUpload } = useMediaUpload();

  const effectiveUserId =
    userId ||
    (typeof cvData?.userId === "string" ? cvData.userId : (cvData?.userId as any)?._id) ||
    coachUserId ||
    "";

  // If viewing specific coach, query by that coach's userId.
  // If viewing own CV as logged-in coach, query my media.
  const { data: userImagesResponse, isLoading: isUserLoading } = useGetUserMediaQuery(
    { userId: effectiveUserId, mediaType: "IMAGE", page: 1, limit: 50 },
    { skip: !isViewingSpecificCoach || !effectiveUserId }
  );

  const { data: myImagesResponse, isLoading: isMyLoading } = useGetMyMediaQuery(
    { mediaType: "IMAGE", page: 1, limit: 50 },
    { skip: isViewingSpecificCoach }
  );

  const imagesResponse = isViewingSpecificCoach ? userImagesResponse : myImagesResponse;
  const isLoading = isViewingSpecificCoach ? isUserLoading : isMyLoading;

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
      toast.success("Image title updated");
      setEditingItem(null);
    } catch {
      toast.error("Failed to update image title");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteMedia(deletingItem.id).unwrap();
      toast.success("Image deleted successfully");
      setDeletingItem(null);
    } catch {
      toast.error("Failed to delete image");
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

  const displayImages: MediaItem[] = mappedApiImages;
  const canEdit = editable && !isViewingSpecificCoach;

  return (
    <>
      <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
        <MediaSection
          title={isViewingSpecificCoach ? "Coach Images" : "My Images"}
          type="image"
          items={displayImages}
          onUploadClick={canEdit ? () => setIsUploadModalOpen(true) : undefined}
          onItemClick={(item: any) =>
            setPreviewMedia({ type: "image", url: item.img, title: item.title })
          }
          onEdit={canEdit ? handleEditClick : undefined}
          onDelete={canEdit ? (item: any) => setDeletingItem(item) : undefined}
          isLoading={isLoading}
        />
      </div>

      {/* Edit Title Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Image Title</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="coach-image-title">Title</Label>
              <Input
                id="coach-image-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter title"
                className="bg-white/5 border-white/10 text-white"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !editTitle.trim()}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {isUpdating ? <IconLoader2 className="size-4 animate-spin mr-1" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="sm:max-w-md bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconTrash className="size-5" /> Delete Image
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-gray-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              &quot;{deletingItem?.title}&quot;
            </span>
            ? This action cannot be undone.
          </div>
          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingItem(null)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? <IconLoader2 className="size-4 animate-spin mr-1" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Modal (Only when editable) */}
      {canEdit && (
        <UploadMediaModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          type="image"
          onStartUpload={startUpload}
        />
      )}

      {/* Fullscreen Preview Modal */}
      <MediaViewerModal
        previewMedia={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </>
  );
};

export default CoachImagesSection;
