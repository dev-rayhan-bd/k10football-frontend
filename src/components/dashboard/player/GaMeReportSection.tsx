/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react';
import { FileText, Eye, Plus, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlayer } from "@/lib/hooks/usePlayer";
import { useAppSelector } from "@/lib/hooks/reduxHooks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const GameReportSection = () => {
  const router = useRouter();
  const { playerData } = usePlayer();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const reports = useAppSelector(state => state.reports.reports);
  const requests = useAppSelector(state => state.reports.requests);

  // Filter completed reports for this player
  const completedReports = reports.filter(
    r => r.playerId === playerData.id || r.playerName === playerData.fullName
  );

  // Filter pending requests for this player
  const pendingRequests = requests.filter(
    req => req.playerId === playerData.id && req.status === 'Pending'
  );

  // Merge them for display in the table
  const displayRows = [
    ...completedReports.map(r => ({
      id: r.id,
      team2: `vs ${r.team2}`,
      rating: (r.rating * 10).toFixed(0),
      amount: r.amount,
      date: r.date,
      status: 'Paid',
      raw: r
    })),
    ...pendingRequests.map(req => ({
      id: req.id + 100000,
      team2: `Requested from ${req.coachName}`,
      rating: 'N/A',
      amount: '$ 6.99',
      date: req.date,
      status: 'Pending',
      raw: null
    }))
  ];

  const handleView = (row: any) => {
    if (row.raw) {
      setSelectedReport(row.raw);
      setIsOpen(true);
    }
  };

  return (
    <div className="py-8 sm:py-12 md:py-16 px-2 sm:px-4">
      <div className="w-full">
        {/* Main Card */}
        <div className="border border-white/10 bg-[#0A0A0A]/60 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 uppercase italic font-orbitron">Game Reports</h1>
              <p className="text-gray-400 text-xs sm:text-sm">Professional match performance analysis</p>
            </div>
            <button 
              onClick={() => router.push("/dashboard/player/game-reports/create")}
              className="px-4 py-2 border border-white/10 text-white rounded-xl hover:bg-white/5 transition flex items-center gap-2 text-xs uppercase tracking-widest font-orbitron cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-500" />
              Request Report
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {displayRows.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm italic">
                No game reports or requests found.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest font-orbitron">
                    <th className="px-3 sm:px-4 py-3">Report</th>
                    <th className="px-3 sm:px-4 py-3">Rating</th>
                    <th className="px-3 sm:px-4 py-3">Amount</th>
                    <th className="px-3 sm:px-4 py-3">Date</th>
                    <th className="px-3 sm:px-4 py-3">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row) => (
                    <tr 
                      key={row.id} 
                      className="border-b border-white/5 text-xs sm:text-sm hover:bg-white/5 transition-colors"
                    >
                      <td className="px-3 sm:px-4 py-3.5 font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="truncate max-w-37.5 sm:max-w-none">{row.team2}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3.5 font-bold font-orbitron text-red-500">
                        {row.rating !== 'N/A' ? `${row.rating}/100` : 'N/A'}
                      </td>
                      <td className="px-3 sm:px-4 py-3.5 text-gray-300 font-orbitron">{row.amount}</td>
                      <td className="px-3 sm:px-4 py-3.5 text-gray-400 text-xs">{row.date}</td>
                      <td className="px-3 sm:px-4 py-3.5">
                        {row.status === 'Paid' ? (
                          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-orbitron">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-orbitron">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3.5 text-right">
                        {row.raw ? (
                          <button
                            onClick={() => handleView(row)}
                            className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            title="View Analysis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Waiting...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Report Detail Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-[#0F0F12] border-l border-white/10 text-white overflow-y-auto p-6">
          {selectedReport && (
            <div className="space-y-6">
              <SheetHeader className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-black text-white font-orbitron uppercase">
                    vs {selectedReport.team2}
                  </SheetTitle>
                  <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-orbitron">
                    Score: {selectedReport.score1} - {selectedReport.score2}
                  </Badge>
                </div>
                <SheetDescription className="text-gray-400 text-xs mt-1">
                  Evaluated by Coach {selectedReport.coachName} on {selectedReport.date}
                </SheetDescription>
              </SheetHeader>

              {/* Match Overview */}
              <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</p>
                  <p className="text-2xl font-black text-red-500 font-orbitron">{(selectedReport.rating * 10).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Goals</p>
                  <p className="text-2xl font-black text-white font-orbitron">{selectedReport.goals}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assists</p>
                  <p className="text-2xl font-black text-white font-orbitron">{selectedReport.assists}</p>
                </div>
              </div>

              {/* Tactical & Physical Metrics */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">Performance Metrics</h3>
                <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Pass Accuracy</span>
                    <span className="font-bold text-green-400 font-orbitron">{selectedReport.passAccuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${selectedReport.passAccuracy}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-gray-400">Minutes Played</span>
                    <span className="font-bold text-white font-orbitron">{selectedReport.minutesPlayed}&apos;</span>
                  </div>
                </div>
              </div>

              {/* Coach Evaluation Comments */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-orbitron">Coach Tactical Assessment</h3>
                
                {selectedReport.strengths && (
                  <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Key Strengths</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedReport.strengths}</p>
                  </div>
                )}

                {selectedReport.areasToImprove && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Areas for Improvement</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedReport.areasToImprove}</p>
                  </div>
                )}

                {selectedReport.coachComments && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coach Overall Comments</p>
                    <p className="text-xs text-gray-300 leading-relaxed italic">&quot;{selectedReport.coachComments}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GameReportSection;
