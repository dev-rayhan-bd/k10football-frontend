/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import CMSField from "@/components/shared/CMSField";
import { useCoach } from "@/hooks/useCoach";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCOMPLISHMENT_ICONS, PREDEFINED_KEY_SKILLS } from "./constants";

export const CoachKeySkills = ({ canEdit }: { canEdit: boolean }) => {
  const { coachData, handleUpdate } = useCoach();
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [activeSkillIconIndex, setActiveSkillIconIndex] = useState<number | null>(null);

  return (
    <div className="p-6">
      <h2 className="text-lg text-center font-heading font-normal mb-4">
        Key Skills
      </h2>
      <div className="max-w-2xl">
        <div className="space-y-6">
          {coachData.keySkills.map((item: any, index: number) => {
            const IconComponent = ACCOMPLISHMENT_ICONS[item.icon || ""] || Trophy;
            return (
              <div
                key={index}
                className="flex gap-4 border border-white/10 rounded-xl p-3 relative group"
              >
                <div
                  className={cn(
                    "shrink-0 pt-1 text-white",
                    canEdit ? "cursor-pointer hover:text-primary transition-colors" : ""
                  )}
                  onClick={() => {
                    if (canEdit) {
                      setActiveSkillIconIndex(index);
                    }
                  }}
                >
                  <IconComponent className="w-5 h-5 text-white hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 pr-6">
                  <CMSField
                    value={item.text}
                    onUpdate={(val) => {
                      const newSkills = [...coachData.keySkills];
                      newSkills[index] = { ...newSkills[index], text: String(val) };
                      handleUpdate("keySkills", newSkills);
                    }}
                    canEdit={canEdit}
                    type="textarea"
                    className="text-white text-sm leading-relaxed"
                  />
                </div>
                {canEdit && (
                  <button
                    onClick={() => {
                      const newSkills = coachData.keySkills.filter((_, idx) => idx !== index);
                      handleUpdate("keySkills", newSkills);
                    }}
                    className="absolute right-3 top-3 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {canEdit && (
          <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
            <DialogTrigger asChild>
              <Button
 data-pdf-hide
                variant="outline"
                className="w-full mt-6 border-dashed border-white/20 hover:border-primary hover:bg-transparent text-gray-400 hover:text-white flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0D0D0D] border-white/20 text-white max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading uppercase italic">Select Skill</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {PREDEFINED_KEY_SKILLS.map((skill, idx) => {
                  const Icon = ACCOMPLISHMENT_ICONS[skill.icon] || Trophy;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const newSkill = {
                          id: Date.now() + idx,
                          text: skill.text,
                          icon: skill.icon,
                        };
                        handleUpdate("keySkills", [...coachData.keySkills, newSkill]);
                        setIsAddSkillOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all group"
                    >
                      <div className="shrink-0 p-2 rounded bg-white/5 group-hover:bg-primary/20 text-gray-400 group-hover:text-primary transition-all">
                        <Icon size={18} />
                      </div>
                      <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                        {skill.text}
                      </span>
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const newSkill = {
                      id: Date.now(),
                      text: "Double-click to edit custom skill.",
                      icon: "star",
                    };
                    handleUpdate("keySkills", [...coachData.keySkills, newSkill]);
                    setIsAddSkillOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 transition-all group text-gray-400 hover:text-white"
                >
                  <div className="shrink-0 p-2 rounded bg-white/5 text-gray-400 group-hover:text-primary">
                    <Plus size={18} />
                  </div>
                  <span className="text-xs">Add Custom Skill</span>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Icon Picker Dialog */}
      <Dialog
        open={activeSkillIconIndex !== null}
        onOpenChange={(open) => !open && setActiveSkillIconIndex(null)}
      >
        <DialogContent className="bg-[#0D0D0D] border-white/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase italic">Select Icon</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {Object.entries(ACCOMPLISHMENT_ICONS).map(([name, Icon]) => (
              <button
                key={name}
                onClick={() => {
                  if (activeSkillIconIndex !== null) {
                    const newSkills = [...coachData.keySkills];
                    newSkills[activeSkillIconIndex] = {
                      ...newSkills[activeSkillIconIndex],
                      icon: name,
                    };
                    handleUpdate("keySkills", newSkills);
                    setActiveSkillIconIndex(null);
                  }
                }}
                className="flex items-center justify-center p-3 rounded-lg border border-white/10 hover:border-primary hover:bg-white/5 text-gray-400 hover:text-white transition-all"
              >
                <Icon size={24} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
