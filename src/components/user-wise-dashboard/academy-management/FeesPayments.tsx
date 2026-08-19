"use client";

import React from "react";
import { 
  IconCurrencyDollar, 
  IconDownload,
  IconArrowUpRight,
  IconClock,
} from "@tabler/icons-react";

const recentPayments = [
  {
    id: 1,
    player: "Marcus Silva",
    type: "Monthly Fee",
    amount: "$150",
    date: "Jan 20, 2026",
    status: "Paid"
  },
  {
    id: 2,
    player: "David Chen",
    type: "Training Session Fee",
    amount: "$50",
    date: "Jan 19, 2026",
    status: "Paid"
  },
  {
    id: 3,
    player: "Alex Jordan",
    type: "Monthly Fee",
    amount: "$150",
    date: "Jan 15, 2026",
    status: "Unpaid"
  },
  {
    id: 4,
    player: "Lucas Santos",
    type: "Validation Fee",
    amount: "$30",
    date: "Jan 18, 2026",
    status: "Paid"
  },
  {
    id: 5,
    player: "Gabriel Barbosa",
    type: "Weekly Fee",
    amount: "$40",
    date: "Jan 17, 2026",
    status: "Paid"
  },
  {
    id: 6,
    player: "Felipe Melo",
    type: "Uniform Kit Fee",
    amount: "$85",
    date: "Jan 14, 2026",
    status: "Paid"
  },
  {
    id: 7,
    player: "Rodrigo Silva",
    type: "Registration Fee",
    amount: "$120",
    date: "Jan 12, 2026",
    status: "Paid"
  },
  {
    id: 8,
    player: "Enzo Fernandez",
    type: "Tournament Entrance Fee",
    amount: "$65",
    date: "Jan 10, 2026",
    status: "Unpaid"
  },
  {
    id: 9,
    player: "Alex Jordan",
    type: "Late Payment Fine",
    amount: "$20",
    date: "Jan 21, 2026",
    status: "Unpaid"
  }
];

export const FeesPayments = () => {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">Fees & Payments</h1>
        <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">Track and manage fee payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-[#111111] rounded-4xl border border-white/15 p-6 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconCurrencyDollar size={28} className="text-[#E31B23] md:w-8 md:h-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Total Collected</p>
            <p className="text-2xl md:text-3xl font-black text-white font-orbitron truncate">$45,280</p>
          </div>
        </div>
        
        <div className="bg-[#111111] rounded-4xl border border-white/15 p-6 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconClock size={28} className="text-[#FBBF24] md:w-8 md:h-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">Pending</p>
            <p className="text-2xl md:text-3xl font-black text-white font-orbitron truncate">$2,450</p>
          </div>
        </div>

        <div className="bg-[#111111] rounded-4xl border border-white/15 p-6 md:p-8 flex items-center gap-4 md:gap-6 shadow-xl sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconArrowUpRight size={28} className="text-[#4ADE80] md:w-8 md:h-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 truncate">This Month</p>
            <p className="text-2xl md:text-3xl font-black text-white font-orbitron truncate">$8,920</p>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 md:gap-8 shadow-2xl w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron">Recent Payments</h2>
          <button className="w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shrink-0">
            <IconDownload size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">Export</span>
          </button>
        </div>

        <div className="rounded-2xl border border-white/15 overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-175 text-left border-collapse">
            <thead>
              <tr className="border-b border-white/15 bg-white/1">
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Player</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Type</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Amount</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">Date</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment, index) => (
                <tr key={payment.id} className={`hover:bg-white/2 transition-colors group ${index !== recentPayments.length - 1 ? 'border-b border-white/15' : ''}`}>
                  <td className="py-6 px-6 border-r border-white/15 text-sm font-medium text-white/60 text-center">{payment.player}</td>
                  <td className="py-6 px-6 border-r border-white/15 text-sm font-medium text-white/60 text-center">{payment.type}</td>
                  <td className="py-6 px-6 border-r border-white/15 text-sm font-black text-white text-center">{payment.amount}</td>
                  <td className="py-6 px-6 border-r border-white/15 text-sm font-medium text-white/60 text-center">{payment.date}</td>
                  <td className="py-6 px-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      payment.status === "Paid" ? "bg-[#4ADE80]/10 text-[#4ADE80]" : "bg-[#EF4444]/10 text-[#EF4444]"
                    }`}>
                      {payment.status}
                    </span>
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

export default FeesPayments;
