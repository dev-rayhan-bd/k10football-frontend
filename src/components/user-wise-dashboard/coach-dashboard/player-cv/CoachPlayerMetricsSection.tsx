/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useCoachPlayerCv } from "./CoachPlayerCvContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const getGradeBadge = (grade: string) => {
  const g = grade.toUpperCase();
  if (g.includes("EXCELLENT")) {
    return (
      <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400 font-bold">
        {grade}
      </Badge>
    );
  }
  if (g.includes("GOOD")) {
    return (
      <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-bold">
        {grade}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400 font-bold">
      {grade}
    </Badge>
  );
};

export const CoachPlayerMetricsSection = () => {
  const { playerData } = useCoachPlayerCv();
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
          <div className="flex justify-center mb-8">
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

          <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/30">
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider text-center">
                    Score
                  </TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider text-center">
                    Progress
                  </TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider text-center">
                    Trend
                  </TableHead>
                  <TableHead className="text-white font-bold text-xs uppercase tracking-wider text-right">
                    Grade
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {currentRows.map((row, idx) => (
                  <TableRow key={idx} className="border-none hover:bg-white/5">
                    <TableCell className="font-medium text-white text-sm">
                      {row.category}
                    </TableCell>
                    <TableCell className="text-center font-bold text-sm text-primary">
                      {row.score}
                    </TableCell>
                    <TableCell className="w-48">
                      <Progress
                        value={row.score}
                        className="h-2 bg-white/5"
                        indicatorClassName={cn(
                          row.score >= 90
                            ? "bg-green-500"
                            : row.score >= 80
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center text-xs text-green-400 font-bold">
                      +{row.trend}%
                    </TableCell>
                    <TableCell className="text-right">
                      {getGradeBadge(row.grade)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
