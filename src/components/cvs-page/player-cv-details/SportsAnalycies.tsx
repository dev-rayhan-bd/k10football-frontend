/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/lib/hooks/reduxHooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { IconDownload } from "@tabler/icons-react";

const getResultColor = (result: "W" | "D" | "L") => {
  switch (result) {
    case "W":
      return "bg-[#00FF62] text-black";
    case "D":
      return "bg-gray-500 text-white";
    case "L":
      return "bg-red-600 text-white";
  }
};

const getResultText = (result: "W" | "D" | "L") => result;

const SportsAnalycies = ({ editable = false }: { editable?: boolean }) => {
const reports = useAppSelector(state => state.reports.reports);
const paidMatches = reports.filter(m => m.status === "Paid");
const matches = paidMatches.slice(0, 4);

const [showArchive, setShowArchive] = useState(false);
const [downloadingReportId, setDownloadingReportId] = useState<number | null>(null);

const wins = matches.filter((m) => m.result === "W").length;
const draws = matches.filter((m) => m.result === "D").length;
const losses = matches.filter((m) => m.result === "L").length;
const totalGoals = matches.reduce((sum, m) => sum + m.goals, 0);
const totalAssists = matches.reduce((sum, m) => sum + m.assists, 0);

const avgRating = matches.length > 0 
? (matches.reduce((sum, m) => sum + m.rating, 0) / matches.length).toFixed(1)
: "0.0";

const avgPassAccuracy = matches.length > 0
? Math.round(matches.reduce((sum, m) => sum + m.passAccuracy, 0) / matches.length)
: 0;

const avgTackles = (2.4).toFixed(1);
const avgInterceptions = (2.4).toFixed(1);

const handleDownloadPDF = async (match: any) => {
setDownloadingReportId(match.id);
const toastId = toast.loading(`Generating Scouting Report vs ${match.team2}...`);
try {
  const printElement = document.createElement("div");
  printElement.style.position = "fixed";
  printElement.style.left = "-9999px";
  printElement.style.top = "-9999px";
  printElement.style.width = "794px";
  printElement.style.height = "1123px";
  printElement.style.backgroundColor = "#ffffff";
  printElement.style.color = "#1e293b";
  printElement.style.padding = "40px";
  printElement.style.fontFamily = "sans-serif";
  printElement.style.boxSizing = "border-box";

  printElement.innerHTML = `
        <div style="border: 2px solid #E31B23; padding: 25px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; pointer-events: none;">
            <img src="/logo.png" style="width: 400px; object-fit: contain;" />
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; z-index: 10;">
            <div>
              <div style="font-size: 10px; font-weight: 900; color: #E31B23; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">K10 Football</div>
              <h1 style="font-size: 28px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; margin: 0; letter-spacing: -1px;">TECHNICAL SCOUTING REPORT</h1>
              <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 5px; text-transform: uppercase;">Match Performance Evaluation</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; font-weight: 800; color: #e2e8f0; background-color: #1e1b4b; padding: 4px 10px; border-radius: 4px; display: inline-block; text-transform: uppercase; margin-bottom: 5px;">VERIFIED</div>
              <div style="font-size: 32px; font-weight: 900; color: #16a34a; margin: 0; line-height: 1;">${Number(match.rating).toFixed(1)}</div>
              <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">OVERALL RATING</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px; z-index: 10;">
            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 8px;">
              <h3 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 0; margin-bottom: 10px; letter-spacing: 1px;">Match Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.6;">
                <tr><td style="color: #64748b; font-weight: 500; width: 40%;">Date:</td><td style="color: #0f172a; font-weight: 700;">${match.date}</td></tr>
                <tr><td style="color: #64748b; font-weight: 500;">League:</td><td style="color: #0f172a; font-weight: 700;">${match.league}</td></tr>
                <tr><td style="color: #64748b; font-weight: 500;">Stadium:</td><td style="color: #0f172a; font-weight: 700;">${match.stadium}</td></tr>
                <tr><td style="color: #64748b; font-weight: 500;">Scout:</td><td style="color: #0f172a; font-weight: 700;">${match.scoutName || "Mario Lopez"}</td></tr>
              </table>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 8px;">
              <h3 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 0; margin-bottom: 10px; letter-spacing: 1px;">Score & Outcome</h3>
              <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 75px; text-align: center;">
                <div style="font-size: 20px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; margin-bottom: 4px;">
                  ${match.team1} vs ${match.team2}
                </div>
                <div style="font-size: 16px; font-weight: 800; color: #1e1b4b; background-color: #e2e8f0; padding: 3px 12px; border-radius: 6px; display: inline-block;">
                  Score: ${match.score} (${match.result === 'W' ? 'WON' : match.result === 'D' ? 'DRAW' : 'LOST'})
                </div>
              </div>
            </div>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px; z-index: 10;">
            <h3 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 0; margin-bottom: 10px; letter-spacing: 1px;">Player Overview</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.6;">
              <tr style="display: flex; justify-content: space-between; width: 100%;">
                <td><span style="color: #64748b; font-weight: 500;">Position:</span> <strong style="color: #0f172a;">${match.playerPosition || "Forward"}</strong></td>
                <td><span style="color: #64748b; font-weight: 500;">Preferred Foot:</span> <strong style="color: #0f172a;">${match.foot || "Right"}</strong></td>
                <td><span style="color: #64748b; font-weight: 500;">Played:</span> <strong style="color: #0f172a;">${match.timePlayedMinutes} Min</strong></td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 25px; z-index: 10;">
            <h3 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 0; margin-bottom: 12px; letter-spacing: 1px;">Performance Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: 900; color: #1e1b4b;">${match.goals}</div>
                <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 3px;">Goals</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: 900; color: #1e1b4b;">${match.assists}</div>
                <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 3px;">Assists</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: 900; color: #1e1b4b;">${match.passes}</div>
                <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 3px;">Total Passes</div>
              </div>
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: 900; color: #1e1b4b;">${match.passAccuracy}%</div>
                <div style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 3px;">Pass Accuracy</div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px; z-index: 10;">
            <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
              <h4 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Disciplinary Summary</h4>
              <div style="display: flex; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 18px; background-color: #FFCC00; border-radius: 2px; border: 1px solid #e2e8f0;"></div>
                  <span style="font-size: 13px; font-weight: 800;">${match.yellowCards} Yellow Cards</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 12px; height: 18px; background-color: #DC143C; border-radius: 2px; border: 1px solid #e2e8f0;"></div>
                  <span style="font-size: 13px; font-weight: 800;">${match.redCards} Red Cards</span>
                </div>
              </div>
            </div>

            <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
              <h4 style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Key Characteristics</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 5px; align-content: flex-start;">
                ${(match.characteristics || ["Agile", "Fast", "Playmaker"]).map((c: string) => `
                  <span style="font-size: 9px; font-weight: 800; background-color: #1e1b4b; color: #ffffff; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${c}</span>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: auto; font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; tracking-spacing: 1px; z-index: 10;">
            <span>Report ID: ${match.id}</span>
            <span>Generated: ${new Date().toISOString().split("T")[0]}</span>
            <span>System: K10 Football Platform</span>
          </div>
        </div>
      `;

  document.body.appendChild(printElement);
  const canvas = await html2canvas(printElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(`Scouting_Report_vs_${match.team2.replace(/\s+/g, "_")}.pdf`);
  document.body.removeChild(printElement);
  toast.success("PDF Report downloaded successfully!", { id: toastId });
} catch (err) {
  console.error(err);
  toast.error("Failed to generate PDF.", { id: toastId });
} finally {
  setDownloadingReportId(null);
}
};

return (
<div className="container ">
  <h1 className="mb-8 text-center text-3xl font-bold text-white font-heading">
    GAME SUMMARY (LAST 4 MATCHES)
  </h1>

  <div className="space-y-6">
    {/* Overall stats cards */}
    <div className=" grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <Card className="border-0 bg-linear-to-br from-[#1B4D2E] to-[#0F3B1F] p-8 text-white rounded-lg">
        <div className="mb-6 text-xl font-bold text-[#00FF62] uppercase tracking-wide">Overall Performance</div>
        <div className="mb-6">
          <div className="text-base text-gray-300 font-medium">Average Rating</div>
          <div className="text-6xl font-black text-[#00FF62]">{avgRating}</div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-base text-gray-300 font-medium">Total Goals</div>
            <div className="text-4xl font-black text-white">{totalGoals}</div>
          </div>
          <div>
            <div className="text-base text-gray-300 font-medium">Total Assists</div>
            <div className="text-4xl font-black text-white">{totalAssists}</div>
          </div>
        </div>
      </Card>

      <Card className="border border-border bg-black p-8 text-white rounded-lg">
        <div className="mb-6 text-xl font-bold text-gray-300 uppercase tracking-wide">Form Guide</div>
        <div className="mb-6 flex gap-3">
          {matches.map((match, idx) => (
            <Badge key={idx} className={`h-12 w-12 flex items-center justify-center p-0 rounded-full font-black text-lg ${getResultColor(match.result)} shadow-lg`}>
              {getResultText(match.result)}
            </Badge>
          ))}
        </div>
        <div className="space-y-3 text-lg">
          <div className="flex justify-between"><span className="text-gray-300">Wins</span><span className="font-bold text-white">{wins}</span></div>
          <div className="flex justify-between"><span className="text-gray-300">Draws</span><span className="font-bold text-white">{draws}</span></div>
          <div className="flex justify-between"><span className="text-gray-300">Losses</span><span className="font-bold text-white">{losses}</span></div>
        </div>
      </Card>

      <Card className="border border-border bg-black p-8 text-white rounded-lg">
        <div className="mb-6 text-xl font-bold text-gray-300 uppercase tracking-wide">Key Stats</div>
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex justify-between text-sm md:text-base">
              <span className="text-gray-300 font-medium">Average Pass Accuracy</span>
              <span className="text-[#00FF62] font-bold">{avgPassAccuracy}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF62]" style={{ width: `${avgPassAccuracy}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm md:text-base">
              <span className="text-gray-300 font-medium">Average Tackles</span>
              <span className="text-[#00FF62] font-bold">{avgTackles}</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-[#00FF62]" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* Detailed Game Reports */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {matches.map((match, idx) => (
        <Card
          key={idx}
          className="border border-border bg-black p-8 text-white rounded-xl hover:border-primary/30 transition-all shadow-xl flex flex-col justify-between"
        >
          <div>
            {/* Header Row */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg text-gray-400">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                  <span className="font-medium">{match.date}</span>
                </div>
                <Badge className="bg-gray-800 text-white hover:bg-gray-700 text-base py-1.5 px-4 rounded-md font-bold uppercase tracking-wider">
                  {match.league}
                </Badge>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-black tracking-widest py-0.5 px-2">VERIFIED</Badge>
                <div className="text-3xl font-black text-[#00FF62]">{Number(match.rating).toFixed(1)}</div>
                <div className="text-xs uppercase tracking-widest text-gray-500 font-black">Rating</div>
              </div>
            </div>

            {/* Teams and Score */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="text-xl font-black uppercase tracking-tight text-white mb-1">{match.team1}</div>
                <div className="h-1 w-12 bg-primary/30 mx-auto rounded-full"></div>
              </div>
              <div className="shrink-0 bg-[#111111] border border-white/5 p-4 px-8 rounded-xl shadow-inner">
                <div className="text-4xl font-black text-white tracking-tighter">{match.score}</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-xl font-black uppercase tracking-tight text-white mb-1">{match.team2}</div>
                <Badge className={cn(getResultColor(match.result), "font-black text-sm uppercase px-3")}>
                  {getResultText(match.result)}
                </Badge>
              </div>
            </div>

            {/* Stadium */}
            <div className="flex items-center gap-3 text-lg text-gray-400 mb-6 bg-white/5 p-3 rounded-lg">
              <MapPinIcon className="h-6 w-6 text-primary" />
              <span className="font-medium">{match.stadium}</span>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-4 gap-4 border-t border-b border-border/50 py-6 mt-4">
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-1">{match.goals}</div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Goals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-1">{match.assists}</div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Assists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-1">{match.passes}</div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Passes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-white mb-1">{match.timePlayedMinutes}</div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Minutes</div>
              </div>
            </div>
          </div>

          {/* Cards and Accuracy + Download Button */}
          <div className="space-y-4 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-5 bg-[#FFCC00] rounded-sm shadow-md" />
                  <span className="text-xl font-black text-white">{match.yellowCards}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-5 bg-[#DC143C] rounded-sm shadow-md" />
                  <span className="text-xl font-black text-white">{match.redCards}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">
                  {match.passAccuracy}%
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Accuracy</div>
              </div>
            </div>

            <button
              disabled={downloadingReportId !== null}
              onClick={() => handleDownloadPDF(match)}
              className="w-full flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#C2181F] text-white text-[11px] font-black uppercase tracking-wider py-3.5 rounded-xl cursor-pointer transition-all disabled:opacity-50 font-orbitron"
            >
              <IconDownload size={15} />
              {downloadingReportId === match.id ? "Downloading..." : "Download Report PDF"}
            </button>
          </div>
        </Card>
      ))}
    </div>

    {/* View All / Archive Button */}
    {paidMatches.length > 4 && (
      <div className="flex justify-center mt-10">
        <button
          onClick={() => setShowArchive(true)}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest px-8 py-4.5 rounded-2xl cursor-pointer transition-all font-orbitron"
        >
          View All Game Reports (Archive)
        </button>
      </div>
    )}

    {/* Archive Dialog */}
    <Dialog open={showArchive} onOpenChange={setShowArchive}>
      <DialogContent className="max-w-4xl bg-[#0e0e0e] border-white/10 text-white rounded-4xl overflow-hidden max-h-[85vh] flex flex-col p-8">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-3xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            Game Reports Archive
          </DialogTitle>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-1">
            A complete log of all verified, paid game performance reports
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {paidMatches.map((match) => (
            <div 
              key={match.id} 
              className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/15 transition-all"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40 font-medium">{match.date}</span>
                  <Badge className="bg-white/5 text-white/60 hover:bg-white/10 text-[9px] uppercase tracking-wider font-bold">
                    {match.league}
                  </Badge>
                </div>
                <div className="text-lg font-black uppercase tracking-tight text-white font-orbitron">
                  {match.team1} <span className="text-[#E31B23] italic">vs</span> {match.team2}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
                  <div>Score: <strong className="text-white">{match.score}</strong></div>
                  <div>Venue: <strong className="text-white">{match.stadium}</strong></div>
                  <div>Goals: <strong className="text-white">{match.goals}</strong></div>
                  <div>Assists: <strong className="text-white">{match.assists}</strong></div>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#00FF62] font-orbitron">{Number(match.rating).toFixed(1)}</div>
                  <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Rating</div>
                </div>

                <button
                  disabled={downloadingReportId !== null}
                  onClick={() => handleDownloadPDF(match)}
                  className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C2181F] text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl cursor-pointer transition-all disabled:opacity-50 font-orbitron"
                >
                  <IconDownload size={14} />
                  {downloadingReportId === match.id ? "Wait..." : "Download PDF"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  </div>
</div>
);
}

export default SportsAnalycies;
