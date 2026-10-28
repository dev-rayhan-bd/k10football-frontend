"use client";

import React, { useState } from "react";
import { useClubPlayerCv } from "./ClubPlayerCvContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const ClubMetricsAnalysis = () => {
  const { playerData } = useClubPlayerCv();
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
      category: "Field Scanning Rate",
      score: visionMetrics.fieldScanningRate?.score ?? 86,
      trend: visionMetrics.fieldScanningRate?.trend ?? 4,
      grade: visionMetrics.fieldScanningRate?.grade ?? "GOOD",
    },
    {
      category: "Blind Spot Awareness",
      score: visionMetrics.blindSpotAwareness?.score ?? 82,
      trend: visionMetrics.blindSpotAwareness?.trend ?? 1,
      grade: visionMetrics.blindSpotAwareness?.grade ?? "GOOD",
    },
    {
      category: "Key Pass Lane Detection",
      score: visionMetrics.keyPassLaneDetection?.score ?? 91,
      trend: visionMetrics.keyPassLaneDetection?.trend ?? 6,
      grade: visionMetrics.keyPassLaneDetection?.grade ?? "EXCELLENT",
    },
    {
      category: "Transition Recognition",
      score: visionMetrics.transitionRecognition?.score ?? 89,
      trend: visionMetrics.transitionRecognition?.trend ?? 3,
      grade: visionMetrics.transitionRecognition?.grade ?? "EXCELLENT",
    },
  ];

  const renderTableRows = (rows: typeof perceptionRows) => (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/10 hover:bg-transparent">
          <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
            Metric
          </TableHead>
          <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
            Rating
          </TableHead>
          <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-center">
            Trend
          </TableHead>
          <TableHead className="text-muted-foreground text-xs font-bold uppercase tracking-wider text-right">
            Assessment
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i} className="border-b border-white/5 hover:bg-white/5 transition-all">
            <TableCell className="font-semibold text-foreground text-sm">
              {r.category}
            </TableCell>
            <TableCell className="w-48 sm:w-64">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground w-7 shrink-0">
                  {r.score}
                </span>
                <Progress
                  value={r.score}
                  className="h-1.5 flex-1 bg-black/40"
                  indicatorClassName={
                    r.score >= 85 ? "bg-primary" : "bg-amber-500"
                  }
                />
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span className="text-xs font-bold text-primary">
                +{r.trend}%
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant={r.grade === "EXCELLENT" ? "default" : "secondary"}>
                {r.grade}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Cognitive & Vision Analytics
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Tactical decision intelligence, field scanning frequency, and spatial vision.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl mb-6 flex max-w-xs mx-auto">
            <TabsTrigger
              value="Perception"
              className="flex-1 rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Perception
            </TabsTrigger>
            <TabsTrigger
              value="Vision"
              className="flex-1 rounded-lg text-xs font-bold uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Vision
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Perception" className="w-full overflow-x-auto">
            {renderTableRows(perceptionRows)}
          </TabsContent>
          <TabsContent value="Vision" className="w-full overflow-x-auto">
            {renderTableRows(visionRows)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
