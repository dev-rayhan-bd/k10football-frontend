"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { IconUpload, IconX, IconPhoto, IconLoader2 } from "@tabler/icons-react";
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

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadImageModal = ({ isOpen, onClose }: UploadImageModalProps) => {
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [titleError, setTitleError] = useState(false);
  const [fileError, setFileError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setFile(null);
    setPreviewUrl("");
    setTitleError(false);
    setFileError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG, PNG, WebP)");
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        toast.error("Image file size is too large. Max 10MB allowed.");
        return;
      }
      setFile(selected);
      setFileError(false);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      toast.error("Please enter an image title");
      hasError = true;
    }
    if (!file) {
      setFileError(true);
      if (!hasError) {
        toast.error("Please select an image file to upload");
      }
      hasError = true;
    }

    if (hasError) return;

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ title: title.trim() }));
      formData.append("image", file!);

      await uploadMedia(formData).unwrap();
      handleClose();
    } catch {
      // Error toast is handled centrally by mediaApi
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-lg p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">
            Upload Image
          </DialogTitle>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
            Add match photos or training highlights
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
              Image Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. vs Chelsea U19 Match Day"
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

          {/* File Upload Area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
              Image File <span className="text-destructive">*</span>
            </label>

            {previewUrl ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black/40 group">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  unoptimized
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Change Image
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <IconX size={14} className="mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-white/[0.02]",
                  fileError
                    ? "border-destructive bg-destructive/10"
                    : "border-white/15 hover:border-primary hover:bg-white/[0.04]"
                )}
              >
                <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                  <IconPhoto size={24} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    Click to select an image
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              </div>
            )}

            {fileError && (
              <span className="text-[11px] text-destructive font-medium">
                Please choose an image file
              </span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
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
              className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 min-w-32"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 size={16} className="animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IconUpload size={16} />
                  Upload Image
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageModal;
