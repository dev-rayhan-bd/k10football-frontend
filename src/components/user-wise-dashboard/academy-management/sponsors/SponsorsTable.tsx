"use client";

import React from "react";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconCurrencyDollar,
  IconBuildingStore,
} from "@tabler/icons-react";
import { ISponsorItem } from "@/types/academy.type";
import { getBadgeStyle, formatContractPeriod } from "./sponsor.constants";

interface SponsorsTableProps {
  sponsors: ISponsorItem[];
  isLoading: boolean;
  onView?: (sponsor: ISponsorItem) => void;
  onEdit?: (sponsor: ISponsorItem) => void;
  onDelete?: (sponsor: ISponsorItem) => void;
}

export const SponsorsTable: React.FC<SponsorsTableProps> = ({
  sponsors,
  isLoading,
  onView,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/15 overflow-hidden">
        <div className="p-8 flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-white/5 animate-pulse w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (sponsors.length === 0) {
    return (
      <div className="rounded-2xl border border-white/15 p-12 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-white/30">
          <IconBuildingStore size={28} />
        </div>
        <p className="text-white text-base font-black uppercase font-orbitron">
          No Sponsors Found
        </p>
        <p className="text-white/40 text-xs max-w-sm">
          No sponsors match your selected criteria. Try adjusting your search or filters, or add a new sponsor.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-250">
        <thead>
          <tr className="border-b border-white/15 bg-white/1">
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
              Company Name
            </th>
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
              Contact
            </th>
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
              Sponsorship Type
            </th>
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
              Contract Value
            </th>
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
              Contract Period
            </th>
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
              Status
            </th>
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
              Payment
            </th>
            <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sponsors.map((s, index) => {
            const typeLabel = s.sponsorshipTypeBadge?.label || s.sponsorshipType;
            const typeVariant = s.sponsorshipTypeBadge?.variant;
            const statusLabel = s.statusBadge?.label || s.status;
            const statusVariant = s.statusBadge?.variant;
            const paymentLabel = s.paymentBadge?.label || s.paymentStatus;
            const paymentVariant = s.paymentBadge?.variant;
            const period = formatContractPeriod(
              s.contractPeriod,
              s.startDate,
              s.endDate
            );

            return (
              <tr
                key={s._id || index}
                className={`hover:bg-white/2 transition-colors group ${
                  index !== sponsors.length - 1 ? "border-b border-white/15" : ""
                }`}
              >
                {/* Company Name */}
                <td className="py-6 px-6 border-r border-white/15">
                  <div>
                    <p className="text-sm font-black text-white leading-none mb-1">
                      {s.companyName}
                    </p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {s.contactPerson}
                    </p>
                  </div>
                </td>

                {/* Contact */}
                <td className="py-6 px-6 border-r border-white/15">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-medium text-white/60 text-center">
                      {s.email}
                    </p>
                    <p className="text-[10px] font-bold text-white/40 text-center">
                      {s.phone}
                    </p>
                  </div>
                </td>

                {/* Sponsorship Type */}
                <td className="py-6 px-6 border-r border-white/15 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${getBadgeStyle(
                      typeVariant,
                      typeLabel
                    )}`}
                  >
                    {typeLabel}
                  </span>
                </td>

                {/* Contract Value */}
                <td className="py-6 px-6 border-r border-white/15 text-center">
                  <span className="text-sm font-black text-[#4ADE80] flex items-center justify-center gap-1 font-orbitron">
                    {s.contractValueFormatted ? (
                      s.contractValueFormatted
                    ) : (
                      <>
                        <IconCurrencyDollar size={14} />
                        {s.contractValue?.toLocaleString() || 0}
                      </>
                    )}
                  </span>
                </td>

                {/* Contract Period */}
                <td className="py-6 px-6 border-r border-white/15">
                  <div className="text-[10px] font-bold text-white/60 text-center leading-relaxed">
                    {period.includes(" to ") ? (
                      period.split(" to ").map((date, i) => (
                        <p key={i}>
                          {i === 1 ? "to " : ""}
                          {date}
                        </p>
                      ))
                    ) : (
                      <p>{period}</p>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="py-6 px-6 border-r border-white/15 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${getBadgeStyle(
                      statusVariant,
                      statusLabel
                    )}`}
                  >
                    {statusLabel}
                  </span>
                </td>

                {/* Payment */}
                <td className="py-6 px-6 border-r border-white/15 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${getBadgeStyle(
                      paymentVariant,
                      paymentLabel
                    )}`}
                  >
                    {paymentLabel}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-6 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView?.(s)}
                      title="View Details"
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <IconEye size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit?.(s)}
                      title="Edit Sponsor"
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(s)}
                      title="Delete Sponsor"
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 text-[#E31B23] hover:bg-[#E31B23] hover:text-white transition-all shadow-lg shadow-[#E31B23]/5 hover:shadow-[#E31B23]/20 cursor-pointer"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SponsorsTable;
