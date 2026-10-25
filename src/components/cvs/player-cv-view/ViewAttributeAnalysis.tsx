/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { usePlayerCvView } from "./PlayerCvViewContext";

const AttributeDonut = ({ score, color }: { score: number; color: string }) => {
  const data = [
    { name: "filled", value: score },
    { name: "empty", value: 100 - score },
  ];

  return (
    <ResponsiveContainer width={120} height={120}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={55}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          <Cell fill={color} />
          <Cell fill="#ffffff" />
          <Label
            value={score}
            position="center"
            fill={color}
            className="text-2xl font-black"
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const getHexColor = (val: number) => {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#eab308";
  return "#ef4444";
};

export const ViewAttributeAnalysis = () => {
  const { playerData } = usePlayerCvView();

  const cards = useMemo(() => {
    const categories = playerData.skillsCategories || [];
    return categories.map((cat) => {
      const attrs = (cat.skills || []).slice(0, 4).map((skill) => ({
        name: skill.name,
        value: skill.value,
      }));

      const score =
        attrs.length > 0
          ? Math.round(attrs.reduce((sum, a) => sum + a.value, 0) / attrs.length)
          : (cat.skills && cat.skills.length > 0)
          ? Math.round(cat.skills.reduce((sum, s) => sum + s.value, 0) / cat.skills.length)
          : 50;

      return {
        title: cat.category,
        color: getHexColor(score),
        attributes: attrs,
        score,
      };
    });
  }, [playerData.skillsCategories]);

  if (!playerData.skillsCategories || playerData.skillsCategories.length === 0) return null;

  return (
    <div className="container my-10 sm:my-20 w-full min-w-0 overflow-hidden">
      <h2 className="text-2xl sm:text-4xl font-light text-center font-heading mb-6 sm:mb-12 text-foreground tracking-wide">
        ANALYSIS OF PLAYER ATTRIBUTES
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
        {cards.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            className="border border-border bg-black/30 rounded-lg p-4 sm:p-8 flex flex-col items-center hover:bg-black/50 transition-colors w-full min-w-0"
          >
            <h3 className="text-xl font-bold font-heading text-center mb-8 uppercase tracking-widest text-primary/90 truncate max-w-full">
              {card.title}
            </h3>

            <div className="flex flex-col items-center mb-10">
              <AttributeDonut score={card.score} color={card.color} />
              <span className="mt-4 text-3xl font-black text-white">
                {card.score}
              </span>
            </div>

            <p className="text-xs uppercase tracking-widest text-gray-500 font-black text-center mb-8">
              Overall Score
            </p>

            <div className="w-full flex flex-col gap-4">
              {card.attributes.map((attr, attrIndex) => (
                <div
                  key={`${attr.name}-${attrIndex}`}
                  className="flex justify-between border-b border-white/10 pb-2 items-center text-base"
                >
                  <span className="text-gray-400 font-bold uppercase tracking-wide truncate mr-2">
                    {attr.name}
                  </span>
                  <span className="font-black text-white text-lg shrink-0">
                    {attr.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
