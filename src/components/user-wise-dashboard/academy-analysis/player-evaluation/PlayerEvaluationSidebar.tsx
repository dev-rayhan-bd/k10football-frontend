import React from "react";
import { IconClock, IconTrendingUp, IconHeart, IconStar } from "@tabler/icons-react";

export const PlayerEvaluationSidebar = () => {
  return (
    <div className="w-full xl:w-85 flex flex-col gap-8 shrink-0 min-w-0">
       {/* Most Improved */}
       <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(227,27,35,0.2)] shrink-0">
                <IconClock className="text-white w-4 h-4 md:w-5 md:h-5" />
             </div>
             <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">Most Improved</h2>
          </div>
          <div className="space-y-4">
             {[
               { name: "Marcus Silva", team: "U-15", change: "+0.8", textColor: "text-emerald-600", border: "border-emerald-400", bgColor: "bg-emerald-100", down: false },
               { name: "David Chen", team: "U-17", change: "+0.8", textColor: "text-emerald-600", border: "border-emerald-400", bgColor: "bg-emerald-100", down: false },
               { name: "James Brown", team: "U-17", change: "+0.8", textColor: "text-emerald-600", border: "border-emerald-400", bgColor: "bg-emerald-100", down: false },
               { name: "Alex Jordan", team: "U-15", change: "-0.4", textColor: "text-red-600", border: "border-red-400", bgColor: "bg-red-100", down: true },
             ].map((player, i) => (
               <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     {player.down ? (
                       <IconTrendingUp size={16} className={`${player.textColor} rotate-180`} />
                     ) : (
                       <IconTrendingUp size={16} className={player.textColor} />
                     )}
                     <div>
                        <p className="text-white text-sm font-black">{player.name}</p>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{player.team}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${player.textColor} ${player.bgColor} bg-opacity-20`}>
                    {player.change}
                  </span>
               </div>
             ))}
          </div>
       </div>
       {/* Top Performers */}
       <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-4xl p-6 md:p-8 flex flex-col gap-5 md:gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <IconHeart className="text-red-500 w-4 h-4 md:w-5 md:h-5" />
             </div>
             <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">Top Performers</h2>
          </div>
          <div className="space-y-6">
             {[
               { name: "James Brown", info: "U-17 · Goalkeeper", rating: "9.2" },
               { name: "Marcus Silva", info: "U-15 · Forward", rating: "8.5" },
               { name: "David Chen", info: "U-17 · Midfielder", rating: "7.8" },
               { name: "Sarah Williams", info: "U-15 · Midfielder", rating: "7.5" },
               { name: "Alex Jordan", info: "U-15 · Defender", rating: "7.2" },
             ].map((player, i) => (
               <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <span className="text-red-500 text-[10px] font-black font-orbitron">#{i+1}</span>
                     <div>
                        <p className="text-white text-sm font-bold">{player.name}</p>
                        <p className="text-white/40 text-[10px] font-bold uppercase">{player.info}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 text-white text-[10px] font-black font-orbitron">
                     <IconStar size={14} className="text-red-500 fill-red-500/20" />
                     {player.rating}
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};
