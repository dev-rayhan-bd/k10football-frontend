"use client";

import React, { useState } from "react";
import { IconEye, IconPlus, IconShieldHalf } from "@tabler/icons-react";
import type { IRegisteredClub } from "@/types/extraEvent.type";
import { clubIdOf, clubLogoOf, clubNameOf, formatDate, normalizeGroup, paymentTone } from "./extraEventUtils";
import { ActionButton, ClubLogo, EmptyState, Pill, SectionCard } from "./ManageUi";
import ClubRosterModal from "./ClubRosterModal";
import AddClubOfflineModal from "./AddClubOfflineModal";

export const RegisteredClubsPanel = ({
  eventId,
  clubs,
  readOnly,
  canAddClub,
  defaultCategory,
}: {
  eventId: string;
  clubs: IRegisteredClub[];
  readOnly?: boolean;
  /** Only while the tournament is still in REGISTRATION. */
  canAddClub?: boolean;
  defaultCategory?: string;
}) => {
  const [rosterClub, setRosterClub] = useState<{ id: string; name: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const paid = clubs.filter((c) => String(c.paymentStatus).toUpperCase() === "PAID").length;

  return (
    <SectionCard
      title="Registered Clubs"
      subtitle={`${clubs.length} clubs · ${paid} paid`}
      actions={
        !readOnly && canAddClub ? (
          <ActionButton variant="primary" icon={<IconPlus size={16} />} onClick={() => setShowAdd(true)}>
            Add Club Offline
          </ActionButton>
        ) : undefined
      }
    >
      {clubs.length === 0 ? (
        <EmptyState icon={<IconShieldHalf size={28} />} title="No clubs registered yet" text="Clubs that register (and pay) will appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {clubs.map((club) => {
            const id = clubIdOf(club);
            const name = clubNameOf(club) || "Unnamed club";
            const group = normalizeGroup(club.group);
            return (
              <div key={id || name} className="bg-[#151515] border border-white/5 rounded-3xl p-4 flex items-center gap-4 min-w-0">
                <ClubLogo logo={clubLogoOf(club)} name={name} className="size-12" />
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <p className="text-sm font-black uppercase text-white truncate font-orbitron">{name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 truncate">
                    {[club.coachName && `Coach ${club.coachName}`, club.category, club.contactEmail].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Pill className={paymentTone(club.paymentStatus)}>{club.paymentStatus || "—"}</Pill>
                    {club.paymentMethod && <Pill className="bg-white/5 border-white/10 text-white/50">{club.paymentMethod}</Pill>}
                    {group && <Pill className="bg-[#E31B23]/10 border-[#E31B23]/20 text-[#E31B23]">{group}</Pill>}
                    {club.registeredAt && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 self-center">{formatDate(club.registeredAt)}</span>
                    )}
                  </div>
                </div>
                {id && (
                  <ActionButton icon={<IconEye size={14} />} onClick={() => setRosterClub({ id, name })} className="shrink-0 px-3">
                    {typeof club.rosterCount === "number" ? `${club.rosterCount}` : "Roster"}
                  </ActionButton>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rosterClub && (
        <ClubRosterModal eventId={eventId} clubId={rosterClub.id} clubName={rosterClub.name} onClose={() => setRosterClub(null)} />
      )}
      {showAdd && <AddClubOfflineModal eventId={eventId} defaultCategory={defaultCategory} onClose={() => setShowAdd(false)} />}
    </SectionCard>
  );
};

export default RegisteredClubsPanel;
