"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCreditCard,
  IconClock,
  IconCircleCheck,
  IconLock,
} from "@tabler/icons-react";
import { useParentSubscriptionAccess } from "@/hooks/useParentSubscriptionAccess";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Report {
  id: number;
  opponent: string;
  date: string;
  rating: number;
  status: "Pending" | "Paid" | "Verified";
  amount: string;
  events: { type: "Goal" | "Assist"; x: number; y: number }[];
}

const ParentGameReports = () => {
  const router = useRouter();
  const { isUnlocked, isLoading } = useParentSubscriptionAccess();
  const [reports, setReports] = useState<Report[]>([
{
  id: 1,
  opponent: "Palmeiras U17",
  date: "2026-08-01",
  rating: 8.5,
  status: "Verified",
  amount: "$25.00",
  events: [
    { type: "Goal", x: 75, y: 35 },
    { type: "Assist", x: 60, y: 55 }
  ]
},
{
  id: 2,
  opponent: "Corinthians U17",
  date: "2026-08-03",
  rating: 0.0,
  status: "Pending",
  amount: "$25.00",
  events: [
    { type: "Goal", x: 80, y: 48 }
  ]
}
]);

const [newOpponent, setNewOpponent] = useState("");
const [newDate, setNewDate] = useState("");
const [eventType, setEventType] = useState<"Goal" | "Assist">("Goal");
const [activeEvents, setActiveEvents] = useState<{ type: "Goal" | "Assist"; x: number; y: number }[]>([]);
const [isPaying, setIsPaying] = useState(false);
const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

const pitchRef = useRef<HTMLDivElement>(null);

const handlePitchClick = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!isUnlocked) {
    toast.error("Active subscription required to plot match stats and create scouting reports.");
    router.push("/dashboard/parent/my-subscription");
    return;
  }
  if (!pitchRef.current) return;
const rect = pitchRef.current.getBoundingClientRect();
const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

setActiveEvents([...activeEvents, { type: eventType, x, y }]);
toast.success(`Position marked for ${eventType}! (X: ${x}%, Y: ${y}%)`);
};

const clearEvents = () => {
setActiveEvents([]);
toast.info("Cleared marked events.");
};

const handleCreateReport = () => {
  if (!isUnlocked) {
    toast.error("Active subscription required to save scouting match reports.");
    router.push("/dashboard/parent/my-subscription");
    return;
  }
if (!newOpponent.trim()) {
  toast.error("Please enter opponent team name.");
  return;
}
if (!newDate) {
  toast.error("Please select match date.");
  return;
}
if (activeEvents.length === 0) {
  toast.error("Please mark at least one goal or assist on the pitch.");
  return;
}

const newReport: Report = {
  id: Date.now(),
  opponent: newOpponent,
  date: newDate,
  rating: 0,
  status: "Pending",
  amount: "$25.00",
  events: activeEvents
};

setReports([newReport, ...reports]);
setNewOpponent("");
setNewDate("");
setActiveEvents([]);
toast.success("Game report saved! You can now request a paid review.");
};

const handleRequestReview = (reportId: number) => {
  if (!isUnlocked) {
    toast.error("Active subscription required to request coach reviews.");
    router.push("/dashboard/parent/my-subscription");
    return;
  }
setSelectedReportId(reportId);
setIsPaying(true);
};

const handlePaymentConfirm = async () => {
const toastId = toast.loading("Processing payment gateway checkout...");
await new Promise((resolve) => setTimeout(resolve, 1500));
setReports(reports.map(r => r.id === selectedReportId ? { ...r, status: "Paid" } : r));
setIsPaying(false);
toast.success("Payment completed! Report sent to Coach Didier Deschamps for verification.", { id: toastId });
};

return (
<div className="space-y-6 sm:space-y-8 pb-8 sm:pb-12 w-full min-w-0 overflow-hidden">
  {/* Header */}
  <div className="w-full min-w-0">
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none truncate">
      Match <span className="text-primary italic">Reports</span>
    </h1>
    <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] sm:text-[11px] mt-2 line-clamp-2 sm:line-clamp-none">
      Create match reports, plot goals/assists on interactive pitch, and request coach evaluations
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 w-full min-w-0">
    {/* Plotting & Form (7 cols) */}
    <div className="lg:col-span-8 bg-[#0D0D0D]/40 border border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6 min-w-0 w-full">
      <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron truncate">Submit Performance Stats</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0">
        <div className="space-y-1.5 w-full min-w-0">
          <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 truncate block">
            Opponent Team
          </label>
          <input
            type="text"
            placeholder="e.g. Palmeiras U17"
            value={newOpponent}
            onChange={(e) => setNewOpponent(e.target.value)}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-xs sm:text-sm min-w-0"
          />
        </div>

        <div className="space-y-1.5 w-full min-w-0">
          <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 truncate block">
            Match Date
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-xs sm:text-sm scheme-dark min-w-0"
          />
        </div>
      </div>

      {/* Interactive Pitch */}
      <div className="space-y-3 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 w-full min-w-0">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 truncate">
            Mark Event (Click to plot)
          </span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setEventType("Goal")}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase transition-all border whitespace-nowrap ${
                eventType === "Goal"
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              Goal Spot
            </button>
            <button
              onClick={() => setEventType("Assist")}
              className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase transition-all border whitespace-nowrap ${
                eventType === "Assist"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              Assist Spot
            </button>
            <button
              onClick={clearEvents}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-gray-400 hover:text-white whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Soccer Pitch Canvas */}
        <div
          ref={pitchRef}
          onClick={handlePitchClick}
          className="relative w-full aspect-2/1 rounded-xl sm:rounded-2xl bg-linear-to-br from-green-900 to-emerald-950 border border-white/10 overflow-hidden cursor-crosshair flex items-center justify-center select-none shadow-inner"
        >
          {/* Pitch Markings */}
          <div className="absolute inset-2 sm:inset-4 border-2 border-white/20 pointer-events-none" />
          <div className="absolute left-1/2 top-2 bottom-2 sm:top-4 sm:bottom-4 border-l-2 border-white/20 pointer-events-none" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-24 sm:h-24 border-2 border-white/20 rounded-full pointer-events-none" />
          <div className="absolute left-2 sm:left-4 top-1/4 bottom-1/4 w-8 sm:w-16 border-2 border-l-0 border-white/20 pointer-events-none" />
          <div className="absolute right-2 sm:right-4 top-1/4 bottom-1/4 w-8 sm:w-16 border-2 border-r-0 border-white/20 pointer-events-none" />

          {/* Plotted Event Pins */}
          {activeEvents.map((ev, idx) => (
            <div
              key={idx}
              style={{ left: `${ev.x}%`, top: `${ev.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-[6px] sm:text-[8px] font-black text-white shadow-lg pointer-events-none animate-ping-once ${
                ev.type === "Goal" ? "bg-red-500 shadow-red-500/50" : "bg-blue-500 shadow-blue-500/50"
              }`}
            >
              {ev.type[0]}
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleCreateReport}
        className="w-full bg-[#E31B23] hover:bg-[#C2181F] text-white py-4 sm:py-6 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-[#E31B23]/20 flex items-center justify-center gap-2"
      >
        {!isUnlocked && <IconLock size={14} />}
        <span>Save Report Details</span>
      </Button>
    </div>

    {/* Existing Reports list (4 cols) */}
    <div className="lg:col-span-4 bg-[#0D0D0D]/40 border border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-6 min-w-0 w-full">
      <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron truncate">Match History</h2>

      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-3 hover:border-white/10 transition-all w-full min-w-0"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">vs {report.opponent}</h3>
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold block truncate">{report.date}</span>
              </div>
              <Badge className={`text-[8px] sm:text-[9px] font-bold shrink-0 ${
                report.status === "Verified" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                report.status === "Paid" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
              }`}>
                {report.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400">
              <span className="truncate">Rating: <strong className="text-white font-medium">{report.rating > 0 ? report.rating.toFixed(1) : "N/A"}</strong></span>
              <span className="truncate ml-2">Plotted: <strong className="text-white font-medium">{report.events.length}</strong></span>
            </div>

            {report.status === "Pending" && (
              <button
                onClick={() => handleRequestReview(report.id)}
                className="w-full py-2 sm:py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all truncate px-2"
              >
                <IconCreditCard size={14} className="shrink-0" /> <span className="truncate">Request Review ({report.amount})</span>
              </button>
            )}

            {report.status === "Paid" && (
              <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase text-center flex items-center justify-center gap-1 truncate px-2">
                <IconClock size={12} className="shrink-0" /> <span className="truncate">Awaiting Validation</span>
              </div>
            )}

            {report.status === "Verified" && (
              <div className="text-[9px] sm:text-[10px] text-green-400 font-bold uppercase text-center flex items-center justify-center gap-1 truncate px-2">
                <IconCircleCheck size={12} className="shrink-0" /> <span className="truncate">Coach Evaluated</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Stripe mock checkout modal */}
  {isPaying && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
      <div className="bg-[#0D0D0D] border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-3xl max-w-md w-full space-y-4 sm:space-y-6 shadow-2xl flex flex-col min-w-0 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-1 sm:space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-white uppercase font-orbitron truncate">Coach Evaluation Payment</h3>
          <p className="text-[10px] sm:text-xs text-gray-400">Confirm Stripe card details for paid validation review.</p>
        </div>

        <div className="space-y-3 sm:space-y-4 w-full min-w-0">
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-black border border-white/5 flex flex-col gap-1 sm:gap-2">
            <span className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-wider truncate">Checkout Total</span>
            <span className="text-2xl sm:text-3xl font-black text-white font-orbitron truncate">$25.00</span>
          </div>

          <div className="space-y-1 sm:space-y-1.5 w-full min-w-0">
            <label className="text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-wider ml-1 truncate block">Card Details</label>
            <div className="px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-lg sm:rounded-xl border border-white/5 bg-black text-white text-[10px] sm:text-xs select-none truncate">
              •••• •••• •••• 4242 (Stripe Mock)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full min-w-0 mt-2 sm:mt-0">
          <button
            onClick={() => setIsPaying(false)}
            className="py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-white/10 text-[10px] sm:text-xs font-bold text-gray-400 hover:bg-white/5 transition-all uppercase tracking-wider truncate px-1"
          >
            Cancel
          </button>
          <button
            onClick={handlePaymentConfirm}
            className="py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all truncate px-1"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
}
export default ParentGameReports;
