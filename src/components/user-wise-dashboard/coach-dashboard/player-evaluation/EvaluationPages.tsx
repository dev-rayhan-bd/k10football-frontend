"use client";

import Image from "next/image";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { resolveChatMediaUrl } from "@/components/chat/ChatAvatar";
import {
  EVALUATION_GRADES,
  EVALUATION_SKILLS,
  type EvaluationGrade,
  type EvaluationGradeMap,
  type EvaluationSkillGroup,
} from "@/types/evaluation.type";
import { GradeColumnHeaders, GradeDots } from "./GradeDots";
import { display, GRADE_COLORS, GRADE_LEGEND_LABELS, PLAYER_PLACEHOLDER_IMG, toGrade } from "./utils";

/** DOM ids captured by generateEvaluationPdf (only one sheet/report is on screen at a time). */
export const EVALUATION_PAGE_IDS: [string, string] = ["evaluation-report-page-1", "evaluation-report-page-2"];

const GROUP_TITLES: Record<EvaluationSkillGroup, string> = {
  techniques: "Techniques",
  characteristics: "Characteristics",
  physical: "Physical",
};
export const EVALUATION_GROUPS = Object.keys(EVALUATION_SKILLS) as EvaluationSkillGroup[];

export type GradeSheet = Record<EvaluationSkillGroup, EvaluationGradeMap>;

interface InfoItem {
  label: string;
  value: unknown;
  accent?: boolean;
}

interface EvaluationPagesProps {
  date?: string | null;
  subtitle?: string | null;
  playerName?: string | null;
  avatar?: string | null;
  /** Player Name / Age / Centre-style row under the title. */
  infoItems: InfoItem[];
  /** Optional second row (ratings, grade, next due…). */
  scoreItems?: InfoItem[];
  grades: Partial<GradeSheet>;
  /** Pass to make the dots clickable (coach grading). Omit for the read-only report. */
  onGrade?: (group: EvaluationSkillGroup, key: string, grade: EvaluationGrade) => void;
  coachFeedback?: string | null;
  onCoachFeedbackChange?: (value: string) => void;
  notes?: string | null;
  onNotesChange?: (value: string) => void;
}

const PageHeader = ({ date }: { date?: string | null }) => (
  <div className="relative z-10 flex w-full items-center justify-between">
    <div className="flex items-center">
      <Image src={logo} alt="K10 Football Logo" className="h-10 w-auto" />
    </div>
    <div className="font-mono text-xs font-bold text-gray-500">Date: {display(date)}</div>
  </div>
);

const InfoRow = ({ items, className }: { items: InfoItem[]; className?: string }) => (
  <div className={className}>
    {items.map((item) => (
      <div key={item.label} className="min-w-0">
        <span className="block text-[9px] font-black uppercase tracking-wider text-gray-400">{item.label}</span>
        <span className={item.accent ? "text-base font-extrabold text-[#E31B23]" : "text-base font-extrabold text-gray-900"}>
          {display(item.value)}
        </span>
      </div>
    ))}
  </div>
);

/** The white two-page "Player Development Programme" sheet (screen + PDF). */
export const EvaluationPages = ({
  date,
  subtitle,
  playerName,
  avatar,
  infoItems,
  scoreItems,
  grades,
  onGrade,
  coachFeedback,
  onCoachFeedbackChange,
  notes,
  onNotesChange,
}: EvaluationPagesProps) => {
  const [failedImgSrc, setFailedImgSrc] = useState<string | null>(null);

  // Relative upload paths live on the API host; a missing/broken file falls back to the placeholder.
  const resolvedImg = resolveChatMediaUrl(avatar);
  const imgSrc = resolvedImg && failedImgSrc !== resolvedImg ? resolvedImg : PLAYER_PLACEHOLDER_IMG;
  const isEditable = Boolean(onGrade);

  return (
    <div className="flex w-full flex-col items-center gap-8 pb-4">
      {/* Printable Page 1 */}
      <div
        id={EVALUATION_PAGE_IDS[0]}
        className="relative flex min-h-150 w-full max-w-282.5 select-none flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-black sm:p-12 lg:h-200"
      >
        <PageHeader date={date} />

        <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center py-6">
          <div className="relative z-20 flex flex-col gap-2 text-center sm:text-left">
            <h1 className="font-heading text-3xl font-black uppercase leading-none tracking-tighter text-gray-900 sm:text-4xl">
              PLAYER <span className="text-[#E31B23]">DEVELOPMENT</span> PROGRAMME
            </h1>
            {subtitle && (
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 sm:text-[11px]">{subtitle}</p>
            )}
          </div>

          <InfoRow
            items={infoItems}
            className="relative z-20 mx-auto mt-6 flex max-w-125 flex-col gap-4 border-b border-t border-gray-100 py-4 text-center text-gray-800 sm:mx-0 sm:flex-row sm:flex-wrap sm:gap-8 sm:text-left"
          />
          {scoreItems && scoreItems.length > 0 && (
            <InfoRow
              items={scoreItems}
              className="relative z-20 mx-auto mt-4 grid max-w-125 grid-cols-3 gap-4 text-center sm:mx-0 sm:text-left"
            />
          )}

          <div className="relative z-20 mt-8 flex flex-col gap-3">
            <h3 className="text-center text-xs font-black uppercase tracking-widest text-gray-900 sm:text-left">Key:</h3>
            <div className="flex flex-col gap-3">
              {EVALUATION_GRADES.map((grade) => (
                <div key={grade} className="flex items-center gap-3">
                  <div className="size-4 rounded-full shadow-md" style={{ backgroundColor: GRADE_COLORS[grade].on }} />
                  <span className="text-sm font-extrabold text-gray-700">{GRADE_LEGEND_LABELS[grade]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Player Cut-out Image */}
        <div className="pointer-events-none relative bottom-0 right-0 z-0 mt-8 flex h-96 w-full items-end justify-center sm:absolute sm:mt-0 sm:h-[80%] sm:w-[50%] sm:justify-end">
          <Image
            src={imgSrc}
            alt={playerName || "Player"}
            className="relative z-10 h-full w-auto max-w-full object-contain object-bottom"
            width={500}
            height={500}
            onError={() => setFailedImgSrc(imgSrc)}
          />
        </div>
      </div>

      {/* Printable Page 2 */}
      <div
        id={EVALUATION_PAGE_IDS[1]}
        className="relative flex w-full max-w-282.5 flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-black sm:p-8 lg:min-h-200"
      >
        <PageHeader date={date} />

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-2">
          {EVALUATION_GROUPS.map((group) => {
            const skills = EVALUATION_SKILLS[group];
            const half = Math.ceil(skills.length / 2);
            const columns = [skills.slice(0, half), skills.slice(half)];
            const groupGrades = grades[group] ?? {};
            return (
              <div key={group} className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4">
                <h3 className="border-b pb-1 text-sm font-black uppercase tracking-wide text-gray-900">{GROUP_TITLES[group]}</h3>
                <div className="grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-2 lg:gap-y-0">
                  {columns.map((column, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between pb-1 text-[7px] font-black uppercase tracking-wider text-gray-400">
                        <span>Skill</span>
                        <GradeColumnHeaders className="text-gray-400" />
                      </div>
                      {column.map((skill) => (
                        <div key={skill.key} className="flex items-center justify-between border-b border-gray-50 py-0.5 last:border-0">
                          <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                          <GradeDots
                            value={toGrade(groupGrades[skill.key])}
                            skillLabel={skill.label}
                            onChange={onGrade ? (grade) => onGrade(group, skill.key, grade) : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4">
            <h3 className="border-b pb-1 text-sm font-black uppercase tracking-wide text-gray-900">Coach Feedback</h3>
            {onCoachFeedbackChange ? (
              <textarea
                value={coachFeedback ?? ""}
                onChange={(e) => onCoachFeedbackChange(e.target.value)}
                rows={3}
                placeholder="Strengths, areas to work on, targets for the next cycle..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white p-2 text-xs font-semibold text-gray-700 placeholder:text-gray-400 focus:border-[#E31B23]/50 focus:outline-none"
              />
            ) : (
              <p className="whitespace-pre-line text-xs font-semibold text-gray-700">{display(coachFeedback)}</p>
            )}
            {isEditable && onNotesChange && (
              <textarea
                value={notes ?? ""}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={2}
                placeholder="Notes (optional)"
                className="w-full resize-none rounded-lg border border-gray-200 bg-white p-2 text-xs font-semibold text-gray-700 placeholder:text-gray-400 focus:border-[#E31B23]/50 focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
