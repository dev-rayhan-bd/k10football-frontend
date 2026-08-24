/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  IconDownload,
  IconClock,
  IconPhone,
  IconMail,
  IconShield,
  IconShare,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { usePlayerStats } from "@/components/cvs/player-cv-details/FullEditablePage";
import { getFullWithShortForm } from "@/lib/utils";
import { FileText } from 'lucide-react';
import { useAppSelector } from "@/lib/hooks/reduxHooks";
import CvNotEditable from "./CvNotEditable";

const ViewCv = () => {
  const { playerData } = usePlayer();
  const { role: contextRole } = usePlayerStats();
  const [role, setRole] = useState<string>("player");
  const reports = useAppSelector(state => state.reports.reports);
  const gameReports = reports
    .filter(r => r.status === "Paid")
    .slice(0, 3)
    .map(r => ({
      id: r.id,
      opponent: `vs ${r.team2}`,
      rating: r.rating
    }));
  useEffect(() => {
    const userRole = localStorage.getItem("userRole") || "player";
    setRole(userRole);
  }, []);
  const generateProfessionalPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = `
      <html>
        <head>
          <title>Technical Scouting Report - ${playerData.fullName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #111;
              margin: 0;
              padding: 50px;
              line-height: 1.4;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 4px solid #E31B23;
              padding-bottom: 40px;
              margin-bottom: 50px;
            }
            .brand { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #E31B23; margin-bottom: 10px; }
            .player-name { font-size: 48px; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; margin: 0; line-height: 1; }
            .player-title { font-size: 16px; font-weight: 600; color: #666; margin-top: 5px; text-transform: uppercase; }
            .rating-circle {
              width: 100px;
              height: 100px;
              background: #111;
              color: #fff;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 4px solid #E31B23;
            }
            .rating-value { font-size: 36px; font-weight: 900; line-height: 1; }
            .rating-label { font-size: 10px; font-weight: 800; text-transform: uppercase; opacity: 0.6; }
            .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
            .section { margin-bottom: 40px; }
            .section-header { 
              font-size: 14px; 
              font-weight: 900; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
              color: #111;
              border-bottom: 2px solid #eee;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
            }
            .attribute-table { width: 100%; border-collapse: collapse; }
            .attribute-row { border-bottom: 1px solid #f0f0f0; }
            .attribute-cell { padding: 10px 0; font-size: 13px; }
            .attr-label { color: #666; font-weight: 600; }
            .attr-value { font-weight: 900; text-align: right; color: #111; }
            .attr-bar-bg { width: 60px; height: 6px; background: #eee; border-radius: 3px; display: inline-block; margin-left: 15px; position: relative; top: -2px; }
            .attr-bar-fill { height: 100%; background: #E31B23; border-radius: 3px; }
            .full-width { grid-column: span 2; }
            .highlight-box { background: #f9f9f9; padding: 25px; border-radius: 15px; border: 1px solid #eee; }
            .footer {
              margin-top: 80px;
              padding-top: 30px;
              border-top: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #999;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
              -webkit-print-color-adjust: exact;
            }
          </style>
        </head>
        <body oncontextmenu="return false;">
          <div class="header">
            <div>
              <div class="brand">Eddie Ricci Football Management</div>
              <h1 class="player-name">${playerData.fullName}</h1>
              <div class="player-title">${getFullWithShortForm(playerData.position)} • ${playerData.clubs[0]?.name || 'Unattached'} • ${playerData.birthCountry}</div>
            </div>
            <div class="rating-circle">
              <span class="rating-label">Overall</span>
              <span class="rating-value">${playerData.rating}</span>
            </div>
          </div>
          <div class="main-grid">
            <!-- Bio Section -->
            <div class="section">
              <div class="section-header">Biological Profile</div>
              <table class="attribute-table">
                <tr class="attribute-row"><td class="attribute-cell attr-label">Age / DOB</td><td class="attribute-cell attr-value">${playerData.age} / ${playerData.dob}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Height / Weight</td><td class="attribute-cell attr-value">${playerData.height}m / ${playerData.weight}kg</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Primary Foot</td><td class="attribute-cell attr-value">Right (${playerData.rightLegUsage}%)</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Secondary Foot</td><td class="attribute-cell attr-value">Left (${playerData.leftLegUsage}%)</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Nationality</td><td class="attribute-cell attr-value">${playerData.birthCountry} / ${playerData.dualNationality || 'N/A'}</td></tr>
              </table>
            </div>
            <!-- Performance Metrics -->
            <div class="section">
              <div class="section-header">Scouting Summary</div>
              <table class="attribute-table">
                <tr class="attribute-row"><td class="attribute-cell attr-label">Market Value</td><td class="attribute-cell attr-value">€${playerData.marketValue}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Contract Until</td><td class="attribute-cell attr-value">${playerData.contractUntil}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Agency</td><td class="attribute-cell attr-value">${playerData.agency}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Agent</td><td class="attribute-cell attr-value">${playerData.agent}</td></tr>
              </table>
            </div>
            <!-- Technical Evaluation -->
            <div class="section">
              <div class="section-header">Technical Attributes</div>
              <table class="attribute-table">
                ${playerData.skillsCategories.find(c => c.category === "Technical")?.skills.slice(0, 5).map(skill => `
                  <tr class="attribute-row"><td class="attribute-cell attr-label">${skill.name}</td><td class="attribute-cell attr-value">${skill.value} <div class="attr-bar-bg"><div class="attr-bar-fill" style="width: ${skill.value}%"></div></div></td></tr>
                `).join('') || ''}
              </table>
            </div>
            <!-- Physical Evaluation -->
            <div class="section">
              <div class="section-header">Physical Profile</div>
              <table class="attribute-table">
                ${playerData.skillsCategories.find(c => c.category === "Physical")?.skills.slice(0, 5).map(skill => `
                  <tr class="attribute-row"><td class="attribute-cell attr-label">${skill.name}</td><td class="attribute-cell attr-value">${skill.value} <div class="attr-bar-bg"><div class="attr-bar-fill" style="width: ${skill.value}%"></div></div></td></tr>
                `).join('') || ''}
              </table>
            </div>
            <!-- Mental/Tactical Evaluation -->
            <div class="section">
              <div class="section-header">Mental & Tactical</div>
              <table class="attribute-table">
                ${playerData.skillsCategories.find(c => c.category === "Tactical")?.skills.slice(0, 5).map(skill => `
                  <tr class="attribute-row"><td class="attribute-cell attr-label">${skill.name}</td><td class="attribute-cell attr-value">${skill.value} <div class="attr-bar-bg"><div class="attr-bar-fill" style="width: ${skill.value}%"></div></div></td></tr>
                `).join('') || ''}
              </table>
            </div>
            <!-- Advanced Metrics -->
            <div class="section">
              <div class="section-header">Intelligence Metrics</div>
              <table class="attribute-table">
                <tr class="attribute-row"><td class="attribute-cell attr-label">Pass Accuracy</td><td class="attribute-cell attr-value">${playerData.performanceMetrics.passAccuracy}%</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Shoot Accuracy</td><td class="attribute-cell attr-value">${playerData.performanceMetrics.shootAccuracy}%</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Dribble Success</td><td class="attribute-cell attr-value">${playerData.performanceMetrics.dribbleSuccess}%</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Tackle Success</td><td class="attribute-cell attr-value">${playerData.performanceMetrics.tackleSuccess}%</td></tr>
              </table>
            </div>
            <!-- Career Timeline -->
            <div class="section full-width">
              <div class="section-header">Professional Career History</div>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr style="background: #f9f9f9; text-align: left; font-size: 11px; font-weight: 900; text-transform: uppercase;">
                  <th style="padding: 12px; border-bottom: 2px solid #eee">Season</th>
                  <th style="padding: 12px; border-bottom: 2px solid #eee">Organization</th>
                  <th style="padding: 12px; border-bottom: 2px solid #eee">Level / Role</th>
                  <th style="padding: 12px; border-bottom: 2px solid #eee">Status</th>
                </tr>
                ${playerData.clubs.map(club => `
                  <tr style="font-size: 13px;">
                    <td style="padding: 12px; border-bottom: 1px solid #eee">${club.from} - ${club.to}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee">${club.name}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee">${club.category || 'N/A'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee">Active</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            <div class="section full-width highlight-box">
              <div class="section-header">Coach Evaluation Notes</div>
              <p style="font-size: 13px; color: #444; margin: 0;">
                ${playerData.fullName} demonstrates elite-level vision and technical control under pressure. Current overall rating is verified at ${playerData.rating}.
              </p>
            </div>
          </div>
          <div class="footer">
            <span>Tech ID: 9F8E7D6C • Confirmed By: ER Scouting Dept</span>
            <span>Page 1 of 1 • Internal Document</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
          <script>
            window.onload = function() { 
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };




  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 print:hidden w-full min-w-0 shrink-0">
        <div className="w-full min-w-0">
          <p className="text-white/60 font-medium mt-1 md:mt-2 text-sm md:text-lg truncate">Player Professional Football Profile</p>
        </div>
        <Button
          onClick={generateProfessionalPDF}
          className="bg-[#222222] hover:bg-[#333333] text-white border border-white/5 gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] h-12 w-full md:w-auto shrink-0 transition-all"
        >
          <IconDownload size={18} /> Download CV PDF
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex flex-col gap-6 w-full min-w-0">
        {/* Personal Information Hero - Restoring Original Design */}
        <section className="bg-[#111111] rounded-3xl border border-white/10 p-4 md:p-8 flex flex-col gap-8 w-full min-w-0 overflow-hidden">
          <div className="relative rounded-3xl overflow-hidden min-h-100 md:min-h-140 border border-white/10 group flex flex-col justify-end w-full min-w-0">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('/stadium-night.jpg')` }}
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/40 via-45% to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute right-0 bottom-0 h-full w-[80%] md:w-[55%] flex items-end justify-end pointer-events-none opacity-50 md:opacity-100 z-0">
              <Image
                src={typeof playerData.playerImage === 'string' ? playerData.playerImage : (playerData.playerImage?.src || "/ronaldo.png")}
                alt="Player"
                className="h-[90%] md:h-[105%] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
                height={500}
                width={500}
              />
            </div>
            <div className="relative p-4 sm:p-6 md:p-10 w-full space-y-8 min-w-0 z-10">
              <div className="flex flex-col gap-4 sm:gap-6 w-full min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-4 border-gold bg-gold/80 flex items-center justify-center backdrop-blur-2xl shadow-2xl shrink-0">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-orbitron">{playerData.rating}</span>
                </div>
                <div className="space-y-3 sm:space-y-4 w-full min-w-0">
                  <div className="bg-[#E31B23] border border-[#E31B23]/20 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black text-white uppercase w-fit tracking-[0.2em] shadow-[0_0_20px_rgba(227,27,35,0.3)]">{playerData.transferStatus || "Active Player"}</div>
                  <div className="space-y-2 w-full min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-6xl font-black text-white font-orbitron uppercase tracking-tighter leading-none wrap-break-word">{playerData.fullName}</h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-6 text-[8px] sm:text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] pt-1 w-full">
                      <span className="text-[#E31B23] truncate">{getFullWithShortForm(playerData.position)}</span>
                      <span className="text-white/20 hidden sm:inline">/</span>
                      <span className="text-white shrink-0">{playerData.age} Years Old</span>
                      <span className="text-white/20 hidden sm:inline">/</span>
                      <span className="flex items-center gap-2 sm:gap-3 text-white shrink-0">
                        <Image width={16} height={16} src={`https://flagcdn.com/br.svg`} alt={playerData.birthCountry} className="w-3.5 h-2.5 sm:w-4 sm:h-3 md:w-5 md:h-3.5 object-cover rounded-sm shadow-sm" /> {playerData.birthCountry}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-6 pt-4 md:pt-8 w-full max-w-2xl min-w-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 text-white/40 shrink-0"><IconShield size={18} className="sm:w-5 sm:h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">Current Club</p>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{playerData.clubs[0]?.name || "Unattached"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 text-white/40 shrink-0"><IconPhone size={18} className="sm:w-5 sm:h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">Contact</p>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{playerData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 text-white/40 shrink-0"><IconClock size={18} className="sm:w-5 sm:h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">Contract Until</p>
                    <p className="text-xs sm:text-sm font-bold text-[#FBBF24] truncate">{playerData.contractUntil}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl border border-white/10 text-white/40 shrink-0"><IconMail size={18} className="sm:w-5 sm:h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">Email</p>
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{playerData.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Top Squares - As requested by client doc */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
          {/* Completion Status */}
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 min-w-0 w-full overflow-hidden">
            <h3 className="text-xs sm:text-sm font-black text-white font-orbitron uppercase tracking-widest truncate">Completion Status</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-4xl sm:text-5xl font-black text-[#E31B23] font-orbitron">85%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#E31B23] rounded-full" style={{ width: "85%" }} />
              </div>
              <p className="text-[9px] sm:text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-wider line-clamp-2">
                All sections to unlock Gold tier status
              </p>
            </div>
          </div>
          {/* Tier Status */}
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 relative overflow-hidden min-w-0 w-full">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FBBF24]/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex flex-col relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black text-[#FBBF24] font-orbitron italic tracking-tighter leading-none">GOLD</h3>
              <div className="w-full h-1 bg-[#FBBF24] mt-2 opacity-50" />
            </div>
            <p className="text-[9px] sm:text-[10px] text-white/60 font-bold leading-relaxed uppercase tracking-wider mt-1 sm:mt-2 relative z-10 line-clamp-2">
              CV meets Gold standards and is ready to share with top clubs and agents.
            </p>
            {/* <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2 w-full py-3 sm:py-4 rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] h-auto mt-2 sm:mt-4 relative z-10">
              <IconShare size={16} className="text-white/40 sm:w-4.5 sm:h-4.5" /> Request Re-validation
            </Button> */}
          </div>
          {/* Career Journey / Last Evaluated */}
          {/* New Game Reports */}
          <div className="bg-[#111111] h-fit rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 min-w-0 w-full overflow-hidden">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 min-w-0 shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#E31B23] rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white font-orbitron uppercase tracking-widest truncate w-full">
                New Game Reports
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3 min-w-0 w-full">
              {gameReports.map((report) => (
                <div key={report.id} className="border border-white/10 rounded-xl p-3 sm:p-4 flex items-center justify-between hover:bg-white/5 transition group w-full min-w-0 gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-[#E31B23] transition-colors shrink-0" />
                    <span className="text-white/60 text-xs sm:text-sm font-bold truncate">{report.opponent}</span>
                  </div>
                  <span className="text-white font-black text-lg sm:text-xl font-orbitron shrink-0">{report.rating}</span>
                </div>
              ))}
              {gameReports.length === 0 && (
                <p className="text-white/40 text-[9px] sm:text-[10px] uppercase font-bold text-center py-4">No reports available</p>
              )}
            </div>
          </div>
        </div>
        <CvNotEditable editable={false} />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .container {
            width: 100% !important;
            max-width: none !important;
            padding: 20px !important;
          }
          /* Ensure backgrounds print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Fix for grid layouts in print */
          .grid {
            display: grid !important;
          }
          /* Force dark theme colors in print */
          section, div, h1, h2, h3, h4, p, span {
            color: white !important;
          }
          .bg-black { background-color: #000 !important; }
          .bg-\\[\\#111111\\] { background-color: #111111 !important; }
          .border { border-color: rgba(255, 255, 255, 0.1) !important; }
          /* Hide edit buttons and adjust layout for A4 */
          button { display: none !important; }
          input, textarea { 
            border: none !important; 
            background: transparent !important;
            padding: 0 !important;
            color: white !important;
          }
          /* Custom PDF Header */
          .pdf-footer {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
            letter-spacing: 2px;
          }
        }
      ` }} />
      <div className="pdf-footer hidden print:block">
        Generated by Eddie Ricci Football Management Platform • Professional CV Profile
      </div>
    </div>
  );
};
export default ViewCv;