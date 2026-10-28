"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  IconUpload,
  IconX,
  IconVideo,
  IconPhoto,
  IconLoader2,
  IconMovie,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUploadMediaMutation } from "@/redux/features/media/mediaApi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UploadStartPayload } from "@/components/user-wise-dashboard/player-dashboard/images-videos";
import TagTypes from "@/constants/tagType.constant";

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartUpload?: (payload: UploadStartPayload) => void;
}

export const UploadVideoModal = ({
  isOpen,
  onClose,
  onStartUpload,
}: UploadVideoModalProps) => {
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("");

  const [titleError, setTitleError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreviewUrl("");
    setTitleError(false);
    setVideoError(false);
    setThumbnailError(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("video/")) {
        toast.error("Please select a valid video file (MP4, WebM, MOV)");
        return;
      }
      if (selected.size > 100 * 1024 * 1024) {
        toast.error("Video file size is too large. Max 100MB allowed.");
        return;
      }
      setVideoFile(selected);
      setVideoError(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        toast.error("Please select an image file for the thumbnail (JPG, PNG)");
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast.error("Thumbnail file is too large. Max 10MB allowed.");
        return;
      }
      setThumbnailFile(selected);
      setThumbnailError(false);
      const url = URL.createObjectURL(selected);
      setThumbnailPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      toast.error("Please enter a video title");
      hasError = true;
    }
    if (!videoFile) {
      setVideoError(true);
      if (!hasError) {
        toast.error("Please select a video file");
      }
      hasError = true;
    }
    if (!thumbnailFile) {
      setThumbnailError(true);
      if (!hasError) {
        toast.error("Please select a cover thumbnail image");
      }
      hasError = true;
    }

    if (hasError) return;

    const formData = new FormData();
    formData.append("data", JSON.stringify({ title: title.trim() }));
    formData.append("video", videoFile!);
    formData.append("thumbnail", thumbnailFile!);

    // If background upload handler provided, delegate and close immediately
    if (onStartUpload) {
      onStartUpload({
        formData,
        title: title.trim(),
        fileName: videoFile!.name,
        type: "video",
        thumbnailPreview: thumbnailPreviewUrl,
        endpoint: "/media/upload",
        tagsToInvalidate: [TagTypes.MEDIA],
      });
      handleClose();
      return;
    }

    try {
      await uploadMedia(formData).unwrap();
      handleClose();
    } catch {
      // Error toast is handled centrally by mediaApi
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">
            Upload Video
          </DialogTitle>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
            Add match highlights or drill clips
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
              Video Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. vs Arsenal U19 Highlights"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError && e.target.value.trim()) {
                  setTitleError(false);
                }
              }}
              className={cn(
                "w-full h-12 bg-white/5 border rounded-xl px-4 text-sm font-bold text-white focus:outline-none transition-colors placeholder:text-gray-600",
                titleError
                  ? "border-destructive focus:border-destructive"
                  : "border-white/10 focus:border-primary"
              )}
            />
            {titleError && (
              <span className="text-[11px] text-destructive font-medium">
                Title is required
              </span>
            )}
          </div>

          {/* Video File Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
              Video Clip <span className="text-destructive">*</span>
            </label>

            {videoFile ? (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <IconMovie size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {videoFile.name}
                    </p>
                    <p className="text-[10px] text-white/40 font-mono">
                      {formatFileSize(videoFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVideoFile(null);
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }}
                  className="text-white/60 hover:text-white shrink-0"
                >
                  <IconX size={16} />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => videoInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/[0.02]",
                  videoError
                    ? "border-destructive bg-destructive/10"
                    : "border-white/15 hover:border-primary hover:bg-white/[0.04]"
                )}
              >
                <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                  <IconVideo size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Select video file
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    MP4, WebM, MOV up to 100MB
                  </p>
                </div>
              </div>
            )}

            {videoError && (
              <span className="text-[11px] text-destructive font-medium">
                Please select a video file
              </span>
            )}

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
            />
          </div>

          {/* Thumbnail Cover Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
              Cover Thumbnail <span className="text-destructive">*</span>
            </label>

            {thumbnailPreviewUrl ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black/40 group">
                <Image
                  src={thumbnailPreviewUrl}
                  alt="Thumbnail Preview"
                  fill
                  unoptimized
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Change Thumbnail
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreviewUrl("");
                      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
                    }}
                  >
                    <IconX size={14} className="mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/[0.02]",
                  thumbnailError
                    ? "border-destructive bg-destructive/10"
                    : "border-white/15 hover:border-primary hover:bg-white/[0.04]"
                )}
              >
                <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                  <IconPhoto size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Select cover image
                  </p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    JPG or PNG for video poster
                  </p>
                </div>
              </div>
            )}

            {thumbnailError && (
              <span className="text-[11px] text-destructive font-medium">
                Please select a cover thumbnail image
              </span>
            )}

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 min-w-32 cursor-pointer"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 size={16} className="animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconUpload size={16} />
                  Upload Video
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadVideoModal;
