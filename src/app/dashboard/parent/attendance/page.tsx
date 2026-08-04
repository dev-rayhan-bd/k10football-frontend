"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
  IconX,
  IconUser,
  IconPercentage
} from "@tabler/icons-react";

interface TrainingSession {
  id: string;
  title: string;
  date: string;
  time: string;
  pitch: string;
  coach: string;
  status: "Attending" | "Declined" | "Pending" | "Present" | "Absent";
  type: "upcoming" | "past";
}

export default function ParentAttendance() {
  const [sessions, setSessions] = useState<TrainingSession[]>([
    {
      id: "SESS-104",
      title: "Tactical & Position Training",
      date: "2026-08-04",
      time: "04:00 PM - 06:00 PM",
      pitch: "Academy Field A",
      coach: "Didier Deschamps",
      status: "Pending",
      type: "upcoming"
    },
    {
      id: "SESS-105",
      title: "Fitness & Endurance Drill",
      date: "2026-08-07",
      time: "09:00 AM - 11:00 AM",
      pitch: "Stamina Field C",
      coach: "Claudio Ranieri",
      status: "Pending",
      type: "upcoming"
    },
    {
      id: "SESS-103",
      title: "Attacking Set Pieces Practice",
      date: "2026-07-28",
      time: "04:00 PM - 06:00 PM",
      pitch: "Academy Field A",
      coach: "Didier Deschamps",
      status: "Present",
      type: "past"
    },
    {
      id: "SESS-102",
      title: "Friendly Match vs Palmeiras U17",
      date: "2026-07-25",
      time: "03:00 PM - 05:00 PM",
      pitch: "Main Stadium",
      coach: "Didier Deschamps",
      status: "Present",
      type: "past"
    },
    {
      id: "SESS-101",
      title: "Defensive Coordination Drill",
      date: "2026-07-21",
      time: "04:00 PM - 06:00 PM",
      pitch: "Defensive Zone B",
      coach: "Claudio Ranieri",
      status: "Absent",
      type: "past"
    }
  ]);

  const handleRsvp = (sessionId: string, newStatus: "Attending" | "Declined") => {
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, status: newStatus } : s));
    toast.success(`Training session RSVP set to: ${newStatus}`);
  };

  const attendanceStats = {
    totalPast: sessions.filter(s => s.type === "past").length,
    present: sessions.filter(s => s.status === "Present").length,
    absent: sessions.filter(s => s.status === "Absent").length,
    rate: 0
  };
  attendanceStats.rate = attendanceStats.totalPast > 0
    ? Math.round((attendanceStats.present / attendanceStats.totalPast) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
          Training <span className="text-primary italic">Attendance</span>
        </h1>
        <p className="text-white/60 font-bold uppercase tracking-widest text-[11px] mt-2">
          Monitor your child&apos;s training schedule and confirm RSVPs
        </p>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
            <IconPercentage size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Attendance Rate</span>
            <p className="text-2xl font-black text-white font-orbitron mt-0.5">{attendanceStats.rate}%</p>
          </div>
        </div>

        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <IconCalendar size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Total Sessions</span>
            <p className="text-2xl font-black text-white font-orbitron mt-0.5">{attendanceStats.totalPast} Sessions</p>
          </div>
        </div>

        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <IconCheck size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Present</span>
            <p className="text-2xl font-black text-emerald-400 font-orbitron mt-0.5">{attendanceStats.present}</p>
          </div>
        </div>

        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
            <IconX size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Absent</span>
            <p className="text-2xl font-black text-red-500 font-orbitron mt-0.5">{attendanceStats.absent}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-xl font-black uppercase text-white font-orbitron">Upcoming Sessions</h2>
          <div className="space-y-4">
            {sessions
              .filter(s => s.type === "upcoming")
              .map((sess) => (
                <div
                  key={sess.id}
                  className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">{sess.title}</h3>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{sess.id}</span>
                    </div>
                    <Badge className={`text-[8px] font-bold ${
                      sess.status === "Attending" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                      sess.status === "Declined" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    }`}>
                      {sess.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5"><IconClock size={14} /> {sess.time}</span>
                    <span className="flex items-center gap-1.5"><IconMapPin size={14} /> {sess.pitch}</span>
                    <span className="flex items-center gap-1.5"><IconUser size={14} /> Coach: {sess.coach}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5 justify-end">
                    <button
                      onClick={() => handleRsvp(sess.id, "Attending")}
                      className={`px-4 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                        sess.status === "Attending"
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <IconCheck size={12} /> Confirm Attendance
                    </button>
                    <button
                      onClick={() => handleRsvp(sess.id, "Declined")}
                      className={`px-4 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                        sess.status === "Declined"
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <IconX size={12} /> Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Past Sessions History */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-xl font-black uppercase text-white font-orbitron">Past Sessions</h2>
          <div className="space-y-4">
            {sessions
              .filter(s => s.type === "past")
              .map((sess) => (
                <div
                  key={sess.id}
                  className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-3 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">{sess.title}</h3>
                      <span className="text-[10px] text-gray-500 font-bold">{sess.date}</span>
                    </div>
                    <Badge className={`text-[8px] font-bold ${
                      sess.status === "Present" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                      "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}>
                      {sess.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="flex items-center gap-1"><IconMapPin size={12} /> {sess.pitch}</span>
                    <span>Coach: {sess.coach}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
