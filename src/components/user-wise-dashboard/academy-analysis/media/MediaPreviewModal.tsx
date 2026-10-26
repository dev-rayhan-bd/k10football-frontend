"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  IconEye,
  IconHeart,
  IconShare,
  IconCheck,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IMediaItem } from "@/types/media.type";
import { formatMediaDate, formatCount } from "./mediaUtils";
import { toast } from "sonner";

interface MediaPreviewModalProps {
  item: IMediaItem | null;
  onClose: () => void;
}

export const MediaPreviewModal = ({ item, onClose }: MediaPreviewModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const isVideo = item.mediaType === "VIDEO" || item.url?.endsWith(".mp4") || item.url?.endsWith(".webm");

  const handleShare = async () => {
    const shareUrl = item.url || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-3xl p-6 sm:p-8">
        <DialogHeader>
          <div className="flex flex-col gap-1 pr-6">
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-white font-orbitron tracking-tight truncate">
              {item.title || "UNTITLED MEDIA"}
            </DialogTitle>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
              Uploaded on {formatMediaDate(item.createdAt)}
            </p>
          </div>
        </DialogHeader>

        {/* Media Container */}
        <div className="relative w-full max-h-[65vh] rounded-2xl overflow-hidden bg-black/80 flex items-center justify-center my-3 border border-white/10">
          {isVideo ? (
            <video
              src={item.url}
              controls
              autoPlay
              poster={item.thumbnailUrl}
              className="w-full max-h-[65vh] rounded-2xl object-contain bg-black"
            />
          ) : (
            <div className="relative w-full h-[50vh] sm:h-[60vh]">
              <Image
                src={item.url || "/placeholder_img.jpg"}
                alt={item.title || "Preview"}
                fill
                unoptimized
                className="object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-white/50 text-xs">
            <div className="flex items-center gap-1.5">
              <IconEye size={16} />
              <span className="font-bold">{formatCount(item.views)} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconHeart size={16} />
              <span className="font-bold">{formatCount(item.likes)} likes</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-white/10 text-white hover:bg-white/10 gap-1.5 text-xs font-bold"
          >
            {copied ? (
              <>
                <IconCheck size={14} className="text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <IconShare size={14} />
                Share
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreviewModal;
