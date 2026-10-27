/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  IconSearch, 
  IconPlus, 
  IconFilter, 
  IconCalendar, 
  IconClock, 
  IconUser, 
  IconCheck, 
  IconX, 
  IconClockHour4, 
  IconChevronRight, 
  IconAlertCircle,
  IconPencil,
  IconTrash
} from "@tabler/icons-react";
import { 
  CreateTrainingSessionModal, 
  EditTrainingSessionModal,
  DeleteTrainingSessionModal,
  SessionAttendanceModal 
} from "./training-sessions/index";
import { useGetTrainingSessionsQuery } from "@/redux/features/academy/academyApi";
import { ITrainingSessionListItem } from "@/types/academy.type";

const defaultSessions: ITrainingSessionListItem[] = [
  {
    id: 1,
    _id: "6adc217c118a25d702953410",
    teamBadge: "U-15",
    teamName: "U-15",
    date: "Jan 25, 2026",
    timeRange: "9:00 AM - 11:00 AM",
    sessionName: "Set Pieces & Dead Balls",
    coachName: "John Smith",
    attendancePercentage: 0,
    stats: { present: 0, late: 0, absent: 0, total: 20 },
    color: "#E31B23"
  },
  {
    id: 2,
    _id: "6adc217c118a25d702953410",
    teamBadge: "U-16",
    teamName: "U-16",
    date: "Jan 25, 2026",
    timeRange: "9:00 AM - 11:00 AM",
    sessionName: "Goalkeeper Session",
    coachName: "Mike Williams",
    attendancePercentage: 98,
    stats: { present: 16, late: 4, absent: 2, total: 22 },
    color: "#4ADE80"
  },
  {
    id: 3,
    _id: "6adc217c118a25d702953410",
    teamBadge: "U-17",
    teamName: "U-17",
    date: "Jan 25, 2026",
    timeRange: "9:00 AM - 11:00 AM",
    sessionName: "Tactical Play & Formation",
    coachName: "Sarah Johnson",
    attendancePercentage: 25,
    stats: { present: 5, late: 0, absent: 15, total: 20 },
    color: "#E31B23"
  },
  {
    id: 4,
    _id: "6adc217c118a25d702953410",
    teamBadge: "U-19",
    teamName: "U-19",
    date: "Jan 25, 2026",
    timeRange: "9:00 AM - 11:00 AM",
    sessionName: "Ball Control & Dribbling",
    coachName: "Mike Williams",
    attendancePercentage: 82,
    stats: { present: 18, late: 4, absent: 7, total: 25 },
    color: "#FBBF24"
  }
];

export const TrainingSessions = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<ITrainingSessionListItem | null>(null);
  const [selectedSessionForDelete, setSelectedSessionForDelete] = useState<ITrainingSessionListItem | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term by 400ms before sending to API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch training sessions from API with searchTerm
  const { data: sessionsResponse, isLoading } = useGetTrainingSessionsQuery({
    searchTerm: debouncedSearch.trim() || undefined,
  });

  // Extract sessions list from API response
  const apiSessions: ITrainingSessionListItem[] = useMemo(() => {
    if (!sessionsResponse?.data) return [];
    if (Array.isArray(sessionsResponse.data)) {
      return sessionsResponse.data;
    }
    if (Array.isArray((sessionsResponse.data as { sessions?: ITrainingSessionListItem[] })?.sessions)) {
      return (sessionsResponse.data as { sessions: ITrainingSessionListItem[] }).sessions;
    }
    return [];
  }, [sessionsResponse]);

  // Determine active sessions to display (use API data, or fallback with client-side filter if DB unseeded)
  const displaySessions = useMemo(() => {
    if (apiSessions.length > 0) {
      return apiSessions;
    }
    // If API returned nothing and user hasn't searched, fallback to default sessions
    if (!debouncedSearch.trim() && !isLoading) {
      return defaultSessions;
    }
    // If user searched and API returned 0 results, also check fallback items as safe client-side filter
    if (debouncedSearch.trim() && !isLoading && !sessionsResponse?.data) {
      const q = debouncedSearch.toLowerCase();
      return defaultSessions.filter(
        (s) =>
          s.sessionName?.toLowerCase().includes(q) ||
          s.teamBadge?.toLowerCase().includes(q) ||
          s.coachName?.toLowerCase().includes(q)
      );
    }
    return [];
  }, [apiSessions, debouncedSearch, isLoading, sessionsResponse]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">Training Sessions</h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">Schedule and manage training sessions</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
        >
          <IconPlus size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Create Session</span>
        </button>
      </div>

      {/* Search Bar with searchTerm Query Integration */}
      <div className="bg-[#111111] rounded-3xl border border-white/15 p-4 flex flex-col sm:flex-row gap-4 shadow-xl">
        <div className="relative flex-1 min-w-0">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sessions by team, coach, or title..."
            className="w-full bg-white/2 border border-white/15 rounded-2xl py-3 pl-12 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
              title="Clear search"
            >
              <IconX size={16} />
            </button>
          )}
        </div>
        <button className="w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shrink-0 cursor-pointer">
          <IconFilter size={20} />
          <span className="text-sm font-bold">Filters</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#111111] rounded-4xl border border-white/10 p-5 md:p-6 flex flex-col gap-5 md:gap-6 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 w-16 bg-white/5 rounded-xl" />
                <div className="h-6 w-24 bg-white/5 rounded-xl" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-4 w-3/4 bg-white/5 rounded-lg" />
                <div className="h-7 w-full bg-white/5 rounded-lg" />
                <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <div className="h-2 w-full bg-white/5 rounded-full" />
                <div className="h-4 w-full bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : displaySessions.length === 0 ? (
        /* Empty State */
        <div className="bg-[#111111] rounded-3xl border border-white/10 p-12 text-center flex flex-col items-center justify-center gap-3">
          <IconAlertCircle size={32} className="text-white/30" />
          <p className="text-white text-sm font-bold uppercase tracking-wider font-orbitron">
            No Training Sessions Found
          </p>
          <p className="text-white/40 text-xs">
            {searchTerm
              ? `No sessions match "${searchTerm}". Try a different keyword.`
              : "No training sessions available at the moment."}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="mt-2 px-4 py-2 rounded-xl border border-white/15 text-xs text-white hover:bg-white/5 transition-all cursor-pointer font-bold"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Session Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displaySessions.map((session) => {
            const sessionId =
              session._id ||
              (session.id ? session.id.toString() : "6adc217c118a25d702953410");
            const team =
              typeof session.teamBadge === "string"
                ? session.teamBadge
                : typeof session.teamName === "string"
                ? session.teamName
                : typeof session.team === "string"
                ? session.team
                : (session as any).team?.teamName || (session as any).team?.name || "U-15";
            const title =
              typeof session.sessionName === "string"
                ? session.sessionName
                : typeof session.title === "string"
                ? session.title
                : "Training Session";
            const date =
              typeof session.date === "string"
                ? session.date
                : typeof session.sessionDate === "string"
                ? session.sessionDate
                : typeof session.formattedDate === "string"
                ? session.formattedDate
                : "Jan 25, 2026";
            const time =
              typeof session.timeRange === "string"
                ? session.timeRange
                : session.startTime && session.endTime
                ? `${session.startTime} - ${session.endTime}`
                : typeof session.time === "string"
                ? session.time
                : "9:00 AM - 11:00 AM";
            const coach =
              typeof session.coachName === "string"
                ? session.coachName
                : typeof session.coach === "string"
                ? session.coach
                : (session as any).coach?.fullName || (session as any).coach?.name || "COACH";

            const attendanceObj =
              typeof session.attendance === "object" && session.attendance !== null
                ? (session.attendance as any)
                : null;

            const attendance: number =
              typeof session.attendance === "number"
                ? session.attendance
                : typeof attendanceObj?.percentage === "number"
                ? attendanceObj.percentage
                : typeof session.attendancePercentage === "number"
                ? session.attendancePercentage
                : typeof session.attendanceRate === "number"
                ? session.attendanceRate
                : 0;

            const stats = {
              present:
                typeof attendanceObj?.present === "number"
                  ? attendanceObj.present
                  : typeof session.stats?.present === "number"
                  ? session.stats.present
                  : typeof session.overviewChips?.presentCount === "number"
                  ? session.overviewChips.presentCount
                  : 0,
              late:
                typeof attendanceObj?.late === "number"
                  ? attendanceObj.late
                  : typeof session.stats?.late === "number"
                  ? session.stats.late
                  : typeof session.overviewChips?.lateCount === "number"
                  ? session.overviewChips.lateCount
                  : 0,
              absent:
                typeof attendanceObj?.absent === "number"
                  ? attendanceObj.absent
                  : typeof session.stats?.absent === "number"
                  ? session.stats.absent
                  : typeof session.overviewChips?.absentCount === "number"
                  ? session.overviewChips.absentCount
                  : 0,
              total:
                typeof attendanceObj?.total === "number"
                  ? attendanceObj.total
                  : typeof session.stats?.total === "number"
                  ? session.stats.total
                  : typeof session.overviewChips?.totalPlayers === "number"
                  ? session.overviewChips.totalPlayers
                  : 0,
            };

            if (!stats.total) {
              stats.total = stats.present + stats.late + stats.absent;
            }

            const color =
              session.color ||
              (attendance > 75
                ? "#4ADE80"
                : attendance > 40
                ? "#FBBF24"
                : "#E31B23");

            return (
              <div 
                key={sessionId} 
                onClick={() => setSelectedSessionId(sessionId)}
                className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-6 flex flex-col gap-5 md:gap-6 hover:border-white/30 transition-all cursor-pointer group shadow-xl"
              >
                {/* Card Header: Team Badge & Action Buttons */}
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-white/5 border border-white/15 px-3 md:px-4 py-2 rounded-xl text-[10px] font-black text-white/80 uppercase tracking-widest shrink-0">
                    {team}
                  </span>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Edit Session Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionForEdit(session);
                      }}
                      title="Edit Session"
                      className="size-8 rounded-xl bg-white/5 hover:bg-white/15 text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                    >
                      <IconPencil size={15} />
                    </button>

                    {/* Delete Session Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionForDelete(session);
                      }}
                      title="Delete Session"
                      className="size-8 rounded-xl bg-white/5 hover:bg-[#E31B23]/15 text-white/40 hover:text-[#E31B23] flex items-center justify-center transition-all cursor-pointer border border-white/10"
                    >
                      <IconTrash size={15} />
                    </button>

                    {/* Attendance Modal Trigger Button */}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionId(sessionId);
                      }}
                      className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl border text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 min-w-0 cursor-pointer ${
                        attendance > 50 
                        ? "bg-[#4ADE80]/10 border-[#4ADE80]/20 text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-black" 
                        : "bg-[#E31B23]/10 border-[#E31B23]/20 text-[#E31B23] group-hover:bg-[#E31B23] group-hover:text-white"
                      }`}
                    >
                      {attendance > 50 ? <IconCheck size={14} className="shrink-0" /> : <IconAlertCircle size={14} className="shrink-0" />}
                      <span className="truncate">Attendance</span>
                      <IconChevronRight size={14} className="shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <IconCalendar size={14} className="shrink-0" />
                      {date}
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <IconClock size={14} className="shrink-0" />
                      {time}
                    </div>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white font-orbitron leading-tight min-h-12 line-clamp-2 wrap-break-word">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-widest wrap-break-word">
                    <IconUser size={14} className="shrink-0" />
                    Coach: <span className="text-white/80">{coach}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Attendance:</span>
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">({attendance}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ 
                        width: `${attendance}%`,
                        backgroundColor: color
                      }} 
                    />
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-[#4ADE80]">
                      <IconCheck size={12} strokeWidth={4} />
                      {stats.present}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#FBBF24]">
                      <IconClockHour4 size={12} strokeWidth={4} />
                      {stats.late}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#E31B23]">
                      <IconX size={12} strokeWidth={4} />
                      {stats.absent}
                    </div>
                    <div className="ml-auto text-white/20">
                      Total: {stats.total}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance Modal (API Integrated) */}
      <SessionAttendanceModal
        isOpen={Boolean(selectedSessionId)}
        sessionId={selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />

      {/* Create Session Modal */}
      <CreateTrainingSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Session Modal */}
      <EditTrainingSessionModal
        isOpen={Boolean(selectedSessionForEdit)}
        session={selectedSessionForEdit}
        onClose={() => setSelectedSessionForEdit(null)}
      />

      {/* Delete Session Modal (Compact Pop-up) */}
      <DeleteTrainingSessionModal
        isOpen={Boolean(selectedSessionForDelete)}
        session={selectedSessionForDelete}
        onClose={() => setSelectedSessionForDelete(null)}
      />
    </div>
  );
};

export default TrainingSessions;