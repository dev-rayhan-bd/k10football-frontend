"use client";

import React from "react";
import { useClubPlayerCv } from "./ClubPlayerCvContext";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const ClubSkillAttributeSection = () => {
  const { playerData } = useClubPlayerCv();
  const categories = playerData.skillsCategories || [];

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-light text-foreground uppercase tracking-wider mb-2">
            Skills & Attributes
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            Comprehensive breakdown of tactical, technical, physical, mental, attacking, and defensive metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full min-w-0">
          {categories.map((cat, catIdx) => {
            const catAvg = Math.round(
              cat.skills.reduce((sum, s) => sum + s.value, 0) / (cat.skills.length || 1)
            );

            return (
              <div
                key={catIdx}
                className={cn(
                  "bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col gap-4 border-l-4",
                  cat.borderColor
                )}
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-base font-bold uppercase tracking-wider text-white">
                    {cat.category}
                  </h3>
                  <span className="text-xs font-black px-2.5 py-1 rounded-md bg-white/5 text-primary">
                    AVG {catAvg}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {cat.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{skill.name}</span>
                        <span className="text-foreground font-bold">{skill.value}</span>
                      </div>
                      <Progress
                        value={skill.value}
                        className="h-1.5 bg-black/40"
                        indicatorClassName={
                          skill.value >= 80
                            ? "bg-primary"
                            : skill.value >= 60
                            ? "bg-amber-500"
                            : "bg-destructive"
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
