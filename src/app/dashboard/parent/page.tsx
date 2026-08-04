"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconUsers,
  IconCalendar,
  IconCreditCard,
  IconReportAnalytics,
  IconArrowRight,
  IconMessage2,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ParentDashboardOverview() {
  const [rsvpStatus, setRsvpStatus] = useState<"Pending" | "Attending" | "Declined">("Pending");

  const childProfile = {
    name: "Marcus Silva",
    position: "Forward",
    rating: 94,
    tier: "GOLD",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    academy: "São Paulo Academy",
    coach: "Didier Deschamps"
  };

  const recentActivities = [
    {
      id: 1,
      type: "coach_evaluation",
      title: "New evaluation summary posted",
      description: "Coach Didier Deschamps updated Marcus's positioning rating to 95.",
      time: "2 hours ago",
      icon: IconMessage2,
      iconColor: "text-blue-400"
    },
    {
      id: 2,
      type: "payment",
      title: "Invoice Generated",
      description: "Monthly training fee invoice for August ($45.00) has been generated.",
      time: "1 day ago",
      icon: IconCreditCard,
      iconColor: "text-yellow-400"
    },
    {
      id: 3,
      type: "match_report",
      title: "Match report submitted",
      description: "Report for 'vs Palmeiras U17' was sent to Coach Didier for verification.",
      time: "3 days ago",
      icon: IconReportAnalytics,
      iconColor: "text-green-400"
    }
  ];

  const handleRsvp = (status: "Attending" | "Declined") => {
    setRsvpStatus(status);
    toast.success(`RSVP updated: Marcus is marked as ${status.toLowerCase()}`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
          Guardian <span className="text-primary italic">Overview</span>
        </h1>
        <p className="text-white/60 font-bold uppercase tracking-widest text-[11px] mt-2">
          Monitor your child&apos;s football development and manage academy services
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Children Card */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <IconUsers size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Children</span>
            <p className="text-2xl font-black text-white font-orbitron mt-0.5">1 Player</p>
          </div>
        </div>

        {/* Next Training Card */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
            <IconCalendar size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Next Session</span>
            <p className="text-sm font-bold text-white mt-1">Tue, 4:00 PM</p>
          </div>
        </div>

        {/* Pending Fees Card */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
            <IconCreditCard size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Pending Fees</span>
            <p className="text-2xl font-black text-white font-orbitron mt-0.5">$45.00</p>
          </div>
        </div>

        {/* Match Reports Card */}
        <div className="bg-[#0D0D0D]/40 border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <IconReportAnalytics size={24} />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Active Reports</span>
            <p className="text-2xl font-black text-white font-orbitron mt-0.5">1 Pending</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Child Profile Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-black uppercase text-white font-orbitron">Youth Profile</h2>
              <Link href="/dashboard/parent/profiles">
                <span className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer uppercase tracking-wider">
                  Manage Profile <IconArrowRight size={14} />
                </span>
              </Link>
            </div>

            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-black/40 border border-white/5">
              <Image
                src={childProfile.avatar}
                alt={childProfile.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{childProfile.name}</h3>
                  <Badge className="w-fit mx-auto sm:mx-0 bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold">
                    {childProfile.tier} Profile
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 font-light">
                  Position: <span className="text-white font-medium">{childProfile.position}</span> | Academy: <span className="text-white font-medium">{childProfile.academy}</span>
                </p>
                <p className="text-xs text-gray-400 font-light">
                  Head Coach: <span className="text-white font-medium">{childProfile.coach}</span>
                </p>
              </div>

              {/* Rating Circle */}
              <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex flex-col items-center justify-center bg-black/50">
                <span className="text-2xl font-black text-white font-orbitron leading-none">{childProfile.rating}</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Rating</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-xl font-black uppercase text-white font-orbitron">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                    <div className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${act.iconColor} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-sm font-bold text-white leading-none">{act.title}</h4>
                        <span className="text-[10px] text-gray-500 font-bold shrink-0">{act.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Cards (RSVP, Quick Links) */}
        <div className="space-y-6">
          {/* Training RSVP Widget */}
          <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-black uppercase text-white font-orbitron">Training RSVP</h2>
              <p className="text-xs text-gray-500 mt-1 font-light">Confirm your child&apos;s attendance for the upcoming session.</p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <IconCalendar size={18} className="text-primary" />
                <div>
                  <h4 className="text-xs font-bold text-white">August Training Session A</h4>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Tuesday, 4:00 PM at Pitch A</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">RSVP Status</span>
                <Badge className={`text-[9px] font-bold ${rsvpStatus === "Attending" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                  rsvpStatus === "Declined" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                    "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  }`}>
                  {rsvpStatus}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRsvp("Attending")}
                className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${rsvpStatus === "Attending"
                  ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/10"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
              >
                <IconCheck size={16} /> Yes
              </button>
              <button
                onClick={() => handleRsvp("Declined")}
                className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${rsvpStatus === "Declined"
                  ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/10"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}
              >
                <IconX size={16} /> No
              </button>
            </div>
          </div>

          {/* Quick Support Links */}
          <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-lg font-black uppercase text-white font-orbitron">Quick Access</h2>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/parent/fees">
                <button className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between uppercase tracking-wider">
                  Pay Academy Fee &rarr;
                </button>
              </Link>
              <Link href="/dashboard/parent/game-reports">
                <button className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between uppercase tracking-wider">
                  Submit Match Stats &rarr;
                </button>
              </Link>
              <Link href="/dashboard/parent/shop">
                <button className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between uppercase tracking-wider">
                  Shop Uniform / Kit &rarr;
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
