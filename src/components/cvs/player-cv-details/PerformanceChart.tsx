/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts'
import { usePlayer } from '@/hooks/usePlayer'

interface ChartDataItem {
  name: string
  value: number
  color: string
}

interface PerformanceChartProps {
  title: string
  percentage: number
  data: ChartDataItem[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-primary/50 rounded px-3 py-2">
        <p className="text-white text-sm font-medium">{payload[0].payload.name}</p>
        <p className="text-primary text-sm">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

const PerformanceChart = ({ title, percentage, data }: PerformanceChartProps) => {
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-xl md:text-2xl font-heading font-normal mb-6 uppercase tracking-widest text-primary/90">
        {title}
      </h3>
      <div className="w-full aspect-square max-w-100">
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
                className="text-4xl md:text-6xl font-black"
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-8">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm md:text-base font-bold text-white uppercase tracking-wider">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const getHexColor = (val: number) => {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#eab308";
  return "#ef4444";
};

const PerformanceAnalytics = () => {
  const { playerData, cvData } = usePlayer();

  const skillData = (playerData.skillsCategories || []).map((cat: any) => {
    const avg = Math.round(
      cat.skills.reduce((sum: number, s: any) => sum + s.value, 0) / cat.skills.length
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
        : 0;

  const rightFootVal = cvData?.footDonut?.right ?? playerData.rightLegUsage ?? 0;
  const leftFootVal = cvData?.footDonut?.left ?? playerData.leftLegUsage ?? 0;
  const headingVal =
    cvData?.footDonut?.heading ??
    playerData.strengths?.heading ??
    (playerData.skillsCategories || [])
      .flatMap((c: any) => c.skills)
      .find((s: any) => s.name.toLowerCase() === "heading" || s.name.toLowerCase() === "jumping")
      ?.value;

  const footData = [
    {
      name: 'Right Foot',
      value: rightFootVal,
      color: getHexColor(rightFootVal),
    },
    {
      name: 'Left Foot',
      value: leftFootVal,
      color: getHexColor(leftFootVal),
    },
  ];

  if (headingVal !== undefined) {
    footData.push({
      name: 'Heading',
      value: headingVal,
      color: getHexColor(headingVal),
    });
  }

  const footAvg =
    footData.length > 0
      ? Math.round(footData.reduce((sum, d) => sum + d.value, 0) / footData.length)
      : 0;

  return (
    <div className="mt-10 sm:mt-20 container w-full min-w-0 overflow-hidden">
      <h1 className="text-2xl sm:text-4xl font-light font-heading text-center mb-6 sm:mb-12 text-foreground">
        PERFORMANCE ANALYTICS
      </h1>

      <div className="bg-black/30 rounded-2xl p-4 sm:p-6 md:p-10 w-full min-w-0">
        {/* Charts Grid - 2 side-by-side charts: Skills and Foot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-start w-full min-w-0">
          {/* Chart 1 - Skills */}
          <div className="flex justify-center w-full min-w-0">
            <PerformanceChart
              title="Skills"
              percentage={skillsAvg}
              data={skillData}
            />
          </div>

          {/* Chart 2 - Foot */}
          <div className="flex justify-center w-full min-w-0">
            <PerformanceChart
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

export default PerformanceAnalytics;
