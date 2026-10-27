/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconMapPin,
  IconCheck,
  IconX,
  IconClockHour4,
  IconSearch,
  IconDeviceFloppy,
  IconAlertCircle,
  IconLoader2,
  IconNote,
} from "@tabler/icons-react";
import {
  useGetSessionAttendanceQuery,
  useUpdateSessionAttendanceMutation,
} from "@/redux/features/academy/academyApi";
import { ISessionAttendancePlayer } from "@/types/academy.type";

interface SessionAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

export const SessionAttendanceModal: React.FC<SessionAttendanceModalProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const { data: attendanceResponse, isLoading, isError } = useGetSessionAttendanceQuery(
    sessionId || "",
    { skip: !isOpen || !sessionId }
  );

  const [updateSessionAttendance, { isLoading: isUpdating }] =
    useUpdateSessionAttendanceMutation();

  const sheetData = attendanceResponse?.data;
  const session = sheetData?.session;

  const [players, setPlayers] = useState<ISessionAttendancePlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickActionLoading, setQuickActionLoading] = useState<
    "PRESENT" | "ABSENT" | "CLEAR" | null
  >(null);
  const [editingNotePlayerId, setEditingNotePlayerId] = useState<string | null>(null);

  // Sync API data to local editable state when fetched
  useEffect(() => {
    if (sheetData?.players) {
      setPlayers(sheetData.players);
    }
  }, [sheetData]);

  const handleStatusChange = (identifier: string | number, newStatus: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        const matches =
          p.attendanceId === identifier ||
          p.playerId === identifier ||
          p.serialNumber === identifier;
        return matches ? { ...p, status: newStatus.toUpperCase() } : p;
      })
    );
  };

  const handleNoteChange = (identifier: string | number, notes: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        const matches =
          p.attendanceId === identifier ||
          p.playerId === identifier ||
          p.serialNumber === identifier;
        return matches ? { ...p, notes } : p;
      })
    );
  };

  // Quick Action: PUT /academies/training-sessions/:sessionId/attendance with { markAll: "..." }
  const handleQuickAction = async (action: "PRESENT" | "ABSENT" | "CLEAR") => {
    if (!sessionId) return;
    setQuickActionLoading(action);

    // Optimistically update local player state
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        status: action === "CLEAR" ? "UNMARKED" : action,
      }))
    );

    try {
      await updateSessionAttendance({
        sessionId,
        body: { markAll: action },
      }).unwrap();
    } catch {
      // Error handled by RTK mutation onQueryStarted ErrorToast
    } finally {
      setQuickActionLoading(null);
    }
  };

  // Save Attendance: PUT /academies/training-sessions/:sessionId/attendance with { attendances: [...] }
  const handleSaveAttendance = async () => {
    if (!sessionId) return;
    const attendances = players.map((p) => ({
      playerId: p.playerId,
      status: p.status?.toUpperCase() || "UNMARKED",
      ...(p.notes?.trim() ? { notes: p.notes.trim() } : {}),
    }));

    try {
      await updateSessionAttendance({
        sessionId,
        body: { attendances },
      }).unwrap();
      onClose();
    } catch {
      // Error handled by RTK mutation onQueryStarted ErrorToast
    }
  };

  // Counts based on current interactive state
  const presentCount = players.filter(
    (p) => p.status?.toUpperCase() === "PRESENT"
  ).length;
  const lateCount = players.filter(
    (p) => p.status?.toUpperCase() === "LATE"
  ).length;
  const absentCount = players.filter(
    (p) => p.status?.toUpperCase() === "ABSENT"
  ).length;
  const unmarkedCount = players.filter(
    (p) =>
      p.status?.toUpperCase() === "UNMARKED" ||
      !p.status ||
      (p.status?.toUpperCase() !== "PRESENT" &&
        p.status?.toUpperCase() !== "LATE" &&
        p.status?.toUpperCase() !== "ABSENT")
  ).length;

  // Filter players by search query
  const filteredPlayers = players.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.position?.toLowerCase().includes(q) ||
      p.jerseyNumber?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q)
    );
  });

  const isSaving = isUpdating && quickActionLoading === null;

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={onClose}
      title={session?.sessionName || "Attendance"}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2">
            {unmarkedCount > 0 ? (
              <div className="flex items-center gap-2 text-[#FBBF24]">
                <IconAlertCircle size={18} className="shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-widest font-orbitron">
                  {unmarkedCount} PLAYERS STILL UNMARKED
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#4ADE80]">
                <IconCheck size={18} className="shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-widest font-orbitron">
                  ALL PLAYERS MARKED
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || quickActionLoading !== null}
              className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex justify-center items-center shrink-0 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving || isLoading || quickActionLoading !== null}
              onClick={handleSaveAttendance}
              className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconDeviceFloppy size={18} />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="p-8 flex flex-col gap-6">
          <div className="h-8 bg-white/5 rounded-xl animate-pulse w-2/3" />
          <div className="h-12 bg-white/5 rounded-xl animate-pulse w-full" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse w-full" />
            ))}
          </div>
        </div>
      ) : isError && !sheetData ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <IconAlertCircle size={32} className="text-[#E31B23]" />
          <p className="text-white text-sm font-bold uppercase tracking-wider font-orbitron">
            Failed to load attendance sheet
          </p>
          <p className="text-white/40 text-xs">
            Please check your connection and try again.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Session Info Bar */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="bg-white/5 border border-white/15 px-3 py-1 rounded-full text-[10px] font-black text-white/80 uppercase tracking-widest">
              {session?.teamBadge || session?.teamName || "TEAM"}
            </span>
            <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-widest">
              <IconCalendar size={14} />
              {session?.date} • {session?.timeRange || `${session?.startTime} - ${session?.endTime}`}
            </div>
            {session?.coachName && (
              <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-widest">
                <IconUser size={14} />
                {session.coachName}
              </div>
            )}
            {session?.locationVenue && (
              <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-widest">
                <IconMapPin size={14} />
                {session.locationVenue}
              </div>
            )}
          </div>

          {/* Stats Badges / Overview Chips */}
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            <div className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <IconCheck size={16} className="text-[#4ADE80]" />
              <span className="text-[11px] font-black text-[#4ADE80] uppercase tracking-widest">
                {presentCount} Present
              </span>
            </div>
            <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <IconClockHour4 size={16} className="text-[#FBBF24]" />
              <span className="text-[11px] font-black text-[#FBBF24] uppercase tracking-widest">
                {lateCount} Late
              </span>
            </div>
            <div className="bg-[#E31B23]/10 border border-[#E31B23]/20 rounded-xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <IconX size={16} className="text-[#E31B23]" />
              <span className="text-[11px] font-black text-[#E31B23] uppercase tracking-widest">
                {absentCount} Absent
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2 shrink-0">
              <IconClock size={16} className="text-white/40" />
              <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">
                {unmarkedCount} Unmarked
              </span>
            </div>
            <div className="ml-auto flex items-center text-white/40 text-[11px] font-bold uppercase tracking-widest shrink-0">
              {players.length} total players
            </div>
          </div>

          {/* Quick Actions & Search Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white/2 border-y border-white/10 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest w-full sm:w-auto mb-2 sm:mb-0">
                Quick actions:
              </span>
              <button
                type="button"
                disabled={quickActionLoading !== null || isUpdating}
                onClick={() => handleQuickAction("PRESENT")}
                className="bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 border border-[#4ADE80]/20 rounded-xl px-4 py-2 flex items-center gap-2 text-[10px] font-black text-[#4ADE80] uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
              >
                {quickActionLoading === "PRESENT" ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : (
                  <IconCheck size={14} />
                )}
                Mark All Present
              </button>
              <button
                type="button"
                disabled={quickActionLoading !== null || isUpdating}
                onClick={() => handleQuickAction("ABSENT")}
                className="bg-[#E31B23]/10 hover:bg-[#E31B23]/20 border border-[#E31B23]/20 rounded-xl px-4 py-2 flex items-center gap-2 text-[10px] font-black text-[#E31B23] uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
              >
                {quickActionLoading === "ABSENT" ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : (
                  <IconX size={14} />
                )}
                Mark All Absent
              </button>
              <button
                type="button"
                disabled={quickActionLoading !== null || isUpdating}
                onClick={() => handleQuickAction("CLEAR")}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
              >
                {quickActionLoading === "CLEAR" && (
                  <IconLoader2 size={14} className="animate-spin" />
                )}
                Clear All
              </button>
            </div>
            <div className="relative w-full xl:w-auto mt-2 xl:mt-0">
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player..."
                className="bg-white/5 border border-white/15 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-white/25 w-full xl:w-48 placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          {/* Players List */}
          <div className="flex flex-col gap-2">
            {filteredPlayers.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs">
                No players found matching your search.
              </div>
            ) : (
              filteredPlayers.map((p, index) => {
                const currentStatus = p.status?.toUpperCase();
                const key = p.attendanceId || p.playerId || index;
                const isEditingNote = editingNotePlayerId === (p.attendanceId || p.playerId);

                return (
                  <div
                    key={key}
                    className={`flex flex-col p-4 rounded-2xl border transition-all ${
                      currentStatus === "PRESENT"
                        ? "bg-[#4ADE80]/5 border-[#4ADE80]/20"
                        : currentStatus === "LATE"
                        ? "bg-[#FBBF24]/5 border-[#FBBF24]/20"
                        : currentStatus === "ABSENT"
                        ? "bg-[#E31B23]/5 border-[#E31B23]/20"
                        : "bg-white/1 border-white/5 hover:bg-white/3"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                        <span className="w-6 text-[11px] font-black text-white/20 shrink-0 text-center">
                          {p.serialNumber || index + 1}
                        </span>
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="size-10 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5 flex items-center justify-center">
                            {p.avatar ? (
                              <Image
                                src={p.avatar}
                                alt={p.name}
                                className="size-full object-cover"
                                width={100}
                                height={100}
                              />
                            ) : (
                              <span className="text-white/40 font-bold text-xs uppercase">
                                {p.name?.slice(0, 2) || "PL"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-white leading-none mb-1 truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none truncate">
                              {p.jerseyNumber ? `${p.jerseyNumber} • ` : ""}
                              {p.position || "PLAYER"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap gap-2 md:justify-end mt-2 md:mt-0 w-full md:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              p.attendanceId || p.playerId || p.serialNumber,
                              "PRESENT"
                            )
                          }
                          className={`flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1 sm:gap-2 transition-all cursor-pointer ${
                            currentStatus === "PRESENT"
                              ? "bg-[#4ADE80] text-black border-[#4ADE80] shadow-sm shadow-[#4ADE80]/30"
                              : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <IconCheck size={14} />
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              p.attendanceId || p.playerId || p.serialNumber,
                              "LATE"
                            )
                          }
                          className={`flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1 sm:gap-2 transition-all cursor-pointer ${
                            currentStatus === "LATE"
                              ? "bg-[#FBBF24] text-black border-[#FBBF24] shadow-sm shadow-[#FBBF24]/30"
                              : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <IconClockHour4 size={14} />
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              p.attendanceId || p.playerId || p.serialNumber,
                              "ABSENT"
                            )
                          }
                          className={`flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1 sm:gap-2 transition-all cursor-pointer ${
                            currentStatus === "ABSENT"
                              ? "bg-[#E31B23] text-white border-[#E31B23] shadow-sm shadow-[#E31B23]/30"
                              : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <IconX size={14} />
                          Absent
                        </button>
                      </div>
                    </div>

                    {/* Optional Note Section */}
                    <div className="mt-2.5 pt-2 border-t border-white/5">
                      {isEditingNote ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={p.notes || ""}
                            onChange={(e) =>
                              handleNoteChange(
                                p.attendanceId || p.playerId || p.serialNumber,
                                e.target.value
                              )
                            }
                            placeholder="Add note (e.g., Arrived 15 mins late due to traffic)..."
                            className="flex-1 bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-all"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setEditingNotePlayerId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setEditingNotePlayerId(null)}
                            className="text-[10px] uppercase font-bold text-white/60 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                          >
                            Done
                          </button>
                        </div>
                      ) : p.notes ? (
                        <div
                          onClick={() =>
                            setEditingNotePlayerId(p.attendanceId || p.playerId)
                          }
                          className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white/90 cursor-pointer group/note transition-colors"
                        >
                          <IconNote
                            size={13}
                            className="shrink-0 text-white/40 group-hover/note:text-white/80"
                          />
                          <span className="italic truncate">&quot;{p.notes}&quot;</span>
                          <span className="text-[9px] uppercase tracking-wider text-white/30 ml-auto group-hover/note:text-white/60">
                            Edit note
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingNotePlayerId(p.attendanceId || p.playerId)
                          }
                          className="text-[10px] text-white/30 hover:text-white/70 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <IconNote size={12} />
                          <span>+ Add note</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </DashboardModal>
  );
};

export default SessionAttendanceModal;
