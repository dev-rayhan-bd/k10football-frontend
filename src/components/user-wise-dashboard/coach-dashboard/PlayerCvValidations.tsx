"use client";
import Image from "next/image";
import {
  IconClock,
  IconCircleCheck,
  IconCalendar,
  IconCircleX,
  IconPlus,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useRouter } from "next/navigation";
import AddPlayerModal from "./AddPlayerModal";
const PlayerCVValidations = () => {
  const router = useRouter();
  const { players, selectPlayer, validatePlayer } = usePlayer();
  // Calculate dynamic stats
  const pendingCount = players.filter((p) => p.validationStatus === "pending").length;
  const verifiedCount = players.filter((p) => p.validationStatus === "verified").length;
  const expiredCount = players.filter((p) => p.validationStatus === "expired").length;
  const stats = [
    { label: "Pending Validations", value: String(pendingCount), icon: IconClock },
    { label: "Verified CVs", value: String(verifiedCount), icon: IconCircleCheck },
    { label: "Updated This Month", value: String(verifiedCount), icon: IconCalendar },
    { label: "Expired Status", value: String(expiredCount), icon: IconCircleX },
  ];
  const validationData = players.map((player) => ({
    id: player.id,
    name: player.fullName,
    position: player.position,
    rating: player.rating,
    match: player.clubs[0]?.name || "N/A",
    goals: player.seasonStats.goals,
    assists: player.seasonStats.assists,
    date: player.lastValidatedDate || "Never",
    status: player.validationStatus === "verified" ? "Verified" :
      player.validationStatus === "pending" ? "Pending" : "Expired",
    avatar: player.playerImage,
  }));
  const columns: Column<typeof validationData[0]>[] = [
    {
      header: "Name",
      key: "name",
      render: (player) => (
        <div className="flex items-center gap-3">
          <Image width={40} height={40} src={player.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt={player.name} />
          <div>
            <div className="text-sm font-bold text-white">{player.name}</div>
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{player.position}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      key: "rating",
      align: "center",
      render: (player) => <span className="text-sm font-black text-red-600 italic">{player.rating}</span>,
    },
    { header: "Club/Current", key: "match", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Goals", key: "goals", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Assists", key: "assists", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Last Validated", key: "date", align: "center", cellClassName: "text-sm text-gray-400" },
    {
      header: "Status",
      key: "status",
      render: (player) => (
        <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${player.status === "Verified" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
            player.status === "Pending" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
          }`}>
          {player.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (player) => (
        <TableActionButtons
          onView={() => {
            selectPlayer(player.id);
            router.push("/cvs/player-cv-details");
          }}
          onVerify={player.status !== "Verified" ? () => validatePlayer(player.id) : undefined}
        />
      ),
    },
  ];
  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase">Player CV Validations</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">Review and validate player profiles and credentials</p>
        </div>
        <AddPlayerModal>
          <button className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2">
            <IconPlus size={16} /> Add Player
          </button>
        </AddPlayerModal>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-3 sm:p-6 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col justify-between">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white italic mb-1">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest sm:tracking-widest leading-tight line-clamp-2">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl border border-white/20 bg-[#0D0D0D] w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <DashboardTable columns={columns} data={validationData} className="border-white/10 min-w-150" />
        </div>
      </div>
    </div>
  );
};
export default PlayerCVValidations;
