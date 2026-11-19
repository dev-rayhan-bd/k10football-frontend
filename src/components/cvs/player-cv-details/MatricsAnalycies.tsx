/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { usePlayerStats } from './FullEditablePage'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { usePlayer } from '@/hooks/usePlayer'
import CMSField from '@/components/shared/CMSField'
import { cn } from '@/lib/utils'
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

interface MetricRow {
  category: string
  score: number
  trend: number
  grade: 'Excellent' | 'Good' | 'Average'
}

const getGrade = (score: number): 'Excellent' | 'Good' | 'Average' => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Average';
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'Excellent': return 'bg-[#22c55e] text-white'; // Green
    case 'Good': return 'bg-[#eab308] text-white';      // Yellow
    case 'Average': return 'bg-[#ef4444] text-white';      // Red
    default: return 'bg-gray-500 text-white';
  }
};

const METRIC_CATEGORIES = ['Perception', 'Vision']

const MetricsAnalysis = ({ editable = false }: { editable?: boolean }) => {
  const { cvData, updatePlayerProfile } = usePlayer();
  const [activeTab, setActiveTab] = useState('Perception')
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [metricsData, setMetricsData] = useState<Record<string, MetricRow[]>>({
    Perception: [
      { category: 'Space Awareness', score: 92, trend: 3, grade: 'Excellent' },
      { category: 'Opponent Reading', score: 88, trend: 5, grade: 'Good' },
      { category: 'Game Flow Understanding', score: 85, trend: 2, grade: 'Good' },
      { category: 'Pressure Handling', score: 90, trend: 4, grade: 'Excellent' },
    ],
    Vision: [
      { category: 'Peripheral Vision', score: 87, trend: 3, grade: 'Good' },
      { category: 'Focus Control', score: 92, trend: 2, grade: 'Excellent' },
      { category: 'Pattern Recognition', score: 89, trend: 4, grade: 'Good' },
      { category: 'Decision Speed', score: 91, trend: 5, grade: 'Excellent' },
      { category: 'Visual Acuity', score: 86, trend: 1, grade: 'Good' },
    ],
  })

  // Synchronize metrics from cvData if present (only when not dirty)
  useEffect(() => {
    if (!isDirty && (cvData?.perceptionMetrics || cvData?.visionMetrics)) {
      setMetricsData(prev => {
        const next = { ...prev };
        if (cvData.perceptionMetrics) {
          next.Perception = [
            { category: 'Space Awareness', score: cvData.perceptionMetrics.spaceAwareness?.score ?? 92, trend: cvData.perceptionMetrics.spaceAwareness?.trend ?? 3, grade: getGrade(cvData.perceptionMetrics.spaceAwareness?.score ?? 92) },
            { category: 'Opponent Reading', score: cvData.perceptionMetrics.opponentReading?.score ?? 88, trend: cvData.perceptionMetrics.opponentReading?.trend ?? 5, grade: getGrade(cvData.perceptionMetrics.opponentReading?.score ?? 88) },
            { category: 'Game Flow Understanding', score: cvData.perceptionMetrics.gameFlowUnderstanding?.score ?? 85, trend: cvData.perceptionMetrics.gameFlowUnderstanding?.trend ?? 2, grade: getGrade(cvData.perceptionMetrics.gameFlowUnderstanding?.score ?? 85) },
            { category: 'Pressure Handling', score: cvData.perceptionMetrics.pressureHandling?.score ?? 90, trend: cvData.perceptionMetrics.pressureHandling?.trend ?? 4, grade: getGrade(cvData.perceptionMetrics.pressureHandling?.score ?? 90) },
          ];
        }
        if (cvData.visionMetrics) {
          next.Vision = [
            { category: 'Peripheral Vision', score: cvData.visionMetrics.peripheralVision?.score ?? 87, trend: cvData.visionMetrics.peripheralVision?.trend ?? 3, grade: getGrade(cvData.visionMetrics.peripheralVision?.score ?? 87) },
            { category: 'Focus Control', score: cvData.visionMetrics.focusControl?.score ?? 92, trend: cvData.visionMetrics.focusControl?.trend ?? 2, grade: getGrade(cvData.visionMetrics.focusControl?.score ?? 92) },
            { category: 'Pattern Recognition', score: cvData.visionMetrics.patternRecognition?.score ?? 89, trend: cvData.visionMetrics.patternRecognition?.trend ?? 4, grade: getGrade(cvData.visionMetrics.patternRecognition?.score ?? 89) },
            { category: 'Decision Speed', score: cvData.visionMetrics.decisionSpeed?.score ?? 91, trend: cvData.visionMetrics.decisionSpeed?.trend ?? 5, grade: getGrade(cvData.visionMetrics.decisionSpeed?.score ?? 91) },
            { category: 'Visual Acuity', score: cvData.visionMetrics.visualAcuity?.score ?? 86, trend: cvData.visionMetrics.visualAcuity?.trend ?? 1, grade: getGrade(cvData.visionMetrics.visualAcuity?.score ?? 86) },
          ];
        }
        return next;
      });
    }
  }, [cvData, isDirty]);

  const { setMetricsAvg } = usePlayerStats();

  useEffect(() => {
    const allRows = Object.values(metricsData).flat();
    const avg = allRows.reduce((sum, r) => sum + r.score, 0) / allRows.length;
    setMetricsAvg(Math.round(avg));
  }, [metricsData, setMetricsAvg]);

  const handleUpdate = (tab: string, idx: number, field: keyof MetricRow, value: any) => {
    setMetricsData(prev => {
      const newData = { ...prev };
      const row = { ...newData[tab][idx] };

      if (field === 'score') {
        const score = Math.max(0, Math.min(100, parseInt(value) || 0));
        row.score = score;
        row.grade = getGrade(score);
      } else if (field === 'trend') {
        row.trend = Math.max(0, parseInt(value) || 0);
      } else {
        (row as any)[field] = value;
      }

      newData[tab][idx] = row;
      setIsDirty(true);
      return newData;
    });
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const perceptionRows = metricsData.Perception || [];
      const visionRows = metricsData.Vision || [];

      const mapPerceptionKey: Record<string, string> = {
        'Space Awareness': 'spaceAwareness',
        'Opponent Reading': 'opponentReading',
        'Game Flow Understanding': 'gameFlowUnderstanding',
        'Pressure Handling': 'pressureHandling',
      };
      const perceptionMetrics: Record<string, any> = {};
      perceptionRows.forEach(r => {
        const key = mapPerceptionKey[r.category] || r.category.toLowerCase().replace(/ /g, '');
        perceptionMetrics[key] = { score: r.score, trend: r.trend };
      });

      const mapVisionKey: Record<string, string> = {
        'Peripheral Vision': 'peripheralVision',
        'Focus Control': 'focusControl',
        'Pattern Recognition': 'patternRecognition',
        'Decision Speed': 'decisionSpeed',
        'Visual Acuity': 'visualAcuity',
      };
      const visionMetrics: Record<string, any> = {};
      visionRows.forEach(r => {
        const key = mapVisionKey[r.category] || r.category.toLowerCase().replace(/ /g, '');
        visionMetrics[key] = { score: r.score, trend: r.trend };
      });

      await updatePlayerProfile({
        perceptionMetrics,
        visionMetrics,
      });

      setIsDirty(false);
      toast.success("Detailed Analysis Metrics updated successfully!");
    } catch (err: any) {
      console.error("Failed to update metrics:", err);
      toast.error(err?.data?.message || "Failed to update metrics. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setIsDirty(false);
    if (cvData?.perceptionMetrics || cvData?.visionMetrics) {
      setMetricsData(prev => {
        const next = { ...prev };
        if (cvData.perceptionMetrics) {
          next.Perception = [
            { category: 'Space Awareness', score: cvData.perceptionMetrics.spaceAwareness?.score ?? 92, trend: cvData.perceptionMetrics.spaceAwareness?.trend ?? 3, grade: getGrade(cvData.perceptionMetrics.spaceAwareness?.score ?? 92) },
            { category: 'Opponent Reading', score: cvData.perceptionMetrics.opponentReading?.score ?? 88, trend: cvData.perceptionMetrics.opponentReading?.trend ?? 5, grade: getGrade(cvData.perceptionMetrics.opponentReading?.score ?? 88) },
            { category: 'Game Flow Understanding', score: cvData.perceptionMetrics.gameFlowUnderstanding?.score ?? 85, trend: cvData.perceptionMetrics.gameFlowUnderstanding?.trend ?? 2, grade: getGrade(cvData.perceptionMetrics.gameFlowUnderstanding?.score ?? 85) },
            { category: 'Pressure Handling', score: cvData.perceptionMetrics.pressureHandling?.score ?? 90, trend: cvData.perceptionMetrics.pressureHandling?.trend ?? 4, grade: getGrade(cvData.perceptionMetrics.pressureHandling?.score ?? 90) },
          ];
        }
        if (cvData.visionMetrics) {
          next.Vision = [
            { category: 'Peripheral Vision', score: cvData.visionMetrics.peripheralVision?.score ?? 87, trend: cvData.visionMetrics.peripheralVision?.trend ?? 3, grade: getGrade(cvData.visionMetrics.peripheralVision?.score ?? 87) },
            { category: 'Focus Control', score: cvData.visionMetrics.focusControl?.score ?? 92, trend: cvData.visionMetrics.focusControl?.trend ?? 2, grade: getGrade(cvData.visionMetrics.focusControl?.score ?? 92) },
            { category: 'Pattern Recognition', score: cvData.visionMetrics.patternRecognition?.score ?? 89, trend: cvData.visionMetrics.patternRecognition?.trend ?? 4, grade: getGrade(cvData.visionMetrics.patternRecognition?.score ?? 89) },
            { category: 'Decision Speed', score: cvData.visionMetrics.decisionSpeed?.score ?? 91, trend: cvData.visionMetrics.decisionSpeed?.trend ?? 5, grade: getGrade(cvData.visionMetrics.decisionSpeed?.score ?? 91) },
            { category: 'Visual Acuity', score: cvData.visionMetrics.visualAcuity?.score ?? 86, trend: cvData.visionMetrics.visualAcuity?.trend ?? 1, grade: getGrade(cvData.visionMetrics.visualAcuity?.score ?? 86) },
          ];
        }
        return next;
      });
    }
  };


return (
<div className="w-full py-10 sm:py-16 px-0 sm:px-6 bg-background min-w-0 overflow-hidden">
  <div className="container mx-auto w-full min-w-0">
    <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-center text-foreground mb-8 sm:mb-12 tracking-wider">
      DETAILED ANALYSIS METRICS
    </h2>

    <div className="border-y sm:border border-border rounded-none sm:rounded-lg p-1 sm:p-8 w-full min-w-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
        <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 p-1 rounded-full">
          {METRIC_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="rounded-full text-xs sm:text-base font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-black data-[state=inactive]:text-foreground uppercase tracking-widest py-2"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="w-full min-w-0">
          <div className="w-full overflow-x-auto no-scrollbar min-w-0 pb-2">
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
              {metricsData[activeTab].map((metric, idx) => (
                <TableRow
                  key={idx}
                  className="border-b border-border hover:bg-[#262626] transition-colors"
                >
                  <TableCell className="border-r border-border py-4">
                    <CMSField
                      value={metric.category}
                      onUpdate={(val) => handleUpdate(activeTab, idx, 'category', val)}
                      canEdit={editable}
                      className="w-full font-bold text-xs sm:text-base uppercase text-gray-200"
                      inputClassName="text-xs sm:text-base font-bold uppercase"
                      noTruncate={true}
                    />
                  </TableCell>

                  <TableCell className="border-r border-border min-w-62.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="relative flex-1 min-w-0 flex items-center h-2 group translate-y-1.25">
                        {editable ? (
                          <>
                            <div className="w-full h-1.5 bg-[#333] rounded-full overflow-hidden relative">
                              <div
                                className={cn(
                                  "h-full transition-all duration-300 ease-out",
                                  metric.score >= 80 ? "bg-[#22c55e]" : metric.score >= 60 ? "bg-[#eab308]" : "bg-[#ef4444]"
                                )}
                                style={{ width: `${metric.score}%` }}
                              />
                            </div>
                            {/* Single Clean Range Input */}
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={metric.score}
                              onChange={(e) =>
                                handleUpdate(activeTab, idx, 'score', parseInt(e.target.value))
                              }
                              style={{
                                background: `linear-gradient(to right, ${metric.score >= 80 ? '#22c55e' : metric.score >= 60 ? '#eab308' : '#ef4444'} ${metric.score}%, #333 ${metric.score}%)`,
                              }}
                              className={cn(
                                "w-full h-4 rounded-full appearance-none cursor-pointer transition-all absolute inset-0 z-10 opacity-0 group-hover:opacity-100",
                                metric.score >= 80 ? "accent-[#22c55e]" : metric.score >= 60 ? "accent-[#eab308]" : "accent-[#ef4444]"
                              )}
                            />
                          </>
                        ) : (
                          <Progress
                            value={metric.score}
                            className="w-full h-1.5"
                            style={{ backgroundColor: '#333' }}
                            indicatorClassName={metric.score >= 80 ? "bg-[#22c55e]" : metric.score >= 60 ? "bg-[#eab308]" : "bg-[#ef4444]"}
                          />
                        )}
                      </div>
                      <div className="shrink-0">
                        <CMSField
                          value={metric.score}
                          onUpdate={(val) => handleUpdate(activeTab, idx, 'score', val)}
                          canEdit={editable}
                          isNumeric
                          className="font-black text-lg justify-end"
                          style={{ color: metric.score >= 80 ? '#22c55e' : metric.score >= 60 ? '#eab308' : '#ef4444' }}
                          inputClassName="text-right w-16 text-lg bg-gray-900 border-gray-700 font-black"
                        />
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center border-r border-border">
                    <div className="flex justify-center items-center gap-1">
                      <span className="text-primary font-black text-base">+</span>
                      <CMSField
                        value={metric.trend}
                        onUpdate={(val) => handleUpdate(activeTab, idx, 'trend', val)}
                        canEdit={editable}
                        isNumeric
                        className="text-primary font-black text-base"
                        inputClassName="w-14 text-center text-base font-black"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge
                      className={`font-black text-sm min-w-25 py-1.5 justify-center uppercase tracking-tighter ${getGradeColor(metric.grade)} shadow-md`}
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

      {/* Save Changes bar when dirty */}
      {isDirty && (
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end gap-3 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={handleCancelChanges}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-xs text-gray-300 font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-red-900/30"
          >
            {isSaving ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  </div>
</div>
)
}

export default MetricsAnalysis;
