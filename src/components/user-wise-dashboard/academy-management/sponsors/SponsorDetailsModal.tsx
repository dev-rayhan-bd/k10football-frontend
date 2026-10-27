"use client";

import React from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconBuildingStore,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { ISponsorItem } from "@/types/academy.type";
import { getBadgeStyle, formatContractPeriod } from "./sponsor.constants";

interface SponsorDetailsModalProps {
  sponsor: ISponsorItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SponsorDetailsModal: React.FC<SponsorDetailsModalProps> = ({
  sponsor,
  isOpen,
  onClose,
}) => {
  if (!sponsor) return null;

  const typeLabel = sponsor.sponsorshipTypeBadge?.label || sponsor.sponsorshipType;
  const typeVariant = sponsor.sponsorshipTypeBadge?.variant;
  const statusLabel = sponsor.statusBadge?.label || sponsor.status;
  const statusVariant = sponsor.statusBadge?.variant;
  const paymentLabel = sponsor.paymentBadge?.label || sponsor.paymentStatus;
  const paymentVariant = sponsor.paymentBadge?.variant;
  const period = formatContractPeriod(
    sponsor.contractPeriod,
    sponsor.startDate,
    sponsor.endDate
  );

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={onClose}
      title={sponsor.companyName}
      subtitle={`Sponsor & Partnership Details • ${sponsor.contactPerson}`}
      showBackButton
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-black uppercase tracking-widest text-white transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        {/* Header Badges & Quick Stats */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getBadgeStyle(
                typeVariant,
                typeLabel
              )}`}
            >
              {typeLabel}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getBadgeStyle(
                statusVariant,
                statusLabel
              )}`}
            >
              {statusLabel}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getBadgeStyle(
                paymentVariant,
                paymentLabel
              )}`}
            >
              Payment: {paymentLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-lg font-black text-[#4ADE80] font-orbitron">
            <IconCurrencyDollar size={20} />
            <span>
              {sponsor.contractValueFormatted
                ? sponsor.contractValueFormatted
                : `${sponsor.currency || "$"}${sponsor.contractValue?.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Company & Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
            Contact &amp; Location
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <IconBuildingStore size={20} className="text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Contact Person
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {sponsor.contactPerson}
                </p>
              </div>
            </div>

            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <IconMail size={20} className="text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Email
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {sponsor.email}
                </p>
              </div>
            </div>

            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <IconPhone size={20} className="text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Phone
                </p>
                <p className="text-sm font-bold text-white truncate">
                  {sponsor.phone}
                </p>
              </div>
            </div>

            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex items-center gap-3">
              <IconCalendar size={20} className="text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Contract Period
                </p>
                <p className="text-sm font-bold text-white truncate">{period}</p>
              </div>
            </div>

            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex items-start gap-3 md:col-span-2">
              <IconMapPin size={20} className="text-white/40 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Full Address
                </p>
                <p className="text-sm font-medium text-white/80 mt-0.5">
                  {sponsor.fullAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Description */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
            Sponsorship Description
          </h4>
          <div className="bg-[#141414] p-4 rounded-xl border border-white/5 text-sm text-white/80 leading-relaxed">
            {sponsor.sponsorshipDescription || "No description provided."}
          </div>
        </div>

        {/* Benefits & Deliverables */}
        {sponsor.benefitsAndDeliverables && (
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
              Benefits &amp; Deliverables
            </h4>
            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 text-sm text-white/80 leading-relaxed">
              {sponsor.benefitsAndDeliverables}
            </div>
          </div>
        )}
      </div>
    </DashboardModal>
  );
};

export default SponsorDetailsModal;
