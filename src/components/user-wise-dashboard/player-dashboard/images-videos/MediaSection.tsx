import React from "react";
import { IconPlus, IconUpload, IconPhoto, IconVideo } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { MediaItem } from "./types";
import { MediaCard } from "./MediaCard";

interface MediaSectionProps {
  title: string;
  type: "image" | "video";
  items: MediaItem[];
  isLoading?: boolean;
  onUploadClick?: () => void;
  onItemClick?: (item: MediaItem) => void;
  onEdit?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({
  title,
  type,
  items,
  isLoading,
  onUploadClick,
  onItemClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Match highlights & training</p>
        </div>
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            type="button"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1A1A1A] border border-white/10 text-[10px] sm:text-xs font-bold text-white hover:bg-[#252525] hover:border-white/20 transition-all flex items-center justify-center sm:justify-start gap-2.5 uppercase tracking-wider cursor-pointer"
          >
            {type === "image" ? <IconPlus size={16} className="sm:size-4.5" /> : <IconUpload size={16} className="sm:size-4.5" />}
            {type === "image" ? "Upload Image" : "Upload Video"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4 animate-pulse">
              <div className="aspect-video rounded-2xl bg-white/5 border border-white/5" />
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-white/10 rounded-md w-3/4" />
                <div className="h-3 bg-white/5 rounded-md w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-white/10 rounded-3xl p-6 bg-white/[0.01]">
          <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            {type === "image" ? <IconPhoto className="size-7 text-[#E31B23]" /> : <IconVideo className="size-7 text-[#E31B23]" />}
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-orbitron">
              No {type === "image" ? "Images" : "Videos"} Found
            </h3>
            <p className="text-xs text-gray-400">
              {onUploadClick
                ? `You haven't uploaded any ${type === "image" ? "match photos" : "video clips"} yet.`
                : `No ${type === "image" ? "match photos" : "video clips"} have been uploaded yet.`}
            </p>
          </div>
          {onUploadClick && (
            <Button
              type="button"
              onClick={onUploadClick}
              className="mt-2 bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 h-10 flex items-center gap-2 font-orbitron cursor-pointer"
            >
              <IconPlus className="size-4" /> Upload {type === "image" ? "Image" : "Video"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, idx) => (
            <MediaCard
              key={item.id || idx}
              item={item}
              type={type}
              onClick={() => onItemClick?.(item)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
