/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePlayerStats } from "../CvNotEditable";
import { usePlayer } from "@/hooks/usePlayer";
import CMSField from "@/components/shared/CMSField";
import { cn } from "@/lib/utils";
import {
  useGetMyPlayerAttributesQuery,
  useUpdateMyPlayerAttributesMutation,
} from "@/redux/features/player/playerApi";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";

export interface Skill {
  key: string;
  name: string;
  value: number;
}

export interface SkillCategory {
  category: string;
  categoryKey: string;
  color: string;
  borderColor: string;
  skills: Skill[];
}

export const INITIAL_SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Technical",
    categoryKey: "technical",
    color: "#0077FF",
    borderColor: "border-l-blue-500",
    skills: [
      { key: "ballControl", name: "Ball Control", value: 50 },
      { key: "dribbling", name: "Dribbling", value: 50 },
      { key: "shortPassing", name: "Short Passing", value: 50 },
      { key: "longPassing", name: "Long Passing", value: 50 },
      { key: "crossing", name: "Crossing", value: 50 },
      { key: "shooting", name: "Shooting", value: 50 },
      { key: "finishing", name: "Finishing", value: 50 },
      { key: "longShots", name: "Long Shots", value: 50 },
    ],
  },
  {
    category: "Tactical",
    categoryKey: "tactical",
    color: "#00FF62",
    borderColor: "border-l-green-500",
    skills: [
      { key: "positioning", name: "Positioning", value: 50 },
      { key: "vision", name: "Vision", value: 50 },
      { key: "anticipation", name: "Anticipation", value: 50 },
      { key: "composition", name: "Composition", value: 50 },
      { key: "teamwork", name: "Teamwork", value: 50 },
      { key: "workRate", name: "Work Rate", value: 50 },
      { key: "decisions", name: "Decisions", value: 50 },
      { key: "attPosition", name: "Att. Position", value: 50 },
    ],
  },
  {
    category: "Physical",
    categoryKey: "physical",
    color: "#FF1010",
    borderColor: "border-l-red-500",
    skills: [
      { key: "acceleration", name: "Acceleration", value: 50 },
      { key: "sprintSpeed", name: "Sprint Speed", value: 50 },
      { key: "stamina", name: "Stamina", value: 50 },
      { key: "strength", name: "Strength", value: 50 },
      { key: "balance", name: "Balance", value: 50 },
      { key: "agility", name: "Agility", value: 50 },
      { key: "reactions", name: "Reactions", value: 50 },
      { key: "jumping", name: "Jumping", value: 50 },
    ],
  },
  {
    category: "Mental",
    categoryKey: "mental",
    color: "#ffffff",
    borderColor: "border-l-yellow-500",
    skills: [
      { key: "aggression", name: "Aggression", value: 50 },
      { key: "concentration", name: "Concentration", value: 50 },
      { key: "consistency", name: "Consistency", value: 50 },
      { key: "leadership", name: "Leadership", value: 50 },
      { key: "bravery", name: "Bravery", value: 50 },
      { key: "determination", name: "Determination", value: 50 },
      { key: "heading", name: "Heading", value: 50 },
      { key: "influence", name: "Influence", value: 50 },
    ],
  },
  {
    category: "Attacking",
    categoryKey: "attacking",
    color: "#F200FF",
    borderColor: "border-l-purple-500",
    skills: [
      { key: "firstTouch", name: "First Touch", value: 50 },
      { key: "shotPower", name: "Shot Power", value: 50 },
      { key: "curve", name: "Curve", value: 50 },
      { key: "freeKick", name: "Free Kick", value: 50 },
      { key: "penalties", name: "Penalties", value: 50 },
      { key: "volleys", name: "Volleys", value: 50 },
      { key: "headingAccuracy", name: "Heading Accuracy", value: 50 },
      { key: "weakFoot", name: "Weak Foot", value: 50 },
    ],
  },
  {
    category: "Defending",
    categoryKey: "defending",
    color: "#FF8010",
    borderColor: "border-l-orange-500",
    skills: [
      { key: "standingTackle", name: "Standing Tackle", value: 50 },
      { key: "slidingTackle", name: "Sliding Tackle", value: 50 },
      { key: "interception", name: "Interception", value: 50 },
      { key: "marking", name: "Marking", value: 50 },
      { key: "aerialDuels", name: "Aerial Duels", value: 50 },
      { key: "clearance", name: "Clearance", value: 50 },
      { key: "pressing", name: "Pressing", value: 50 },
      { key: "defensiveAwareness", name: "Defensive Awareness", value: 50 },
    ],
  },
];

const SkillsAttributes = ({ editable = false }: { editable?: boolean }) => {
  const { handleUpdate: syncToRedux } = usePlayer();
  const { setSkillsAvg } = usePlayerStats();

  // RTK Query API Hooks
  const { data: attributesResponse, isLoading } = useGetMyPlayerAttributesQuery(undefined);
  const [updateMyPlayerAttributes, { isLoading: isUpdating }] = useUpdateMyPlayerAttributesMutation();

  const [categories, setCategories] = useState<SkillCategory[]>(INITIAL_SKILL_CATEGORIES);
  const [isDirty, setIsDirty] = useState(false);

  // Sync state when API data arrives
  useEffect(() => {
    const apiCategories = attributesResponse?.data?.categories;
    if (apiCategories && typeof apiCategories === "object") {
      setCategories((prev) =>
        prev.map((cat) => {
          const catData = apiCategories[cat.categoryKey] || {};
          return {
            ...cat,
            skills: cat.skills.map((skill) => {
              let val = catData[skill.key];

              // Handle naming compatibility
              if (val === undefined) {
                if (skill.key === "composition" && catData.composure !== undefined) {
                  val = catData.composure;
                } else if (skill.key === "concentration" && catData.interceptions !== undefined) {
                  val = catData.interceptions;
                } else if (skill.key === "consistency" && catData.marking !== undefined) {
                  val = catData.marking;
                }
              }

              return {
                ...skill,
                value: typeof val === "number" ? val : skill.value,
              };
            }),
          };
        })
      );
      setIsDirty(false);
    }
  }, [attributesResponse]);

  // Sync with Redux and calculate overall average
  useEffect(() => {
    const allSkills = categories.flatMap((c) => c.skills);
    const avg = allSkills.reduce((sum, s) => sum + s.value, 0) / (allSkills.length || 1);
    setSkillsAvg(Math.round(avg));

    // Sync to Redux so other CV sections (Attribute Analysis, etc.) see it
    syncToRedux("skillsCategories", categories);
  }, [categories, setSkillsAvg]);

  const handleSkillChange = (catIdx: number, skillIdx: number, rawVal: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(rawVal) ? 0 : rawVal));
    setCategories((prev) => {
      const newCats = [...prev];
      newCats[catIdx] = {
        ...newCats[catIdx],
        skills: [...newCats[catIdx].skills],
      };
      newCats[catIdx].skills[skillIdx] = {
        ...newCats[catIdx].skills[skillIdx],
        value: clamped,
      };
      return newCats;
    });
    setIsDirty(true);
  };

  const handleSaveAttributes = async () => {
    try {
      const payload: Record<string, number> = {};
      categories.forEach((cat) => {
        cat.skills.forEach((skill) => {
          payload[skill.key] = Number(skill.value);
        });
      });

      // Keep composition / composure compatibility
      if (payload.composition !== undefined) {
        payload.composure = payload.composition;
      }

      await updateMyPlayerAttributes(payload).unwrap();
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to update attributes:", error);
    }
  };

  const getIndicatorColor = (val: number) => {
    if (val >= 80) return "bg-green-500";
    if (val >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getHexColor = (val: number) => {
    if (val >= 80) return "#22c55e";
    if (val >= 60) return "#eab308";
    return "#ef4444";
  };

  const getCategoryBorderClass = (category: string) => {
    switch (category.toLowerCase()) {
      case "technical":
        return "border-blue";
      case "physical":
        return "border-red";
      case "tactical":
        return "border-primary";
      case "mental":
        return "border-yellow";
      case "attacking":
        return "border-purple";
      case "defending":
        return "border-orange";
      default:
        return "border-primary";
    }
  };

  return (
    <div className="container mt-10 sm:mt-20 w-full min-w-0">
      {/* Section Header with Title & Optional Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="hidden sm:block w-36" />
        <h1 className="text-2xl sm:text-4xl font-light text-center font-heading text-foreground tracking-wide">
          SKILLS ATTRIBUTES
        </h1>
        {editable ? (
          <Button
            type="button"
            onClick={handleSaveAttributes}
            disabled={isUpdating}
            className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 h-10 flex items-center justify-center gap-2 font-orbitron cursor-pointer disabled:opacity-50 transition-all shadow-md"
          >
            {isUpdating ? (
              <>
                <IconLoader2 className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" /> Save Attributes
              </>
            )}
          </Button>
        ) : (
          <div className="hidden sm:block w-36" />
        )}
      </div>

      <div className="border border-border bg-cardBg rounded-2xl p-4 sm:p-8 w-full min-w-0 overflow-hidden relative">
        {isLoading && !attributesResponse && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-30">
            <div className="flex items-center gap-2 text-white font-orbitron text-xs">
              <IconLoader2 className="size-5 animate-spin text-[#E31B23]" /> Loading attributes...
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full min-w-0">
          {categories.map((category, catIdx) => (
            <div key={category.category} className="flex flex-col gap-4 sm:pl-4 w-full min-w-0">
              <h2
                className={`text-lg sm:text-xl border-l-4 font-heading ${getCategoryBorderClass(
                  category.category
                )} pl-3 sm:pl-4 text-foreground`}
              >
                {category.category}
              </h2>

              <div className="flex flex-col gap-3 sm:gap-4 w-full min-w-0">
                {category.skills.map((skill, skillIdx) => {
                  const color = getHexColor(skill.value);

                  return (
                    <div
                      key={skill.key || skill.name}
                      className="grid grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_1fr_auto] items-center gap-2 p-1.5 bg-[#1a1a1a]/40 border border-border/40 rounded-lg group/skill transition-colors hover:bg-[#1a1a1a]/60 w-full min-w-0"
                    >
                      <div className="truncate min-w-0">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase truncate block">
                          {skill.name}
                        </span>
                      </div>

                      <div className="min-w-0 translate-y-1.25">
                        {editable ? (
                          <div className="relative flex items-center h-2 group">
                            <div className="w-full h-1.5 bg-[#333] rounded-full overflow-hidden relative">
                              <div
                                className={cn(
                                  "h-full transition-all duration-300 ease-out",
                                  getIndicatorColor(skill.value)
                                )}
                                style={{ width: `${skill.value}%` }}
                              />
                            </div>

                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={skill.value}
                              onChange={(e) =>
                                handleSkillChange(catIdx, skillIdx, parseInt(e.target.value))
                              }
                              style={{
                                background: `linear-gradient(to right, ${color} ${skill.value}%, #333 ${skill.value}%)`,
                              }}
                              className="w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all absolute inset-0 z-10 opacity-0 group-hover:opacity-100 accent-primary"
                            />

                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={skill.value}
                              onChange={(e) =>
                                handleSkillChange(catIdx, skillIdx, parseInt(e.target.value))
                              }
                              className="w-full h-6 opacity-0 cursor-pointer absolute inset-0 z-20"
                            />
                          </div>
                        ) : (
                          <Progress
                            value={skill.value}
                            indicatorClassName={getIndicatorColor(skill.value)}
                            className="h-1.5"
                            style={{ backgroundColor: "#333" }}
                          />
                        )}
                      </div>

                      <div className="flex justify-end">
                        <CMSField
                          value={skill.value}
                          onUpdate={(val) =>
                            handleSkillChange(catIdx, skillIdx, parseInt(String(val)))
                          }
                          canEdit={editable}
                          type="number"
                          editTrigger="doubleClick"
                          className="font-bold text-base justify-end uppercase"
                          style={{ color: getHexColor(skill.value) }}
                          inputClassName="text-right h-6 w-14 text-base bg-gray-900 uppercase"
                          hideIcon={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Save Action Bar when editable */}
        {editable && (
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {isDirty ? (
                <span className="text-yellow-400 font-semibold">• You have unsaved attribute changes</span>
              ) : (
                "All skills attributes are synced with your profile."
              )}
            </p>
            <Button
              type="button"
              onClick={handleSaveAttributes}
              disabled={isUpdating || !isDirty}
              className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-wider px-6 h-11 flex items-center justify-center gap-2 font-orbitron cursor-pointer disabled:opacity-50 transition-all shadow-md"
            >
              {isUpdating ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsAttributes;
