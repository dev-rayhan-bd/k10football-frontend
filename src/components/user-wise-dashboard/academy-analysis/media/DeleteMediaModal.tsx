"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import { useDeleteMediaMutation } from "@/redux/features/media/mediaApi";
import { IMediaItem } from "@/types/media.type";

interface DeleteMediaModalProps {
  item: IMediaItem | null;
  onClose: () => void;
}

export const DeleteMediaModal = ({ item, onClose }: DeleteMediaModalProps) => {
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  if (!item) return null;

  const handleDelete = async () => {
    try {
      await deleteMedia(item._id).unwrap();
      onClose();
    } catch {
      // Handled centrally by mediaApi
    }
  };

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-md p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
              <IconAlertTriangle size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
                Delete Media
              </DialogTitle>
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-white/70 mt-2">
          Are you sure you want to delete{" "}
          <span className="font-bold text-white uppercase font-orbitron">
            &ldquo;{item.title || "this media item"}&rdquo;
          </span>
          ? It will be permanently removed from your gallery.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="font-bold min-w-28"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <IconLoader2 size={16} className="animate-spin" />
                Deleting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <IconTrash size={16} />
                Delete
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMediaModal;
