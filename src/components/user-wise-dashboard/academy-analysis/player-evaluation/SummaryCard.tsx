import React from "react";

export const SummaryCard = ({ label, value, icon: Icon, bgColor, textColor }: { label: string, value: string | number, icon: any, bgColor: string, textColor: string }) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-[20px] p-4 md:p-5 flex items-center gap-3 md:gap-4 flex-1 min-w-0">
    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${bgColor} bg-opacity-20 border border-white/20 flex-shrink-0`}>
      {Icon && <Icon className={`w-5 h-5 md:w-6 md:h-6 ${textColor} opacity-100`} stroke={2} />}
    </div>
    <div className="space-y-0.5 truncate">
      <p className="text-white/40 text-[10px] md:text-[11px] font-medium leading-none truncate">{label}</p>
      <p className="text-white text-xl md:text-2xl font-bold font-orbitron truncate">{value}</p>
    </div>
  </div>
);
