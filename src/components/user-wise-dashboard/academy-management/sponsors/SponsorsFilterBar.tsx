"use client";

import React from "react";
import { IconSearch, IconChevronDown, IconX } from "@tabler/icons-react";

interface SponsorsFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  typeOptions: string[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  statusOptions: string[];
  selectedPaymentStatus: string;
  onPaymentStatusChange: (paymentStatus: string) => void;
  paymentStatusOptions: string[];
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const SponsorsFilterBar: React.FC<SponsorsFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  typeOptions,
  selectedStatus,
  onStatusChange,
  statusOptions,
  selectedPaymentStatus,
  onPaymentStatusChange,
  paymentStatusOptions,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-[#111111] rounded-4xl border border-white/15 p-4 flex flex-col xl:flex-row gap-4 shadow-xl w-full max-w-full">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0 w-full">
        <IconSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
          size={20}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sponsors by company name, contact, or email..."
          className="w-full bg-white/2 border border-white/15 rounded-2xl py-3 pl-12 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            title="Clear search"
          >
            <IconX size={16} />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full xl:w-auto min-w-0 items-center">
        {/* Type Filter */}
        <div className="relative shrink-0">
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="bg-[#181818] border border-white/15 pl-4 sm:pl-5 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 hover:text-white transition-all appearance-none cursor-pointer focus:outline-none focus:border-white/25"
          >
            <option value="" className="bg-[#181818] text-white/60">
              All Types
            </option>
            {typeOptions.map((type) => (
              <option key={type} value={type} className="bg-[#181818] text-white">
                {type}
              </option>
            ))}
          </select>
          <IconChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative shrink-0">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-[#181818] border border-white/15 pl-4 sm:pl-5 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 hover:text-white transition-all appearance-none cursor-pointer focus:outline-none focus:border-white/25"
          >
            <option value="" className="bg-[#181818] text-white/60">
              All Status
            </option>
            {statusOptions.map((status) => (
              <option key={status} value={status} className="bg-[#181818] text-white">
                {status}
              </option>
            ))}
          </select>
          <IconChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
        </div>

        {/* Payment Status Filter */}
        <div className="relative shrink-0">
          <select
            value={selectedPaymentStatus}
            onChange={(e) => onPaymentStatusChange(e.target.value)}
            className="bg-[#181818] border border-white/15 pl-4 sm:pl-5 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 hover:text-white transition-all appearance-none cursor-pointer focus:outline-none focus:border-white/25"
          >
            <option value="" className="bg-[#181818] text-white/60">
              All Payments
            </option>
            {paymentStatusOptions.map((pStatus) => (
              <option key={pStatus} value={pStatus} className="bg-[#181818] text-white">
                {pStatus.replace("_", " ")}
              </option>
            ))}
          </select>
          <IconChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white px-3 sm:px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 text-[10px] sm:text-[11px] font-bold cursor-pointer"
            title="Reset all filters"
          >
            <IconX size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SponsorsFilterBar;
