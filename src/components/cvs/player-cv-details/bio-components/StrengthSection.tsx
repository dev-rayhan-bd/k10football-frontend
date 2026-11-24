/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import CMSField from "@/components/shared/CMSField";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { updatePlayerField } from "@/redux/features/player/playerSlice";
import { STRENGTH_KEYS, getIndicatorColor, getHexColor } from "./bioConstants";

interface StrengthSectionProps {
  playerData: any;
  updatePlayerProfile: (data: any) => Promise<any>;
  dispatch: any;
  canEditEvaluation: boolean;
}

export const StrengthSection = ({
  playerData,
  updatePlayerProfile,
  dispatch,
  canEditEvaluation,
}: StrengthSectionProps) => {
  // Non-optimistic Strength draft state
  const [strengthDraft, setStrengthDraft] = useState<Record<string, number>>(
    () => ({
      ...(playerData?.strengths || {
        pace: 50,
        shooting: 50,
        passing: 50,
        dribbling: 50,
        defending: 50,
        physical: 50,
        heading: 88,
      }),
    })
  );
  const [isStrengthDirty, setIsStrengthDirty] = useState(false);
  const [isSavingStrength, setIsSavingStrength] = useState(false);

  // Sync draft when playerData.strengths arrives from API, as long as user hasn't made unsaved changes
  useEffect(() => {
    if (!isStrengthDirty && playerData?.strengths) {
      setStrengthDraft({ ...playerData.strengths });
    }
  }, [playerData?.strengths, isStrengthDirty]);

  const clampStrength = (v: unknown) => {
    const n = Number(v);
    return isNaN(n) ? 50 : Math.max(1, Math.min(99, Math.round(n)));
  };

  const handleStrengthChange = (key: string, val: number) => {
    const numVal = isNaN(val) ? 1 : Math.max(1, Math.min(99, val));
    setStrengthDraft((prev) => {
      const next = { ...prev, [key]: numVal };
      const hasDifference = STRENGTH_KEYS.some(
        ({ key: k }) =>
          (next[k] ?? 50) !== ((playerData?.strengths as any)?.[k] ?? 50)
      );
      setIsStrengthDirty(hasDifference);
      return next;
    });
  };

  const handleSaveStrength = async () => {
    try {
      // Send only the strengths the user actually changed. Each strength is
      // independent — never fan a value out to other attributes, or saving one
      // bar would overwrite (and shift) the others.
      const saved = (playerData?.strengths ?? {}) as Record<string, number>;
      const changed: Record<string, number> = {};
      STRENGTH_KEYS.forEach(({ key }) => {
        const draftValue = strengthDraft[key];
        if (draftValue === undefined) return;
        const next = clampStrength(draftValue);
        if (next !== saved[key]) changed[key] = next;
      });

      if (Object.keys(changed).length === 0) {
        setIsStrengthDirty(false);
        return;
      }

      setIsSavingStrength(true);
      await updatePlayerProfile({ strengths: changed });
      dispatch(
        updatePlayerField({ field: "strengths", value: { ...saved, ...changed } })
      );
      setIsStrengthDirty(false);
      toast.success("Strengths updated successfully!");
    } catch (err: any) {
      console.error("Failed to update strengths:", err);
      toast.error(
        err?.data?.message || "Failed to save strengths. Please try again."
      );
    } finally {
      setIsSavingStrength(false);
    }
  };

  const handleCancelStrength = () => {
    if (playerData?.strengths) {
      setStrengthDraft({ ...playerData.strengths });
    }
    setIsStrengthDirty(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-normal">Strength</h2>
        {isStrengthDirty && (
          <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">
            Unsaved Changes
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        {STRENGTH_KEYS.map(({ key, label }) => {
          const value = strengthDraft[key] ?? 50;
          return (
            <div
              key={key}
              className="grid grid-cols-[80px_1fr_auto] items-center gap-2 p-2 bg-[#1a1a1a]/50 border border-border/50 rounded-lg group hover:bg-[#1a1a1a]/80 transition-colors"
            >
              <div className="truncate">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
                  {label}
                </p>
              </div>
              <div className="min-w-0 translate-y-1.25">
                {canEditEvaluation ? (
                  <div className="relative flex items-center h-2 group">
                    <div className="w-full h-1.5 bg-[#333] rounded-full overflow-hidden relative">
                      <div
                        className={cn(
                          "h-full transition-all duration-300 ease-out",
                          getIndicatorColor(value)
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={Math.max(1, Math.min(99, value))}
                      onChange={(e) =>
                        handleStrengthChange(key, parseInt(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, ${getHexColor(
                          value
                        )} ${value}%, #333 ${value}%)`,
                      }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all absolute inset-0 z-10 opacity-0 group-hover:opacity-100 accent-primary"
                    />
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={Math.max(1, Math.min(99, value))}
                      onChange={(e) =>
                        handleStrengthChange(key, parseInt(e.target.value))
                      }
                      className="w-full h-6 opacity-0 cursor-pointer absolute inset-0 z-20"
                    />
                  </div>
                ) : (
                  <Progress
                    value={value}
                    className="h-1.5"
                    style={{ backgroundColor: "#333" }}
                    indicatorClassName={getIndicatorColor(value)}
                  />
                )}
              </div>
              <div className="flex justify-end">
                <CMSField
                  value={value}
                  onUpdate={(val) =>
                    handleStrengthChange(key, parseInt(String(val)))
                  }
                  canEdit={canEditEvaluation}
                  type="number"
                  min={1}
                  max={99}
                  editTrigger="doubleClick"
                  className="font-bold text-xs justify-end"
                  style={{ color: getHexColor(value) }}
                  inputClassName="text-right h-7 w-16 bg-gray-900 border-primary/50 focus:border-primary transition-all px-2 rounded-md"
                  hideIcon={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Changes button appears only when changed */}
      {isStrengthDirty && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2.5 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={handleCancelStrength}
            disabled={isSavingStrength}
            className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-xs text-gray-300 font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveStrength}
            disabled={isSavingStrength}
            className="px-4 py-1.5 rounded-lg bg-[#E31B23] hover:bg-[#C2181F] text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-900/20"
          >
            {isSavingStrength ? (
              <>
                <IconLoader2 className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
