"use client";

import { useState } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { 
  IconSearch, 
  IconPlus, 
  IconCalendar,
  IconClock,
  IconChevronDown,
} from "@tabler/icons-react";

const matches = [
  {
    id: 1,
    title: "Santos FC U-15 vs Manchester City U-15",
    date: "Jan 28, 2026",
    time: "3:00 PM",
    status: "Scheduled",
    venueType: "Home Ground",
    costs: { transport: "$150", ground: "$200", other: "$50", total: "$400" }
  },
  {
    id: 2,
    title: "Santos FC U-17 vs Liverpool FC U-17",
    date: "Feb 2, 2026",
    time: "4:30 PM",
    status: "Scheduled",
    venueType: "Away",
    costs: { transport: "$300", ground: "$250", other: "$100", total: "$650" }
  }
];

export const MatchesManagement = () => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">Matches</h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">Schedule and track match costs</p>
        </div>
        <button 
          onClick={() => setShowScheduleModal(true)}
          className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0"
        >
          <IconPlus size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Schedule Match</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 p-4 flex flex-col xl:flex-row gap-4 shadow-xl w-full max-w-full">
        <div className="relative flex-1 min-w-0 w-full">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            placeholder="Search matches by team or competition..."
            className="w-full bg-white/2 border border-white/15 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
          />
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full xl:w-auto min-w-0">
          {["All Matches", "All Teams", "All Status", "Date"].map((filter) => (
            <button key={filter} className="bg-white/5 border border-white/15 px-4 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all shrink-0">
              {filter}
              <IconChevronDown size={14} className="shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {matches.map((match) => (
          <div key={match.id} className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 md:gap-8 hover:border-white/25 transition-all shadow-2xl group min-w-0">
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <div className="flex gap-2 md:gap-3 flex-wrap">
                <span className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black text-[#4ADE80] uppercase tracking-widest shrink-0">
                  {match.status}
                </span>
                <span className="bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black text-white/60 uppercase tracking-widest shrink-0">
                  {match.venueType}
                </span>
              </div>
            </div>

            <div className="space-y-4 min-w-0">
              <h3 className="text-xl md:text-2xl font-black uppercase text-white font-orbitron leading-tight wrap-break-word">
                {match.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <IconCalendar size={16} className="shrink-0" />
                  <span className="truncate">{match.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock size={16} className="shrink-0" />
                  <span className="truncate">{match.time}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 md:pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1 min-w-0">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Transport</p>
                <p className="text-base font-black text-white truncate">{match.costs.transport}</p>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Ground Cost</p>
                <p className="text-base font-black text-white truncate">{match.costs.ground}</p>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Other Costs</p>
                <p className="text-base font-black text-white truncate">{match.costs.other}</p>
              </div>
              <div className="space-y-1 sm:text-right min-w-0">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Total Cost</p>
                <p className="text-base font-black text-[#E31B23] truncate">{match.costs.total}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Match Modal */}
      <DashboardModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Create Match"
        subtitle="Schedule a new match and track associated costs"
        showBackButton
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0"
            >
              Cancel
            </button>
            <button className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0">
              Create Match
            </button>
          </div>
        }
      >
        <div className="space-y-10">
          {/* Match Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Match Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Match Title <span className="text-[#E31B23]">*</span>
                </label>
                <input type="text" placeholder="e.g., U-17 vs City FC" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Our Team <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white/60 appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer">
                    <option>Select an option</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Opponent Team <span className="text-[#E31B23]">*</span>
                </label>
                <input type="text" placeholder="Enter opponent name" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Match Type <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white/60 appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer">
                    <option>Select an option</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Competition Name</label>
                <input type="text" placeholder="e.g., Regional Youth League" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
            </div>
          </div>

          {/* Venue Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Venue Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Home / Away <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white/60 appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer">
                    <option>Select an option</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Venue Name <span className="text-[#E31B23]">*</span>
                </label>
                <input type="text" placeholder="Stadium or field name" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Venue Address <span className="text-[#E31B23]">*</span>
                </label>
                <input type="text" placeholder="Full address" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Match Date <span className="text-[#E31B23]">*</span>
                </label>
                <input type="date" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Kick-off Time <span className="text-[#E31B23]">*</span>
                </label>
                <input type="time" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all" />
              </div>
            </div>
          </div>

          {/* Match Officials */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Match Officials</h3>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Referee(s)</label>
              <input type="text" placeholder="Enter referee names or assignment details" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
            </div>
          </div>

          {/* Match Costs */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Match Costs</h3>
            <div className="bg-[#111111] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-[#E31B23] rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                </div>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Travel Required (Away Match)</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Bus / Transportation Cost</label>
                <input type="text" placeholder="0.00" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Meals Cost</label>
                <input type="text" placeholder="0.00" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Other Costs</label>
                <input type="text" placeholder="0.00" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
              </div>
              <div className="space-y-2 sm:col-span-2 md:col-span-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Estimated Total Cost</label>
                <input type="text" placeholder="0.00" className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" />
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Include referee fees, venue fees, and any other costs</p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Additional Notes</h3>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Notes</label>
              <textarea 
                placeholder="Special instructions, arrival time, kit colors, etc." 
                className="w-full h-32 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </DashboardModal>
    </div>
  );
};

export default MatchesManagement;
