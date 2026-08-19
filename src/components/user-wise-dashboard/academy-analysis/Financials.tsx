/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { 
  IconFileText, 
  IconClock, 
  IconCircleX, 
  IconCoin, 
  IconCalendar,
} from "@tabler/icons-react";
const FinancialStatCard = ({ icon: Icon, value, label, iconColor }: { icon: any, value: string | number, label: string, iconColor: string }) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1 min-w-0">
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
       <Icon size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-white text-2xl sm:text-3xl font-black font-orbitron truncate">{value}</p>
      <p className="text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider truncate mt-1">{label}</p>
    </div>
  </div>
);
const StatusPill = ({ status }: { status: "Completed" | "Pending" }) => {
  const styles = {
    Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};
const Financials = () => {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight wrap-break-word">Finance Committee</h1>
        <p className="text-white/60 font-medium mt-2 text-sm md:text-lg">Track your academy&apos;s revenue and transactions</p>
      </div>
      {/* Summary Container */}
      <div className="bg-[#111111] border border-white/20 rounded-4xl md:rounded-[40px] p-6 md:p-10 flex flex-col gap-6 md:gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <FinancialStatCard icon={IconFileText} value="137" label="Game Reports" iconColor="text-white/60" />
          <FinancialStatCard icon={IconClock} value="30" label="pending" iconColor="text-yellow-500" />
          <FinancialStatCard icon={IconCircleX} value="7" label="Rejected" iconColor="text-red-500" />
          <FinancialStatCard icon={IconCoin} value="$ 279.6" label="Total Earnings" iconColor="text-white/60" />
          <FinancialStatCard icon={IconCalendar} value="$ 125.82" label="This Month" iconColor="text-white/60" />
        </div>
      </div>
      {/* Table Container */}
      <div className="bg-[#111111] border border-white/20 rounded-4xl md:rounded-[40px] p-5 md:p-8 flex flex-col gap-5 md:gap-6 w-full max-w-full">
        <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron wrap-break-word">Game report/validation/commission</h2>
        <div className="border border-white/20 rounded-2xl overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-200 text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/20 text-[10px] font-black text-white uppercase tracking-wider">
                <th className="px-6 py-4 border-r border-white/20">Name</th>
                <th className="px-6 py-4 border-r border-white/20 text-center">Type</th>
                <th className="px-6 py-4 border-r border-white/20 text-center">Cost</th>
                <th className="px-6 py-4 border-r border-white/20 text-center">Commission Academy</th>
                <th className="px-6 py-4 border-r border-white/20 text-center">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {[
                { name: "Marcus Silva", pos: "Forward", type: "Game Report", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-01-15", status: "Completed" as const },
                { name: "David Chen", pos: "Midfielder", type: "CV Validation", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-02-01", status: "Pending" as const },
                { name: "Alex Jonson", pos: "Defender", type: "Game Report", amount: "$ 6.99", myAmount: "$ 2.796", date: "2023-12-01", status: "Completed" as const },
                { name: "James Brown", pos: "Goalkeeper", type: "CV Validation", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-03-10", status: "Pending" as const },
                { name: "Lucas Santos", pos: "Defender", type: "Game Report", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-01-20", status: "Completed" as const },
                { name: "Gabriel Barbosa", pos: "Forward", type: "CV Validation", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-02-15", status: "Completed" as const },
                { name: "Felipe Melo", pos: "Midfielder", type: "Game Report", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-03-05", status: "Pending" as const },
                { name: "Rodrigo Silva", pos: "Defender", type: "CV Validation", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-02-28", status: "Completed" as const },
                { name: "Enzo Fernandez", pos: "Midfielder", type: "Game Report", amount: "$ 6.99", myAmount: "$ 2.796", date: "2024-03-18", status: "Pending" as const },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-5 border-r border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                         <Image width={100} height={100} src={`https://i.pravatar.cc/150?u=${row.name}`} alt={row.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-black uppercase">{row.name}</p>
                        <p className="text-red-500 text-[10px] font-bold uppercase">{row.pos}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 border-r border-white/20 text-center">
                    <span className="text-white/60 text-sm font-medium">{row.type}</span>
                  </td>
                  <td className="px-6 py-5 border-r border-white/20 text-center">
                    <span className="text-white text-sm font-black font-orbitron">{row.amount}</span>
                  </td>
                  <td className="px-6 py-5 border-r border-white/20 text-center">
                    <span className="text-white text-sm font-black font-orbitron">{row.myAmount}</span>
                  </td>
                  <td className="px-6 py-5 border-r border-white/20 text-center">
                    <span className="text-white/60 text-sm font-medium">{row.date}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financials;
