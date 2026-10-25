"use client";

import React from "react";
import Image from "next/image";
import { IconX } from "@tabler/icons-react";

export interface CoachPreviewMedia {
  type: "image" | "video";
  url: string;
  title?: string;
}

interface CoachMediaModalProps {
  previewMedia: CoachPreviewMedia | null;
  onClose: () => void;
}

export const CoachMediaModal = ({ previewMedia, onClose }: CoachMediaModalProps) => {
  if (!previewMedia) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-[#111] border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider truncate pr-4">
            {previewMedia.title || (previewMedia.type === "video" ? "Video Reel" : "Image Preview")}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <IconX className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex items-center justify-center max-h-[75vh] overflow-hidden bg-black/60">
          {previewMedia.type === "video" ? (
            <video
              src={previewMedia.url}
              controls
              autoPlay
              className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-lg"
            />
          ) : (
            <div className="relative w-full h-[60vh] max-w-2xl">
              <Image
                src={previewMedia.url}
                alt={previewMedia.title || "Preview"}
                fill
                className="object-contain rounded-xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
