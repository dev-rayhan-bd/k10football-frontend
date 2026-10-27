"use client";

import React from "react";
import { IconChevronDown } from "@tabler/icons-react";

interface ExtraEventsFilterBarProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  statusOptions: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  dateFilters: string[];
}

export const ExtraEventsFilterBar: React.FC<ExtraEventsFilterBarProps> = ({
  selectedStatus,
  onStatusChange,
  statusOptions,
  selectedDate,
  onDateChange,
  dateFilters,
}) => {
  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 md:pb-0 md:justify-end w-full max-w-full">
      {/* Status Filter */}
      <div className="relative shrink-0">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-[#111111] border border-white/15 pl-4 sm:pl-5 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 hover:text-white transition-all appearance-none cursor-pointer focus:outline-none focus:border-white/25"
        >
          <option value="" className="bg-[#111111] text-white">All Events</option>
          {statusOptions.map((st) => (
            <option key={st} value={st} className="bg-[#111111] text-white">
              {st}
            </option>
          ))}
        </select>
        <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>

      {/* Date Filter */}
      <div className="relative shrink-0">
        <select
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-[#111111] border border-white/15 pl-4 sm:pl-5 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 hover:text-white transition-all appearance-none cursor-pointer focus:outline-none focus:border-white/25"
        >
          <option value="" className="bg-[#111111] text-white">Date</option>
          {dateFilters.map((df) => (
            <option key={df} value={df} className="bg-[#111111] text-white">
              {df.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
        <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
};

export default ExtraEventsFilterBar;
