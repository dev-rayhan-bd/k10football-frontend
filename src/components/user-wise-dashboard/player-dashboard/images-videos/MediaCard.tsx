import React from "react";
import Image from "next/image";
import { IconPlayerPlay, IconEye, IconHeart } from "@tabler/icons-react";
import { MediaItem } from "./types";

interface MediaCardProps {
  item: MediaItem;
  type: "image" | "video";
  onClick?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, type, onClick }) => {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 border border-white/5 bg-black/40">
        <Image
          src={item.img}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={item.title}
          width={1000}
          height={1000}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.srcset = "";
            target.src = "/placeholder_img.jpg";
          }}
        />
        {type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="size-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
              <IconPlayerPlay size={32} className="text-white fill-white ml-1" />
            </div>
          </div>
        )}
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-lg font-bold text-white leading-tight truncate">{item.title}</h4>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{item.date}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[12px] text-gray-400 font-bold">
              <IconEye size={16} stroke={2} /> {item.views}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-gray-400 font-bold">
              <IconHeart
                size={16}
                stroke={2}
                className="text-red-600 fill-red-600/10 group-hover:fill-red-600/30 transition-all"
              />{" "}
              {item.likes}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
