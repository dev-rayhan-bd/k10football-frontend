/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { usePlayerCvView } from "./PlayerCvViewContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const getGradeColor = (grade: string) => {
  const g = grade.toUpperCase();
  if (g.includes("EXCELLENT")) return "bg-green-500 text-white";
  if (g.includes("GOOD")) return "bg-yellow-500 text-white";
  return "bg-red-500 text-white";
};

export const ViewMetricsAnalysis = () => {
  const { playerData } = usePlayerCvView();
  const [activeTab, setActiveTab] = useState("Perception");

  const perceptionMetrics = playerData.perceptionMetrics || {};
  const visionMetrics = playerData.visionMetrics || {};

  const perceptionRows = [
    {
      category: "Space Awareness",
      score: perceptionMetrics.spaceAwareness?.score ?? 92,
      trend: perceptionMetrics.spaceAwareness?.trend ?? 3,
      grade: perceptionMetrics.spaceAwareness?.grade ?? "EXCELLENT",
    },
    {
      category: "Opponent Reading",
      score: perceptionMetrics.opponentReading?.score ?? 88,
      trend: perceptionMetrics.opponentReading?.trend ?? 5,
      grade: perceptionMetrics.opponentReading?.grade ?? "GOOD",
    },
    {
      category: "Game Flow Understanding",
      score: perceptionMetrics.gameFlowUnderstanding?.score ?? 85,
      trend: perceptionMetrics.gameFlowUnderstanding?.trend ?? 2,
      grade: perceptionMetrics.gameFlowUnderstanding?.grade ?? "GOOD",
    },
    {
      category: "Pressure Handling",
      score: perceptionMetrics.pressureHandling?.score ?? 90,
      trend: perceptionMetrics.pressureHandling?.trend ?? 4,
      grade: perceptionMetrics.pressureHandling?.grade ?? "EXCELLENT",
    },
  ];

  const visionRows = [
    {
      category: "Peripheral Vision",
      score: visionMetrics.peripheralVision?.score ?? 87,
      trend: visionMetrics.peripheralVision?.trend ?? 3,
      grade: visionMetrics.peripheralVision?.grade ?? "GOOD",
    },
    {
      category: "Focus Control",
      score: visionMetrics.focusControl?.score ?? 85,
      trend: visionMetrics.focusControl?.trend ?? 2,
      grade: visionMetrics.focusControl?.grade ?? "GOOD",
    },
    {
      category: "Pattern Recognition",
      score: visionMetrics.patternRecognition?.score ?? 89,
      trend: visionMetrics.patternRecognition?.trend ?? 4,
      grade: visionMetrics.patternRecognition?.grade ?? "GOOD",
    },
    {
      category: "Decision Speed",
      score: visionMetrics.decisionSpeed?.score ?? 91,
      trend: visionMetrics.decisionSpeed?.trend ?? 5,
      grade: visionMetrics.decisionSpeed?.grade ?? "EXCELLENT",
    },
    {
      category: "Visual Acuity",
      score: visionMetrics.visualAcuity?.score ?? 86,
      trend: visionMetrics.visualAcuity?.trend ?? 1,
      grade: visionMetrics.visualAcuity?.grade ?? "GOOD",
    },
  ];

  const currentRows = activeTab === "Perception" ? perceptionRows : visionRows;

  return (
    <div className="w-full mt-10 sm:mt-20 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Metrics Analysis
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Tactical & Psychological Evaluation covering Perception & Vision metrics.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl">
              <TabsTrigger
                value="Perception"
                className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Perception
              </TabsTrigger>
              <TabsTrigger
                value="Vision"
                className="px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Vision
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="w-full min-w-0">
            <div className="w-full overflow-x-auto min-w-0 pb-2">
              <Table className="border border-border w-full">
                <TableHeader>
                  <TableRow className="border-border bg-white/5">
                    <TableHead className="border-r border-border text-gray-400 font-black uppercase tracking-wider h-14">
                      Category
                    </TableHead>
                    <TableHead className="text-center border-r border-border text-gray-400 font-black uppercase tracking-wider h-14">
                      Score (0-100)
                    </TableHead>
                    <TableHead className="text-center border-r border-border text-gray-400 font-black uppercase tracking-wider h-14">
                      Trend
                    </TableHead>
                    <TableHead className="text-right text-gray-400 font-black uppercase tracking-wider h-14">
                      Grade
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentRows.map((metric, idx) => (
                    <TableRow
                      key={idx}
                      className="border-b border-border hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="border-r border-border py-4 font-bold text-xs sm:text-base uppercase text-gray-200">
                        {metric.category}
                      </TableCell>

                      <TableCell className="border-r border-border min-w-[200px]">
                        <div className="flex items-center justify-between gap-3">
                          <Progress
                            value={metric.score}
                            className="w-full h-1.5 bg-[#333]"
                            indicatorClassName={
                              metric.score >= 80
                                ? "bg-green-500"
                                : metric.score >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }
                          />
                          <span
                            className={cn(
                              "font-black text-lg shrink-0",
                              metric.score >= 80
                                ? "text-green-500"
                                : metric.score >= 60
                                ? "text-yellow-500"
                                : "text-red-500"
                            )}
                          >
                            {metric.score}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center border-r border-border">
                        <span className="text-primary font-black text-base">
                          +{metric.trend}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge
                          className={cn(
                            "font-black text-xs py-1 px-3 uppercase tracking-wider shadow-sm",
                            getGradeColor(metric.grade)
                          )}
                        >
                          {metric.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
