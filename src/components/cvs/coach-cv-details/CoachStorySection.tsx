/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import CMSField from "@/components/shared/CMSField";
import { useCoach } from "@/hooks/useCoach";

const DEFAULT_COACH_STORY = `Dedicated professional football coach with extensive experience in developing tactical discipline, technical prowess, and mental resilience in modern footballers.

Focuses on structured positional play, high-intensity transition phases, and individualized technical development.

Committed to continuous learning and implementing data-driven performance analytics to elevate team performance and individual player trajectories.`;

interface CoachStorySectionProps {
  editable?: boolean;
  coachId?: string;
}

export const CoachStorySection = ({
  editable = false,
  coachId,
}: CoachStorySectionProps) => {
  const { cvData, coachData, isViewingSpecificCoach, handleUpdate, updateCoachProfile } =
    useCoach(coachId);

  const initialText =
    (cvData as any)?.additionalNotes ||
    (cvData as any)?.story ||
    (cvData as any)?.coachingPhilosophy ||
    (coachData as any)?.additionalNotes ||
    (coachData as any)?.story ||
    DEFAULT_COACH_STORY;

  const [story, setStory] = useState(initialText);

  useEffect(() => {
    const updated =
      (cvData as any)?.additionalNotes ||
      (cvData as any)?.story ||
      (cvData as any)?.coachingPhilosophy ||
      (coachData as any)?.additionalNotes ||
      (coachData as any)?.story;
    if (updated) {
      setStory(updated);
    }
  }, [cvData, coachData]);

  const canEdit = editable && !isViewingSpecificCoach;

  const handleSave = async (val: string) => {
    setStory(val);
    try {
      if (typeof handleUpdate === "function") {
        await handleUpdate("additionalNotes", val);
      } else if (typeof updateCoachProfile === "function") {
        await updateCoachProfile({ additionalNotes: val } as any);
      }
    } catch (err) {
      console.error("Failed to update coach story/notes:", err);
    }
  };

  return (
    <div className="mt-10 sm:mt-20 w-full min-w-0 overflow-hidden">
      <div className="container bg-cardBg p-4 sm:p-8 rounded-xl w-full min-w-0">
        <div className="flex items-center justify-between w-full min-w-0">
          <h4 className="text-lg sm:text-xl text-primary lg:text-2xl mb-4 sm:mb-5 truncate">
            Coaching Philosophy & Story
          </h4>
        </div>
        <div className="space-y-4 sm:space-y-5 w-full min-w-0">
          <CMSField
            value={story}
            onUpdate={(val) => handleSave(String(val))}
            canEdit={canEdit}
            type="textarea"
            showEmojis={true}
            className="whitespace-pre-wrap leading-relaxed w-full min-w-0 wrap-break-word text-white/90"
            inputClassName="w-full min-w-0 break-words"
          />
        </div>
      </div>
    </div>
  );
};

export default CoachStorySection;
