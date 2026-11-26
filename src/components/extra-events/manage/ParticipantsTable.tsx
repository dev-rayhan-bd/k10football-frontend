"use client";

import React from "react";
import { IconUsers } from "@tabler/icons-react";
import type { IEventParticipant } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";
import { formatDateTime, formatMoney, paymentTone } from "./extraEventUtils";
import { EmptyState, Pill, SectionCard } from "./ManageUi";

export const ParticipantsTable = ({
  participants,
  currency,
}: {
  participants: IEventParticipant[];
  currency?: string;
}) => {
  const paid = participants.filter((p) => String(p.paymentStatus).toUpperCase() === "PAID").length;
  const pending = participants.filter((p) => String(p.paymentStatus).toUpperCase() === "PENDING").length;

  return (
    <SectionCard
      title="Participants"
      subtitle={`${participants.length} registered · ${paid} paid · ${pending} pending`}
    >
      {participants.length === 0 ? (
        <EmptyState icon={<IconUsers size={28} />} title="No registrations yet" text="Registrations will appear here as they come in." />
      ) : (
        <div className="overflow-x-auto -mx-5 md:mx-0">
          <table className="w-full min-w-180 text-left">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
                {["Name", "Email", "Phone", "Team", "Payment", "Paid", "Registered"].map((h) => (
                  <th key={h} className="py-3 px-4 font-black">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={p._id || `${p.email}-${i}`} className="border-b border-white/5 text-xs text-white/80 hover:bg-white/2">
                  <td className="py-3 px-4 font-bold text-white">{p.name || "—"}</td>
                  <td className="py-3 px-4 truncate max-w-56">{p.email || "—"}</td>
                  <td className="py-3 px-4">{p.phone || "—"}</td>
                  <td className="py-3 px-4">{p.teamName || "—"}</td>
                  <td className="py-3 px-4">
                    <Pill className={cn(paymentTone(p.paymentStatus))}>{p.paymentStatus || "—"}</Pill>
                  </td>
                  <td className="py-3 px-4 font-bold">{p.paidAmount ? formatMoney(p.paidAmount, currency) : "—"}</td>
                  <td className="py-3 px-4 text-white/50">{formatDateTime(p.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
};

export default ParticipantsTable;
