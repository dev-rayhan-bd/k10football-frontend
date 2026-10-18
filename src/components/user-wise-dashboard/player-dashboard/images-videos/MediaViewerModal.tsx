"use client";
import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PreviewMedia } from "./types";

interface MediaViewerModalProps {
  previewMedia: PreviewMedia | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  previewMedia,
  onClose,
}) => {
  return (
    <Dialog open={!!previewMedia} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#161616] border-2 border-white/30 text-white rounded-3xl p-5 sm:p-7 max-w-4xl w-[92vw] shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <DialogHeader className="text-left flex flex-col gap-1 pb-3 border-b border-white/15">
          <DialogTitle className="text-lg sm:text-xl font-black uppercase italic tracking-tight font-orbitron text-white truncate pr-8">
            {previewMedia?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/95 border border-white/15 flex items-center justify-center my-3 shadow-inner">
          {previewMedia?.type === "image" ? (
            <Image
              src={previewMedia.url}
              alt={previewMedia.title}
              fill
              className="object-contain p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.srcset = "";
                target.src = "/placeholder_img.jpg";
              }}
            />
          ) : previewMedia?.type === "video" ? (
            <video
              src={previewMedia.url}
              controls
              autoPlay
              className="size-full object-contain p-1 rounded-xl"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
