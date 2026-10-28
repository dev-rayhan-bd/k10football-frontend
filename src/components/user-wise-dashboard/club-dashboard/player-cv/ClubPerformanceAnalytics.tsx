/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { useClubPlayerCv } from "./ClubPlayerCvContext";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

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
      <h3 className="text-lg md:text-xl font-heading font-normal mb-6 uppercase tracking-widest text-primary/90 text-center">
        {title}
      </h3>
      <div className="w-full aspect-square max-w-[240px] sm:max-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                value={`${percentage}%`}
                position="center"
                className="fill-foreground font-black text-2xl sm:text-3xl"
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ClubPerformanceAnalytics = () => {
  const { playerData } = useClubPlayerCv();
  const metrics = playerData.performanceMetrics || {
    passAccuracy: 88,
    shootAccuracy: 75,
    dribbleSuccess: 80,
    tackleSuccess: 70,
  };

  const makeChartData = (val: number, mainColor = "#00FF62"): ChartDataItem[] => [
    { name: "Successful", value: val, color: mainColor },
    { name: "Other", value: 100 - val, color: "#222222" },
  ];

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Performance Analytics
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Action success distribution derived from verified competitive match data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full">
          <DonutChartCard
            title="Pass Accuracy"
            percentage={metrics.passAccuracy}
            data={makeChartData(metrics.passAccuracy, "#00FF62")}
          />
          <DonutChartCard
            title="Shoot Accuracy"
            percentage={metrics.shootAccuracy}
            data={makeChartData(metrics.shootAccuracy, "#0077FF")}
          />
          <DonutChartCard
            title="Dribble Success"
            percentage={metrics.dribbleSuccess}
            data={makeChartData(metrics.dribbleSuccess, "#FFD700")}
          />
          <DonutChartCard
            title="Tackle Success"
            percentage={metrics.tackleSuccess}
            data={makeChartData(metrics.tackleSuccess, "#FF1010")}
          />
        </div>
      </div>
    </div>
  );
};

