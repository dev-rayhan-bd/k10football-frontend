"use client";

import React from "react";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";

type Option = { value: string; label: string };

export interface ExtraEventsFilters {
  searchTerm: string;
  eventType: string;
  status: string;
  ageGroup: string;
  date: string;
}

interface ExtraEventsFilterBarProps {
  filters: ExtraEventsFilters;
  onChange: (patch: Partial<ExtraEventsFilters>) => void;
  eventTypes: Option[];
  statusOptions: Option[];
  ageGroups: Option[];
  dateFilters: Option[];
}

const FilterSelect = ({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: Option[];
}) => (
  <div className="relative shrink-0">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#111111] border border-white/15 pl-4 sm:pl-5 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 hover:text-white transition-all appearance-none cursor-pointer focus:outline-none focus:border-white/25"
    >
      <option value="" className="bg-[#111111] text-white">
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#111111] text-white">
          {o.label}
        </option>
      ))}
    </select>
    <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
  </div>
);

export const ExtraEventsFilterBar: React.FC<ExtraEventsFilterBarProps> = ({
  filters,
  onChange,
  eventTypes,
  statusOptions,
  ageGroups,
  dateFilters,
}) => (
  <div className="flex flex-col lg:flex-row gap-3 w-full max-w-full">
    <div className="relative flex-1 min-w-0">
      <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      <input
        type="text"
        value={filters.searchTerm}
        onChange={(e) => onChange({ searchTerm: e.target.value })}
        placeholder="Search events..."
        className="w-full bg-[#111111] border border-white/15 rounded-xl py-2.5 pl-11 pr-4 text-[11px] font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
      />
    </div>
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 lg:pb-0">
      <FilterSelect value={filters.eventType} onChange={(v) => onChange({ eventType: v })} placeholder="All Types" options={eventTypes} />
      <FilterSelect value={filters.status} onChange={(v) => onChange({ status: v })} placeholder="All Statuses" options={statusOptions} />
      <FilterSelect value={filters.ageGroup} onChange={(v) => onChange({ ageGroup: v })} placeholder="All Ages" options={ageGroups} />
      <FilterSelect value={filters.date} onChange={(v) => onChange({ date: v })} placeholder="Any Date" options={dateFilters} />
    </div>
  </div>
);

export default ExtraEventsFilterBar;
