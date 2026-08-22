"use client";
import Image from "next/image";
import {
  IconChevronDown,
  IconEye,
  IconLock,
  IconTrash
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
const CvPill = ({ type }: { type: "Silver" | "Gold" | "Bronze" }) => {
  const styles = {
    Silver: "bg-white/10 text-white border-white/20",
    Gold: "bg-yellow-500 text-black border-yellow-500/40 font-bold",
    Bronze: "bg-orange-800/20 text-orange-400 border-orange-800/40"
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${styles[type]}`}>
      {type}
    </span>
  );
};
const StatusBadge = ({ active }: { active: boolean }) => (
  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>
    {active ? "Active" : "Inactive"}
  </span>
);
interface PlayerRow {
  name: string;
  pos: string;
  age: number;
  country: string;
  academy: string;
  cv: "Silver" | "Gold" | "Bronze";
  reports: number;
  active: boolean;
}
const SuperAdminPlayers = () => {
  const columns: Column<PlayerRow>[] = [
    {
      header: "Name",
      key: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
            <Image src={`https://i.pravatar.cc/150?u=${row.name}`} alt={row.name} className="w-full h-full object-cover" width={40} height={40} onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = "/placeholder_img.jpg";
            }} />
          </div>
          <div>
            <p className="text-white text-sm font-black uppercase">{row.name}</p>
            <p className="text-red-500 text-[10px] font-bold uppercase">{row.pos}</p>
          </div>
        </div>
      )
    },
    { header: "Age", key: "age", align: "center", cellClassName: "text-white/60 text-sm font-black font-orbitron" },
    { header: "Country", key: "country", align: "center", cellClassName: "text-white/60 text-sm font-medium" },
    {
      header: "Academy",
      key: "academy",
      align: "center",
      render: (row) => <span className="text-white text-sm font-black uppercase tracking-tight">{row.academy}</span>
    },
    {
      header: "CV Type",
      key: "cv",
      align: "center",
      render: (row) => <CvPill type={row.cv} />
    },
    { header: "Reports", key: "reports", align: "center", cellClassName: "text-white/60 text-sm font-medium" },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => <StatusBadge active={row.active} />
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      render: () => (
        <div className="flex items-center justify-center gap-2">
          <button className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all hover:scale-105">
            <IconEye size={18} stroke={2} />
          </button>
          <button className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-yellow-500 hover:text-yellow-400 hover:border-yellow-500/40 hover:bg-yellow-500/10 transition-all hover:scale-105">
            <IconLock size={18} stroke={2} />
          </button>
          <button className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all hover:scale-105">
            <IconTrash size={18} stroke={2} />
          </button>
        </div>
      )
    }
  ];
  const data: PlayerRow[] = [
    { name: "Marcus Silva", pos: "Forward", age: 19, country: "Brazil", academy: "Elite FC Academy", cv: "Silver", reports: 12, active: true },
    { name: "David Chen", pos: "Midfielder", age: 18, country: "England", academy: "Champions Academy", cv: "Gold", reports: 9, active: true },
    { name: "Alex Jonson", pos: "Defender", age: 20, country: "Spain", academy: "Elite FC Academy", cv: "Silver", reports: 8, active: false },
    { name: "James Brown", pos: "Goalkeeper", age: 17, country: "Argentina", academy: "Youth Stars", cv: "Bronze", reports: 10, active: true },
  ];
  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">Player</h1>
        <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">Monitored all registered players</p>
      </div>
      {/* Main Container */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-8 flex flex-col gap-6 sm:gap-8 min-w-0 overflow-hidden w-full">
        {/* Table Filters */}
        <div className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-2 sm:gap-3 overflow-x-auto no-scrollbar w-full">
          <div className="relative shrink-0">
            <select className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer">
              <option value="" className="bg-[#111111] text-white">All Positions</option>
              <option value="forward" className="bg-[#111111] text-white">Forward</option>
              <option value="midfielder" className="bg-[#111111] text-white">Midfielder</option>
              <option value="defender" className="bg-[#111111] text-white">Defender</option>
              <option value="goalkeeper" className="bg-[#111111] text-white">Goalkeeper</option>
            </select>
            <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
          <div className="relative shrink-0">
            <select className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer">
              <option value="" className="bg-[#111111] text-white">Country</option>
              <option value="england" className="bg-[#111111] text-white">England</option>
              <option value="spain" className="bg-[#111111] text-white">Spain</option>
              <option value="brazil" className="bg-[#111111] text-white">Brazil</option>
              <option value="argentina" className="bg-[#111111] text-white">Argentina</option>
            </select>
            <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
          <div className="relative shrink-0">
            <select className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer">
              <option value="" className="bg-[#111111] text-white">Age Range</option>
              <option value="u18" className="bg-[#111111] text-white">Under 18</option>
              <option value="18-21" className="bg-[#111111] text-white">18 - 21</option>
              <option value="22-25" className="bg-[#111111] text-white">22 - 25</option>
              <option value="26+" className="bg-[#111111] text-white">26+</option>
            </select>
            <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
          <div className="relative shrink-0">
            <select className="appearance-none bg-black/40 border border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-3 sm:px-4 pr-8 sm:pr-10 focus:outline-none focus:border-white/40 transition-colors cursor-pointer">
              <option value="" className="bg-[#111111] text-white">All Status</option>
              <option value="gold" className="bg-[#111111] text-white">Gold</option>
              <option value="silver" className="bg-[#111111] text-white">Silver</option>
              <option value="bronze" className="bg-[#111111] text-white">Bronze</option>
            </select>
            <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
        </div>
        {/* Professional Table */}
        <DashboardTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default SuperAdminPlayers;
