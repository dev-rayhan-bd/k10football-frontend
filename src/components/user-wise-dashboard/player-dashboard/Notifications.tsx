"use client";
import { 
  IconHeart, 
  IconCalendar, 
  IconEye, 
  IconBuildingCommunity,
  IconSearch,
  IconBriefcase
} from "@tabler/icons-react";

const stats = [
  { label: "Total Interest", value: "4", icon: IconHeart },
  { label: "This Month", value: "4", icon: IconCalendar },
  { label: "Total Profile Views", value: "127", icon: IconEye },
  { label: "Avg Views Per Video", value: "10", icon: IconEye },
];

const notifications = [
  { id: 1, name: "Championship Youth FC", type: "Club", date: "Mar 8, 2024", icon: IconBuildingCommunity },
  { id: 2, name: "International Scouts Network", type: "Scout", date: "Mar 5, 2024", icon: IconSearch },
  { id: 3, name: "Elite Development Centre", type: "Club", date: "Mar 8, 2024", icon: IconBuildingCommunity },
  { id: 4, name: "Professional Pathway Agency", type: "Agent", date: "Feb 28, 2024", icon: IconBriefcase },
];

const PlayerNotifications = () => {
  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="space-y-2 px-2 sm:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
          Notification
        </h1>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-tight">
          Clubs and Agents Who Have Shown Interest in Your Profile
        </p>
      </div>

      {/* Stats Grid */}
      <div className="p-4 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="p-4 sm:p-8 rounded-[20px] sm:rounded-3xl border border-white/5 bg-[#0A0A0A]/60 group hover:border-white/10 transition-all duration-500"
            >
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-500">
                  <stat.icon size={20} stroke={1.5} />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tighter font-orbitron">{stat.value}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="p-4 sm:p-10 rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl space-y-4">
        {notifications.map((item) => (
          <div 
            key={item.id} 
            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-2xl bg-white/3 border border-white/10 hover:bg-white/6 hover:border-white/20 transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/50 gap-4 sm:gap-0 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-white/10 transition-all">
                <IconHeart size={24} stroke={1.5} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">{item.name}</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-white/10">
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                    <IconCalendar size={14} />
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
            <button className="relative z-10 w-full sm:w-auto px-6 py-2.5 rounded-xl border border-green-500/20 bg-green-500/5 text-[11px] font-black text-green-500 uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all shadow-md shadow-green-500/10">
              Interested
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerNotifications;
