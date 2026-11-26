"use client";

import React from "react";
import { IconLoader2, IconUsers } from "@tabler/icons-react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { getExtraEventApiError, unwrapList, useGetEventClubRosterQuery } from "@/redux/features/extraEvent/extraEventApi";
import type { IRosterPlayer } from "@/types/extraEvent.type";
import { formatDate } from "./extraEventUtils";
import { EmptyState } from "./ManageUi";

export const ClubRosterModal = ({
  eventId,
  clubId,
  clubName,
  onClose,
}: {
  eventId: string;
  clubId: string;
  clubName: string;
  onClose: () => void;
}) => {
  const { data, isLoading, error } = useGetEventClubRosterQuery({ eventId, clubId });
  const roster = unwrapList<IRosterPlayer>(data?.data, ["roster", "players"]);

  return (
    <DashboardModal isOpen onClose={onClose} title={`${clubName} Roster`} subtitle={`${roster.length} players`} maxWidth="max-w-2xl" closeOnOutsideClick>
      {isLoading ? (
        <div className="flex justify-center py-10 text-white/50">
          <IconLoader2 className="animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm font-bold text-destructive">{getExtraEventApiError(error, "Failed to load roster").message}</p>
      ) : roster.length === 0 ? (
        <EmptyState icon={<IconUsers size={28} />} title="No players listed" />
      ) : (
        <div className="flex flex-col gap-2">
          {roster.map((p, i) => (
            <div
              key={p._id || `${p.fullName}-${i}`}
              className="flex items-center gap-4 bg-[#151515] border border-white/5 rounded-2xl px-4 py-3"
            >
              <span className="size-9 shrink-0 rounded-xl bg-[#E31B23]/10 text-[#E31B23] flex items-center justify-center text-xs font-black font-orbitron">
                {p.shirtNo ?? "–"}
              </span>
              <span className="flex-1 min-w-0 text-sm font-bold text-white truncate">{p.fullName}</span>
              {p.dateOfBirth && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 shrink-0">
                  DOB {formatDate(p.dateOfBirth)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardModal>
  );
};

export default ClubRosterModal;
