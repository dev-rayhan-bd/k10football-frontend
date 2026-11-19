"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  IconPhoto,
  IconVideo,
  IconX,
  IconUpload,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadMediaMutation } from "@/redux/features/media/mediaApi";
import TagTypes from "@/constants/tagType.constant";
import { ErrorToast } from "@/helpers/ValidationHelper";
import { UploadMediaType, UploadStartPayload } from "./types";

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: UploadMediaType;
  onStartUpload?: (payload: UploadStartPayload) => void;
}

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  isOpen,
  onClose,
  type,
  onStartUpload,
}) => {
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

  // Form States
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Thumbnail States
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setSelectedFile(null);
    setSelectedThumbnailFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }
    setPreviewUrl(null);
    setThumbnailPreviewUrl(null);
  };

  const handleClose = (open: boolean) => {
    if (!isUploading) {
      if (!open) {
        resetForm();
        onClose();
      }
    }
  };

  const handleFile = (file: File) => {
    if (type === "image") {
      if (!file.type.startsWith("image/")) {
        ErrorToast("Please select a valid image file");
        return;
      }
    } else {
      if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
        ErrorToast("Please select a valid video file (MP4, MOV, WEBM)");
        return;
      }
    }

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        ErrorToast("Please select a valid image file for thumbnail");
        return;
      }
      setSelectedThumbnailFile(file);
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      ErrorToast(`Please enter a ${type} title`);
      return;
    }
    if (!selectedFile) {
      ErrorToast(`Please select a ${type} file to upload`);
      return;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify({ title: title.trim() }));

    if (type === "image") {
      formData.append("image", selectedFile);
    } else {
      formData.append("video", selectedFile);
      if (selectedThumbnailFile) {
        formData.append("thumbnail", selectedThumbnailFile);
      }
    }

    if (onStartUpload) {
      onStartUpload({
        formData,
        title: title.trim(),
        fileName: selectedFile.name,
        type,
        thumbnailPreview: type === "video" ? thumbnailPreviewUrl : previewUrl,
        endpoint: "/media/upload",
        tagsToInvalidate: [TagTypes.MEDIA, TagTypes.PLAYERS],
      });
      resetForm();
      onClose();
      return;
    }

    try {
      await uploadMedia(formData).unwrap();
      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Upload failed", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#161616] border-2 border-white/30 text-white rounded-3xl p-6 sm:p-8 max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <DialogHeader className="text-left flex flex-col gap-1 pb-3 border-b border-white/15">
          <DialogTitle className="text-xl sm:text-2xl font-black uppercase italic tracking-tight font-orbitron text-white">
            Upload <span className="text-[#E31B23]">{type === "image" ? "Image" : "Video"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            {type === "image"
              ? "Add your match highlights or training session photo to your profile."
              : "Add your match clip or training session video to your profile."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          {/* Title Field */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="media-title"
              className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
            >
              {type === "image" ? "Image Title" : "Video Title"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="media-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "image" ? "e.g. vs Arsenal U19 - Final Match" : "e.g. Best Dribbling Goals 2026"}
              disabled={isUploading}
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40"
            />
          </div>

          {/* Media Upload Area */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
              Select {type === "image" ? "Photo" : "Video Clip"} <span className="text-red-500">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={type === "image" ? "image/*" : "video/mp4,video/quicktime,video/mov,video/*"}
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {previewUrl ? (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 group bg-black/60">
                {type === "image" ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                ) : (
                  <video src={previewUrl} controls className="size-full object-cover" />
                )}

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-white/20 bg-black/70 text-white hover:bg-black/90 rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-xs"
                  >
                    {type === "image" ? <IconPhoto className="size-4" /> : <IconVideo className="size-4" />}
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                    disabled={isUploading}
                    className="rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-xs"
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                  {type === "image" ? (
                    <IconPhoto className="size-6 text-[#E31B23]" />
                  ) : (
                    <IconVideo className="size-6 text-[#E31B23]" />
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-gray-200">
                    Click to browse or drag & drop {type === "image" ? "photo" : "video"}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-orbitron">
                    {type === "image" ? "PNG, JPG, WEBP (Max 10MB)" : "MP4, MOV, WEBM (Max 100MB)"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Optional Thumbnail Upload for Videos */}
          {type === "video" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                  Video Thumbnail Cover <span className="text-gray-500 font-normal lowercase">(optional)</span>
                </Label>
                {selectedThumbnailFile && (
                  <Badge variant="secondary" className="text-[10px] uppercase font-orbitron py-0.5">
                    Selected
                  </Badge>
                )}
              </div>

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                disabled={isUploading}
              />

              {thumbnailPreviewUrl ? (
                <div className="relative aspect-video max-h-40 w-full rounded-2xl overflow-hidden border border-white/15 group bg-black/60">
                  <Image src={thumbnailPreviewUrl} alt="Thumbnail Preview" fill className="object-cover" />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={isUploading}
                      className="border-white/20 bg-black/70 text-white hover:bg-black/90 rounded-xl text-xs h-8 px-2.5 flex items-center gap-1.5 backdrop-blur-xs"
                    >
                      <IconPhoto className="size-3.5" />
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedThumbnailFile(null);
                        if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                        setThumbnailPreviewUrl(null);
                      }}
                      disabled={isUploading}
                      className="rounded-xl size-8 p-0 flex items-center justify-center backdrop-blur-xs"
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 sm:size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                      <IconPhoto className="size-5 text-[#E31B23]" />
                    </div>
                    <div className="flex flex-col text-left">
                      <p className="text-xs sm:text-sm font-semibold text-gray-200">
                        Upload video thumbnail cover
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-orbitron">
                        PNG, JPG, WEBP (16:9 Recommended)
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      thumbnailInputRef.current?.click();
                    }}
                    disabled={isUploading}
                    className="border-white/15 bg-white/5 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider font-orbitron h-8 px-3"
                  >
                    Browse
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isUploading}
              className="border-white/10 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !title.trim() || !selectedFile}
              className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold uppercase tracking-wider text-xs px-6 h-10 flex items-center gap-2 cursor-pointer font-orbitron disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <IconUpload className="size-4" /> Upload {type === "image" ? "Image" : "Video"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
