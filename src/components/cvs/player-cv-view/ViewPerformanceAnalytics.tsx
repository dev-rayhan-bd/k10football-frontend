/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { usePlayerCvView } from "./PlayerCvViewContext";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

const getHexColor = (val: number) => {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#eab308";
  return "#ef4444";
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-primary/50 rounded px-3 py-2">
        <p className="text-white text-sm font-medium">{payload[0].payload.name}</p>
        <p className="text-primary text-sm">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const DonutChartCard = ({
  title,
  percentage,
  data,
}: {
  title: string;
  percentage: number;
  data: ChartDataItem[];
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-xl md:text-2xl font-heading font-normal mb-6 uppercase tracking-widest text-primary/90">
        {title}
      </h3>
      <div className="w-full aspect-square max-w-[280px] sm:max-w-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="95%"
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                value={`${percentage}%`}
                position="center"
                fill="white"
                className="text-4xl md:text-5xl font-black"
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
          >
            <div
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ViewPerformanceAnalytics = () => {
  const { playerData, cvData } = usePlayerCvView();

  const skillData = (playerData.skillsCategories || []).map((cat: any) => {
    const avg = Math.round(
      cat.skills.reduce((sum: number, s: any) => sum + s.value, 0) / (cat.skills.length || 1)
    );
    return {
      name: cat.category,
      value: avg,
      color: getHexColor(avg),
    };
  });

  const skillsAvg =
    cvData?.skillsDonutScore !== undefined
      ? Math.round(Number(cvData.skillsDonutScore))
      : skillData.length > 0
        ? Math.round(skillData.reduce((sum, d) => sum + d.value, 0) / skillData.length)
        : 61;

  const rightFootVal = cvData?.footDonut?.right ?? playerData.rightLegUsage ?? 50;
  const leftFootVal = cvData?.footDonut?.left ?? playerData.leftLegUsage ?? 50;
  const headingVal =
    cvData?.footDonut?.heading ??
    playerData.strengths?.heading ??
    50;

  const footData = [
    { name: "Right Foot", value: rightFootVal, color: getHexColor(rightFootVal) },
    { name: "Left Foot", value: leftFootVal, color: getHexColor(leftFootVal) },
    { name: "Heading", value: headingVal, color: getHexColor(headingVal) },
  ];

  const footAvg =
    cvData?.footDonut?.overall ??
    Math.round(footData.reduce((sum, d) => sum + d.value, 0) / footData.length);

  return (
    <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
      <h2 className="text-2xl sm:text-4xl font-light font-heading text-center mb-6 sm:mb-12 text-foreground">
        PERFORMANCE ANALYTICS
      </h2>

      <div className="bg-black/30 border border-border/40 rounded-2xl p-4 sm:p-6 md:p-10 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-start w-full min-w-0">
          <div className="flex justify-center w-full min-w-0">
            <DonutChartCard
              title="Skills"
              percentage={skillsAvg}
              data={skillData}
            />
          </div>

          <div className="flex justify-center w-full min-w-0">
            <DonutChartCard
              title="Foot"
              percentage={footAvg}
              data={footData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
