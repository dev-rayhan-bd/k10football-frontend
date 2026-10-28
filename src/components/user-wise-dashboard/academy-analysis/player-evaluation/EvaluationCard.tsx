/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { IconClock, IconUsers, IconEye, IconFileTypePdf } from "@tabler/icons-react";

export interface EvaluationCardProps {
  id?: string | number;
  tag?: string;
  name?: string;
  date?: string;
  coach?: string;
  rating?: number;
  overallRatingFormatted?: string;
  tech?: number;
  phys?: number;
  ment?: number;
  pos?: string;
  tier?: string;
  tierBadge?: string;
  avatar?: string;
  onClick?: () => void;
  onPdfClick?: () => void;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ 
  tag = "U-15", 
  name = "Player", 
  date = "", 
  coach = "N/A", 
  rating = 0,
  overallRatingFormatted,
  tech = 0, 
  phys = 0, 
  ment = 0, 
  pos = "Player", 
  tier = "TIER 1", 
  tierBadge,
  onClick,
  onPdfClick,
}) => {
  const displayRating = typeof rating === "number" ? rating : Number(rating) || 0;
  const ratingPercent = Math.min(100, Math.max(0, displayRating > 10 ? displayRating : displayRating * 10));

  return (
    <div 
      onClick={onClick}
      className="bg-[#111111] border border-white/20 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 group hover:border-white/40 transition-all cursor-pointer relative"
    >
      {/* Top Header Row with Tag & Action Pills */}
      <div className="flex justify-between items-center gap-2">
        <span className="bg-white/5 border border-white/20 rounded-full px-3 py-1 sm:px-4 text-[9px] sm:text-[10px] font-bold text-white/60 whitespace-nowrap">
          {tag}
        </span>

        {/* Eye & PDF Actions in Top Row */}
        <div className="flex items-center gap-2">
          {/* Eye Icon Button for Details */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/20 border border-white/15 hover:border-white/40 text-white/80 hover:text-white text-[10px] font-bold uppercase transition-all cursor-pointer shadow-xs group/view"
            title="View Player Details"
          >
            <IconEye size={14} className="text-white/70 group-hover/view:text-white" />
            <span>View</span>
          </button>

          {/* PDF Icon Button for PDF Report */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPdfClick?.();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/30 border border-red-500/40 hover:border-red-500 text-red-400 hover:text-red-300 text-[10px] font-black uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(227,27,35,0.25)] group/pdf"
            title="Download / View PDF Report"
          >
            <IconFileTypePdf size={15} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Player & Coach Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold">
          <IconClock size={12} /> {date}
        </div>
        <h3 className="text-white text-xl font-black font-orbitron group-hover:text-[#E31B23] transition-colors truncate">
          {name}
        </h3>
        <p className="text-white/40 text-[10px] font-bold flex items-center gap-1 truncate">
          <IconUsers size={12} className="shrink-0" /> Coach: {coach}
        </p>
      </div>

      {/* Overall Rating Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <p className="text-white/40 text-[10px] font-bold uppercase">Overall Rating:</p>
          <p className="text-white/60 text-[10px] font-bold">
            {overallRatingFormatted || `(${displayRating > 10 ? (displayRating / 10).toFixed(1) : displayRating}/10)`}
          </p>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" 
            style={{ width: `${ratingPercent}%` }} 
          />
        </div>
      </div>

      {/* Bottom Row: Score Badges, Tier & Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 xl:gap-0 mt-2 xl:mt-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-400 text-[10px] font-bold">
            <div className="size-2 sm:size-2.5 rounded-full border-2 border-emerald-400 flex items-center justify-center p-[1px]">
              <div className="size-full bg-emerald-400 rounded-full" />
            </div>
            {tech}
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-400 text-[10px] font-bold">
            <div className="size-2 sm:size-2.5 rounded-full border-2 border-yellow-400 flex items-center justify-center p-[1px]">
              <div className="size-full bg-yellow-400 rounded-full" />
            </div>
            {phys}
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-red-400 text-[10px] font-bold">
            <div className="size-2 sm:size-2.5 rounded-full border-2 border-red-400 flex items-center justify-center p-[1px]">
              <div className="size-full bg-red-400 rounded-full" />
            </div>
            {ment}
          </div>
        </div>

        <div className="flex items-center justify-between w-full xl:w-auto gap-3">
          <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase truncate">
            {tierBadge || `${pos} · ${tier}`}
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="size-7 rounded-lg bg-white/5 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="View Player Details"
            >
              <IconEye size={15} />
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPdfClick?.();
              }}
              className="size-7 rounded-lg bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors cursor-pointer shadow-[0_0_8px_rgba(227,27,35,0.2)]"
              title="View & Download PDF"
            >
              <IconFileTypePdf size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
