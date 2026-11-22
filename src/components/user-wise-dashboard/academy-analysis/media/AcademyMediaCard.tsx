"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  IconEye,
  IconHeart,
  IconPlayerPlay,
  IconPencil,
  IconTrash,
  IconShare,
  IconCheck,
} from "@tabler/icons-react";
import { IMediaItem } from "@/types/media.type";
import { formatMediaDate, formatCount } from "./mediaUtils";
import { toast } from "sonner";

interface AcademyMediaCardProps {
  item: IMediaItem;
  type: "IMAGE" | "VIDEO";
  onPreview: (item: IMediaItem) => void;
  onEdit: (item: IMediaItem) => void;
  onDelete: (item: IMediaItem) => void;
}

export const AcademyMediaCard = ({
  item,
  type,
  onPreview,
  onEdit,
  onDelete,
}: AcademyMediaCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const thumbnailSrc = item.thumbnailUrl || item.url || "/placeholder_img.jpg";

  return (
    <div
      onClick={() => onPreview(item)}
      className="bg-[#111111] rounded-3xl border border-white/5 p-4 flex flex-col gap-4 group cursor-pointer hover:border-white/15 transition-all relative overflow-hidden"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center">
        {/* Ambient blurred backdrop so letterbox bars match image colors */}
        <Image
          src={thumbnailSrc}
          alt=""
          fill
          unoptimized
          aria-hidden="true"
          className="object-cover blur-xl opacity-35 scale-110 pointer-events-none"
        />
        {/* Main image: never cropped */}
        <Image
          src={thumbnailSrc}
          alt={item.title || "Media"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized
          className="relative z-1 object-contain p-0.5 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.srcset = "";
            target.src = "/placeholder_img.jpg";
          }}
        />

        {/* Video Play Overlay */}
        {type === "VIDEO" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15 transition-colors">
            <div className="size-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-lg">
              <IconPlayerPlay size={24} className="text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Action Buttons on Hover */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10"
        >
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit title"
            className="size-8 rounded-xl bg-black/75 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          >
            <IconPencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Delete"
            className="size-8 rounded-xl bg-black/75 hover:bg-destructive/80 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          >
            <IconTrash size={14} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            title="Share"
            className="size-8 rounded-xl bg-black/75 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
          >
            {copied ? (
              <IconCheck size={14} className="text-emerald-400" />
            ) : (
              <IconShare size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Title & Date */}
      <div className="flex flex-col gap-1 min-w-0">
        <h3
          title={item.title}
          className="text-base font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors font-orbitron truncate"
        >
          {item.title || "UNTITLED"}
        </h3>
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate">
          {formatMediaDate(item.createdAt)}
        </p>
      </div>

      {/* Views & Likes */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-white/40">
          <IconEye size={14} />
          <span className="text-[10px] font-bold">{formatCount(item.views)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40">
          <IconHeart size={14} />
          <span className="text-[10px] font-bold">{formatCount(item.likes)}</span>
        </div>
      </div>
    </div>
  );
};

export default AcademyMediaCard;
