/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { IconClock, IconUsers, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

export const EvaluationCard = ({ 
  tag, 
  name, 
  date, 
  coach, 
  rating, 
  tech, 
  phys, 
  ment, 
  pos, 
  tier, 
  onClick
}: any) => (
  <div 
    onClick={onClick}
    className="bg-[#111111] border border-white/20 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 group hover:border-white/40 transition-all cursor-pointer"
  >
    <div className="flex justify-between items-center gap-2">
      <span className="bg-white/5 border border-white/20 rounded-full px-3 py-1 sm:px-4 text-[9px] sm:text-[10px] font-bold text-white/60 whitespace-nowrap">{tag}</span>
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold">
        <IconClock size={12} /> {date}
      </div>
      <h3 className="text-white text-xl font-black font-orbitron group-hover:text-[#E31B23] transition-colors">{name}</h3>
      <p className="text-white/40 text-[10px] font-bold flex items-center gap-1">
        <IconUsers size={12} /> Coach: {coach}
      </p>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-white/40 text-[10px] font-bold uppercase">Overall Rating:</p>
        <p className="text-white/60 text-[10px] font-bold">({rating}/10)</p>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" 
          style={{ width: `${rating * 10}%` }} 
        />
      </div>
    </div>
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 xl:gap-0 mt-2 xl:mt-0">
       <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-1.5 text-emerald-400 text-[10px] font-bold">
             <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-emerald-400 flex items-center justify-center p-[1px]">
               <div className="w-full h-full bg-emerald-400 rounded-full" />
             </div>
             {tech}
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-yellow-400 text-[10px] font-bold">
             <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-yellow-400 flex items-center justify-center p-[1px]">
               <div className="w-full h-full bg-yellow-400 rounded-full" />
             </div>
             {phys}
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-red-400 text-[10px] font-bold">
             <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 border-red-400 flex items-center justify-center p-[1px]">
               <div className="w-full h-full bg-red-400 rounded-full" />
             </div>
             {ment}
          </div>
       </div>
       <div className="flex items-center justify-between w-full xl:w-auto gap-3">
          <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase truncate">{pos} · {tier}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toast.info("Deletion is managed on the coach dashboard.");
            }}
            className="text-red-500/40 hover:text-red-500 transition-colors cursor-pointer"
          >
             <IconTrash size={16} />
          </button>
       </div>
    </div>
  </div>
);
