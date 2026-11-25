"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVALUATION_GRADES, type EvaluationGrade } from "@/types/evaluation.type";
import { GRADE_COLORS, GRADE_LABELS } from "./utils";

interface GradeDotsProps {
  value?: EvaluationGrade | null;
  /** Omit for a read-only display (printable report). */
  onChange?: (grade: EvaluationGrade) => void;
  skillLabel?: string;
}

/** Improvement (blue) / Good (yellow) / Excellent (green) dots. Nothing selected by default. */
export const GradeDots = ({ value, onChange, skillLabel }: GradeDotsProps) => (
  <div className="flex w-45 justify-between gap-2" role={onChange ? "radiogroup" : undefined} aria-label={skillLabel}>
    {EVALUATION_GRADES.map((grade) => {
      const selected = value === grade;
      const dotStyle = { backgroundColor: selected ? GRADE_COLORS[grade].on : GRADE_COLORS[grade].off };
      return (
        <div key={grade} className="flex w-14 justify-center">
          {onChange ? (
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${skillLabel ?? "Skill"}: ${GRADE_LABELS[grade]}`}
              onClick={() => onChange(grade)}
              className={cn(
                "flex size-5 cursor-pointer items-center justify-center rounded-full border border-transparent shadow-sm transition-all duration-200 hover:scale-110",
                selected && "ring-2 ring-white/30"
              )}
              style={dotStyle}
            >
              {selected && <Check className="size-3 stroke-[3px] text-white" />}
            </button>
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full shadow-sm" style={dotStyle}>
              {selected && <Check className="size-3 stroke-[3px] text-white" />}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export const GradeColumnHeaders = ({ className }: { className?: string }) => (
  <div className={cn("flex w-45 justify-between gap-2 text-center", className)}>
    {EVALUATION_GRADES.map((grade) => (
      <span key={grade} className="w-14 text-[8px] font-black uppercase tracking-wider">
        {GRADE_LABELS[grade]}
      </span>
    ))}
  </div>
);
