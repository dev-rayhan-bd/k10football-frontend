/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { events } from "@/components/user-wise-dashboard/academy-management/extraEvents";
import { 
  IconCalendar, 
  IconCurrencyDollar, 
  IconUsers, 
  IconMapPin, 
  IconArrowLeft, 
  IconCopy, 
  IconCheck, 
  IconPhone, 
  IconMail, 
  IconUser,
  IconStar,
  IconUsersGroup
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = Number(params?.id);

  // Find the event from the exported events array
  const event = events.find((e) => e.id === eventId) || {
    id: eventId,
    title: "Academy Special Event",
    date: "Date to be announced",
    fee: "Free",
    enrolled: "0/50",
    status: "Open",
    group: "Group A",
    ageGroup: "U-14",
    targetGroup: "Academy Players Only"
  };

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Back Navigation */}
      <Link 
        href="/dashboard/academy/management/extra-events" 
        className="flex items-center gap-2 text-white/60 hover:text-white transition-all text-xs font-black uppercase tracking-widest w-fit font-orbitron"
      >
        <IconArrowLeft size={16} />
        Back to Events
      </Link>

      {/* Main Details Card */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 overflow-hidden shadow-2xl">
        {/* Banner area */}
        <div className="h-64 bg-linear-to-br from-[#1E1B4B] to-[#0A0A0A] relative flex items-center justify-center p-8 border-b border-white/15">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center space-y-4 max-w-2xl">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              event.status === 'Open' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#FBBF24]/10 text-[#FBBF24]'
            }`}>
              {event.status}
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left / Center: Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-orbitron">
                  <IconCalendar size={14} className="text-[#E31B23]" /> Date
                </span>
                <span className="text-sm font-bold text-white uppercase">{event.date}</span>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-orbitron">
                  <IconCurrencyDollar size={14} className="text-[#E31B23]" /> Entry Fee
                </span>
                <span className="text-sm font-bold text-white uppercase">{event.fee}</span>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-orbitron">
                  <IconUsers size={14} className="text-[#E31B23]" /> Enrolled
                </span>
                <span className="text-sm font-bold text-white uppercase">{event.enrolled}</span>
              </div>
            </div>

            {/* Event Group, Age Group & Target Group Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-orbitron">
                  <IconUsersGroup size={14} className="text-[#E31B23]" /> Group
                </span>
                <span className="text-sm font-bold text-white uppercase">{event.group || "N/A"}</span>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-orbitron">
                  <IconStar size={14} className="text-[#E31B23]" /> Age Group
                </span>
                <span className="text-sm font-bold text-white uppercase">{event.ageGroup || "N/A"}</span>
              </div>
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5 font-orbitron">
                  <IconUser size={14} className="text-[#E31B23]" /> Target Group
                </span>
                <span className="text-sm font-bold text-white uppercase">{event.targetGroup || "N/A"}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Description</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Join our {event.title} organized by the Academy Management. This event is designed to bring our players, coaches, and families together for development and engagement. We will have dedicated drills, fun activities, and coaching sessions tailored for the participants.
              </p>
            </div>

            {/* Additional info */}
            <div className="space-y-4">
              <h3 className="text-xl font-black uppercase text-white font-orbitron">Requirements / What to Bring</h3>
              <ul className="text-sm text-white/60 space-y-2 list-disc pl-5">
                <li>Proper training uniform and cleats</li>
                <li>Water bottle and energy snacks</li>
                <li>Shin guards (mandatory for tournaments and matches)</li>
                <li>Signed parental consent form (for youth players)</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Venue, Contact & Share Link */}
          <div className="space-y-8 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8">
            {/* Share / Copy Link Box */}
            <div className="bg-white/2 border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white font-orbitron">Share Event</h4>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Copy this link to share the tournament details page with players, parents, or sponsors.
              </p>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C2181F] text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all shadow-lg shadow-[#E31B23]/10 font-orbitron cursor-pointer"
              >
                {copied ? (
                  <>
                    <IconCheck size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <IconCopy size={16} />
                    Copy Share Link
                  </>
                )}
              </button>
            </div>

            {/* Venue Box */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white/40 font-orbitron">Venue / Location</h4>
              <div className="flex items-start gap-2.5">
                <IconMapPin size={18} className="text-white/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-white">Academy Arena</p>
                  <p className="text-xs text-white/40 mt-0.5">123 Sports Drive, Suite 100, London</p>
                </div>
              </div>
            </div>

            {/* Contact Box */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white/40 font-orbitron">Contact Person</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-xs text-white/60">
                  <IconUser size={16} className="text-white/40" />
                  Mario Lopez (Scout Coordinator)
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/60">
                  <IconPhone size={16} className="text-white/40" />
                  +1 (555) 019-2834
                </div>
                <div className="flex items-center gap-2.5 text-xs text-white/60">
                  <IconMail size={16} className="text-white/40" />
                  m.lopez@academy.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Standings & Fixtures Arena */}
      {event.title.toLowerCase().includes("tournament") && (
        <TournamentSection ageGroup={event.ageGroup} />
      )}
    </div>
  );
}

const groupsData = {
  "Group A": [
    { pos: 1, team: "Santos FC Academy", p: 3, w: 2, d: 1, l: 0, gf: 7, ga: 2, gd: 5, pts: 7 },
    { pos: 2, team: "São Paulo Academy", p: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, gd: 2, pts: 6 },
    { pos: 3, team: "Palmeiras Academy", p: 3, w: 1, d: 1, l: 1, gf: 4, ga: 4, gd: 0, pts: 4 },
    { pos: 4, team: "Corinthians Youth", p: 3, w: 0, d: 0, l: 3, gf: 1, ga: 8, gd: -7, pts: 0 },
  ],
  "Group B": [
    { pos: 1, team: "Flamengo Youth", p: 3, w: 3, d: 0, l: 0, gf: 9, ga: 1, gd: 8, pts: 9 },
    { pos: 2, team: "Fluminense FC", p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 4, gd: -1, pts: 4 },
    { pos: 3, team: "Vasco da Gama", p: 3, w: 1, d: 0, l: 2, gf: 2, ga: 5, gd: -3, pts: 3 },
    { pos: 4, team: "Botafogo Academy", p: 3, w: 0, d: 1, l: 2, gf: 2, ga: 6, gd: -4, pts: 1 },
  ]
};

const fixturesData = [
  { id: 1, team1: "Santos FC Academy", score1: 3, team2: "Corinthians Youth", score2: 0, date: "2026-03-05", time: "10:00 AM", round: "Group Stage (Group A)", status: "Completed" },
  { id: 2, team1: "São Paulo Academy", score1: 2, team2: "Palmeiras Academy", score2: 1, date: "2026-03-05", time: "11:30 AM", round: "Group Stage (Group A)", status: "Completed" },
  { id: 3, team1: "Flamengo Youth", score1: 4, team2: "Botafogo Academy", score2: 0, date: "2026-03-05", time: "01:00 PM", round: "Group Stage (Group B)", status: "Completed" },
  { id: 4, team1: "Fluminense FC", score1: 1, team2: "Vasco da Gama", score2: 0, date: "2026-03-05", time: "02:30 PM", round: "Group Stage (Group B)", status: "Completed" },
  { id: 5, team1: "Santos FC Academy", score1: 2, team2: "Palmeiras Academy", score2: 2, date: "2026-03-08", time: "10:00 AM", round: "Group Stage (Group A)", status: "Completed" },
  { id: 6, team1: "São Paulo Academy", score1: 3, team2: "Corinthians Youth", score2: 1, date: "2026-03-08", time: "11:30 AM", round: "Group Stage (Group A)", status: "Completed" },
  { id: 7, team1: "Flamengo Youth", score1: 3, team2: "Vasco da Gama", score2: 1, date: "2026-03-08", time: "01:00 PM", round: "Group Stage (Group B)", status: "Completed" },
  { id: 8, team1: "Fluminense FC", score1: 1, team2: "Botafogo Academy", score2: 1, date: "2026-03-08", time: "02:30 PM", round: "Group Stage (Group B)", status: "Completed" },
  { id: 9, team1: "Santos FC Academy", score1: null, team2: "São Paulo Academy", score2: null, date: "2026-03-12", time: "10:00 AM", round: "Group Stage (Group A)", status: "Scheduled" },
  { id: 10, team1: "Palmeiras Academy", score1: null, team2: "Corinthians Youth", score2: null, date: "2026-03-12", time: "11:30 AM", round: "Group Stage (Group A)", status: "Scheduled" },
  { id: 11, team1: "Flamengo Youth", score1: null, team2: "Fluminense FC", score2: null, date: "2026-03-12", time: "01:00 PM", round: "Group Stage (Group B)", status: "Scheduled" },
  { id: 12, team1: "Vasco da Gama", score1: null, team2: "Botafogo Academy", score2: null, date: "2026-03-12", time: "02:30 PM", round: "Group Stage (Group B)", status: "Scheduled" },
];

const bracketData = {
  semis: [
    { id: 1, team1: "Santos FC Academy", score1: 2, team2: "Fluminense FC", score2: 1, winner: "Santos FC Academy", date: "2026-03-15", time: "10:00 AM" },
    { id: 2, team1: "Flamengo Youth", score1: 3, team2: "São Paulo Academy", score2: 2, winner: "Flamengo Youth", date: "2026-03-15", time: "01:00 PM" }
  ],
  final: {
    id: 3,
    team1: "Santos FC Academy",
    score1: null,
    team2: "Flamengo Youth",
    score2: null,
    date: "2026-03-20",
    time: "03:00 PM",
    venue: "Main Stadium"
  }
};

const TournamentSection = ({ ageGroup }: { ageGroup: string }) => {
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "bracket">("standings");
  const [selectedGroup, setSelectedGroup] = useState<"Group A" | "Group B">("Group A");

  return (
    <div className="bg-[#111111] rounded-4xl border border-white/15 p-8 md:p-12 shadow-2xl flex flex-col gap-8 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            Tournament Arena
          </h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] mt-1.5">
            Standings, fixtures and knockout brackets for target age group: {ageGroup}
          </p>
        </div>
        <div className="flex gap-2">
          {["standings", "fixtures", "bracket"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeTab === tab
                  ? "bg-[#E31B23] border-[#E31B23] text-white shadow-lg shadow-[#E31B23]/10"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "standings" && (
        <div className="space-y-6">
          <div className="flex gap-2">
            {["Group A", "Group B"].map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedGroup === grp
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-transparent text-white/40 hover:text-white"
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center w-12">Pos</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40">Team</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">P</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">W</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">D</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">L</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">GF</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">GA</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">GD</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {groupsData[selectedGroup].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/1 transition-all">
                    <td className="p-4 text-center font-black text-xs text-white/60 font-orbitron">{row.pos}</td>
                    <td className="p-4 text-sm font-bold text-white">{row.team}</td>
                    <td className="p-4 text-center font-bold text-sm text-white">{row.p}</td>
                    <td className="p-4 text-center text-sm font-bold text-green-400">{row.w}</td>
                    <td className="p-4 text-center text-sm font-bold text-gray-400">{row.d}</td>
                    <td className="p-4 text-center text-sm font-bold text-red-400">{row.l}</td>
                    <td className="p-4 text-center text-sm text-white/60">{row.gf}</td>
                    <td className="p-4 text-center text-sm text-white/60">{row.ga}</td>
                    <td className={`p-4 text-center text-sm font-bold ${row.gd > 0 ? 'text-green-400' : row.gd < 0 ? 'text-red-400' : 'text-white/60'}`}>
                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </td>
                    <td className="p-4 text-center font-black text-sm text-[#00FF62] font-orbitron">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "fixtures" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fixturesData.map((f) => (
            <div key={f.id} className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-white/40">
                <span>{f.round}</span>
                <span className={`px-2 py-0.5 rounded ${f.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                  {f.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 text-center">
                  <div className="text-xs font-bold text-white uppercase">{f.team1}</div>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl shrink-0 font-black text-sm font-orbitron text-white">
                  {f.status === 'Completed' ? `${f.score1} - ${f.score2}` : 'vs'}
                </div>
                <div className="flex-1 text-center">
                  <div className="text-xs font-bold text-white uppercase">{f.team2}</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/30 font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                <span>{f.date}</span>
                <span>{f.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "bracket" && (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 py-8 relative">
          {/* Semifinals */}
          <div className="flex flex-col gap-8 w-full max-w-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center font-orbitron">Semifinals</h4>
            {bracketData.semis.map((match) => (
              <div key={match.id} className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-3 relative shadow-lg">
                <div className="flex justify-between items-center text-[9px] font-bold text-white/30 uppercase tracking-widest">
                  <span>Match #{match.id}</span>
                  <span>{match.date}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${match.winner === match.team1 ? 'font-black text-white' : 'text-white/40'}`}>{match.team1}</span>
                    <span className="text-xs font-black text-white font-orbitron bg-white/5 px-2 py-0.5 rounded">{match.score1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${match.winner === match.team2 ? 'font-black text-white' : 'text-white/40'}`}>{match.team2}</span>
                    <span className="text-xs font-black text-white font-orbitron bg-white/5 px-2 py-0.5 rounded">{match.score2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Connection Divider for Large Screens */}
          <div className="hidden lg:block w-12 h-0.5 bg-white/10 shrink-0" />

          {/* Final */}
          <div className="w-full max-w-sm flex flex-col gap-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#E31B23] text-center font-orbitron animate-pulse">Championship Final</h4>
            <div className="bg-[#E31B23]/5 border-2 border-[#E31B23]/25 rounded-3xl p-6 space-y-4 relative shadow-2xl">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#E31B23]">
                <span>Grand Final</span>
                <span>{bracketData.final.date} - {bracketData.final.time}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-sm font-black text-white">{bracketData.final.team1}</span>
                  <span className="text-xs font-bold text-white/30">TBD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-white">{bracketData.final.team2}</span>
                  <span className="text-xs font-bold text-white/30">TBD</span>
                </div>
              </div>
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center pt-2">
                Venue: {bracketData.final.venue}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
