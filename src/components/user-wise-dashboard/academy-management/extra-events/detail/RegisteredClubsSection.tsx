"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconShield, IconUser, IconUsers } from "@tabler/icons-react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { Skeleton } from "@/components/ui/skeleton";
import { unwrapList, useGetEventClubRosterQuery } from "@/redux/features/extraEvent/extraEventApi";
import type { IRegisteredClub, IRosterPlayer } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";

interface RegisteredClubsSectionProps {
  eventId: string;
  clubs: IRegisteredClub[];
  isLoading: boolean;
}

export const ClubBadgeAvatar = ({
  club,
  sizeClass = "size-11",
}: {
  club?: Partial<IRegisteredClub> | null;
  sizeClass?: string;
}) => {
  const imgSrc = club?.logo || (club?.badgePreset && club.badgePreset.startsWith("http") ? club.badgePreset : null);
  return (
    <div
      className={cn(
        "rounded-xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shrink-0",
        sizeClass
      )}
    >
      {imgSrc ? (
        <Image src={imgSrc} alt={club?.clubName || "Club"} width={48} height={48} className="size-full object-cover" />
      ) : (
        <IconShield size={20} className="text-white/40" />
      )}
    </div>
  );
};

export const ClubRosterDialog = ({
  eventId,
  club,
  onClose,
}: {
  eventId: string;
  club: IRegisteredClub | null;
  onClose: () => void;
}) => {
  const { data: rosterRes, isLoading } = useGetEventClubRosterQuery(
    { eventId, clubId: club?._id || "" },
    { skip: !club?._id }
  );

  const rosterData = rosterRes?.data;
  const players = unwrapList<IRosterPlayer>(rosterData, ["roster", "players"]);
  const resolvedPlayers = players.length > 0 ? players : club?.roster ?? [];

  return (
    <DashboardModal
      isOpen={Boolean(club)}
      onClose={onClose}
      title={club ? `${club.clubName} — Squad Roster` : "Squad Roster"}
      maxWidth="max-w-xl"
    >
      {club && (
        <div className="space-y-5">
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
            <ClubBadgeAvatar club={club} sizeClass="size-14" />
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-black uppercase text-white font-orbitron truncate">{club.clubName}</h4>
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-wider truncate">
                {club.coachName ? `Coach: ${club.coachName}` : "Coach N/A"}
                {club.category ? ` • ${club.category}` : ""}
              </p>
              {club.group && (
                <span className="inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/20">
                  {club.group}
                </span>
              )}
            </div>
            {club.paymentStatus && (
              <span
                className={cn(
                  "text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border",
                  club.paymentStatus === "PAID" || club.paymentStatus === "FREE"
                    ? "bg-[#00FF62]/10 text-[#00FF62] border-[#00FF62]/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}
              >
                {club.paymentStatus}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl bg-white/5" />
              ))}
            </div>
          ) : resolvedPlayers.length === 0 ? (
            <div className="py-10 text-center bg-black/40 border border-white/5 rounded-2xl">
              <IconUsers size={28} className="mx-auto text-white/20 mb-2" />
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">No players listed in roster</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {resolvedPlayers.map((player, idx) => {
                const photo = (player as unknown as { photo?: string; avatar?: string }).photo ||
                  (player as unknown as { avatar?: string }).avatar;
                return (
                  <div
                    key={player._id || `${player.fullName}-${idx}`}
                    className="flex items-center justify-between gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {photo ? (
                          <Image src={photo} alt={player.fullName} width={36} height={36} className="size-full object-cover" />
                        ) : (
                          <IconUser size={16} className="text-white/40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{player.fullName}</p>
                        {player.dateOfBirth && (
                          <p className="text-[10px] text-white/40 font-medium">DOB: {player.dateOfBirth}</p>
                        )}
                      </div>
                    </div>
                    {player.shirtNo !== undefined && player.shirtNo !== "" && (
                      <span className="text-[11px] font-black font-orbitron text-[#00FF62] bg-[#00FF62]/10 border border-[#00FF62]/20 px-2.5 py-1 rounded-lg">
                        #{player.shirtNo}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardModal>
  );
};

export const RegisteredClubsSection: React.FC<RegisteredClubsSectionProps> = ({
  eventId,
  clubs,
  isLoading,
}) => {
  const [selectedClub, setSelectedClub] = useState<IRegisteredClub | null>(null);

  return (
    <>
      <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-lg md:text-xl font-black uppercase text-white font-orbitron">
              Registered Tournament Clubs
            </h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
              Click any club to view their registered squad roster
            </p>
          </div>
          <span className="bg-[#00FF62]/10 border border-[#00FF62]/20 text-[#00FF62] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest font-orbitron w-fit">
            {clubs.length} ENROLLED
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="py-12 text-center bg-black/40 border border-white/5 rounded-3xl">
            <IconShield size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
              NO CLUBS REGISTERED YET
            </p>
            <p className="text-[11px] text-white/30 mt-1">
              Registered clubs will appear here once entries are submitted.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <button
                key={club._id}
                type="button"
                onClick={() => setSelectedClub(club)}
                className="bg-black/40 hover:bg-black/70 border border-white/10 hover:border-white/25 rounded-2xl p-4 flex items-center gap-3.5 text-left transition-all cursor-pointer group"
              >
                <ClubBadgeAvatar club={club} sizeClass="size-12" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase text-white group-hover:text-[#E31B23] transition-colors truncate">
                    {club.clubName}
                  </p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider truncate mt-0.5">
                    {club.coachName || "Coach"} • {club.rosterCount ?? club.roster?.length ?? 0} Players
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {club.category && (
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                        {club.category}
                      </span>
                    )}
                    {club.paymentStatus && (
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                          club.paymentStatus === "PAID" || club.paymentStatus === "FREE"
                            ? "bg-[#00FF62]/10 text-[#00FF62] border-[#00FF62]/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}
                      >
                        {club.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ClubRosterDialog eventId={eventId} club={selectedClub} onClose={() => setSelectedClub(null)} />
    </>
  );
};
