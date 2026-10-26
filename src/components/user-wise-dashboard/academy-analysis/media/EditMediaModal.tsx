"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import { useUpdateMediaMutation } from "@/redux/features/media/mediaApi";
import { IMediaItem } from "@/types/media.type";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EditMediaModalProps {
  item: IMediaItem | null;
  onClose: () => void;
}

export const EditMediaModal = ({ item, onClose }: EditMediaModalProps) => {
  const [updateMedia, { isLoading: isUpdating }] = useUpdateMediaMutation();
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setError(false);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!title.trim()) {
      setError(true);
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await updateMedia({
        mediaId: item._id,
        title: title.trim(),
      }).unwrap();
      onClose();
    } catch {
      // Handled centrally by mediaApi
    }
  };

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-md p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
            Edit Media Title
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter new title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error && e.target.value.trim()) setError(false);
              }}
              className={cn(
                "w-full h-12 bg-white/5 border rounded-xl px-4 text-sm font-bold text-white focus:outline-none transition-colors",
                error
                  ? "border-destructive focus:border-destructive"
                  : "border-white/10 focus:border-primary"
              )}
            />
            {error && (
              <span className="text-[11px] text-destructive font-medium">
                Title cannot be empty
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
              className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              {isUpdating ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconCheck size={16} />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMediaModal;
