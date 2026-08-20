import React from "react";

interface DashboardStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DashboardStatCard = ({ icon, label, value }: DashboardStatCardProps) => (
  <div className="bg-[#111111] p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-4xl border border-white/15 hover:border-white/20 transition-all space-y-4 sm:space-y-6 group min-w-0">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl border border-white/15 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
      {icon}
    </div>
    <div className="space-y-1 min-w-0">
      <p className="text-2xl md:text-3xl font-black text-white uppercase leading-none tracking-tight font-orbitron truncate">
        {value}
      </p>
      <p className="text-[10px] sm:text-[11px] text-white/40 uppercase font-bold tracking-widest truncate">
        {label}
      </p>
    </div>
  </div>
);

export default DashboardStatCard;
