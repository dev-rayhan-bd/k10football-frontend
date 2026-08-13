"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCreditCard,
  IconClock,
  IconCircleCheck,
} from "@tabler/icons-react";

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
<div className="space-y-8 pb-12">
  {/* Header */}
  <div>
    <h1 className="text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
      Match <span className="text-primary italic">Reports</span>
    </h1>
    <p className="text-white/60 font-bold uppercase tracking-widest text-[11px] mt-2">
      Create match reports, plot goals/assists on interactive pitch, and request coach evaluations
    </p>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Plotting & Form (7 cols) */}
    <div className="lg:col-span-8 bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
      <h2 className="text-xl font-black uppercase text-white font-orbitron">Submit Performance Stats</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
            Opponent Team
          </label>
          <input
            type="text"
            placeholder="e.g. Palmeiras U17"
            value={newOpponent}
            onChange={(e) => setNewOpponent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
            Match Date
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-sm scheme-dark"
          />
        </div>
      </div>

      {/* Interactive Pitch */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
            Mark Event Location on Pitch (Click to plot)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setEventType("Goal")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                eventType === "Goal"
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              Goal Spot
            </button>
            <button
              onClick={() => setEventType("Assist")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                eventType === "Assist"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white/5 border-white/10 text-gray-400"
              }`}
            >
              Assist Spot
            </button>
            <button
              onClick={clearEvents}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            >
              Clear Markers
            </button>
          </div>
        </div>

        {/* Soccer Pitch Canvas */}
        <div
          ref={pitchRef}
          onClick={handlePitchClick}
          className="relative w-full aspect-2/1 rounded-2xl bg-linear-to-br from-green-900 to-emerald-950 border border-white/10 overflow-hidden cursor-crosshair flex items-center justify-center select-none shadow-inner"
        >
          {/* Pitch Markings */}
          <div className="absolute inset-4 border-2 border-white/20 pointer-events-none" />
          <div className="absolute left-1/2 top-4 bottom-4 border-l-2 border-white/20 pointer-events-none" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full pointer-events-none" />
          <div className="absolute left-4 top-1/4 bottom-1/4 w-16 border-2 border-l-0 border-white/20 pointer-events-none" />
          <div className="absolute right-4 top-1/4 bottom-1/4 w-16 border-2 border-r-0 border-white/20 pointer-events-none" />

          {/* Plotted Event Pins */}
          {activeEvents.map((ev, idx) => (
            <div
              key={idx}
              style={{ left: `${ev.x}%`, top: `${ev.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg pointer-events-none animate-ping-once ${
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
        className="w-full bg-[#E31B23] hover:bg-[#C2181F] text-white py-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#E31B23]/20"
      >
        Save Report Details
      </Button>
    </div>

    {/* Existing Reports list (4 cols) */}
    <div className="lg:col-span-4 bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
      <h2 className="text-xl font-black uppercase text-white font-orbitron">Match History</h2>

      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-3 hover:border-white/10 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white">vs {report.opponent}</h3>
                <span className="text-[10px] text-gray-500 font-bold">{report.date}</span>
              </div>
              <Badge className={`text-[9px] font-bold ${
                report.status === "Verified" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                report.status === "Paid" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
              }`}>
                {report.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Rating: <strong className="text-white font-medium">{report.rating > 0 ? report.rating.toFixed(1) : "N/A"}</strong></span>
              <span>Plotted Events: <strong className="text-white font-medium">{report.events.length}</strong></span>
            </div>

            {report.status === "Pending" && (
              <button
                onClick={() => handleRequestReview(report.id)}
                className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              >
                <IconCreditCard size={14} /> Request Paid Review ({report.amount})
              </button>
            )}

            {report.status === "Paid" && (
              <div className="text-[10px] text-gray-500 font-bold uppercase text-center flex items-center justify-center gap-1">
                <IconClock size={12} /> Awaiting Coach Validation
              </div>
            )}

            {report.status === "Verified" && (
              <div className="text-[10px] text-green-400 font-bold uppercase text-center flex items-center justify-center gap-1">
                <IconCircleCheck size={12} /> Coach Evaluated
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Stripe mock checkout modal */}
  {isPaying && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-[#0D0D0D] border border-white/10 p-8 rounded-3xl max-w-md w-full mx-4 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white uppercase font-orbitron">Coach Evaluation Payment</h3>
          <p className="text-xs text-gray-400">Confirm Stripe card details for paid validation review.</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black border border-white/5 flex flex-col gap-2">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Checkout Total</span>
            <span className="text-3xl font-black text-white font-orbitron">$25.00</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider ml-1">Card Details</label>
            <div className="px-4 py-3.5 rounded-xl border border-white/5 bg-black text-white text-xs select-none">
              •••• •••• •••• 4242 (Stripe Mock)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsPaying(false)}
            className="py-3 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 transition-all uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handlePaymentConfirm}
            className="py-3 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold uppercase tracking-wider transition-all"
          >
            Confirm Pay
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
}
export default ParentGameReports;
