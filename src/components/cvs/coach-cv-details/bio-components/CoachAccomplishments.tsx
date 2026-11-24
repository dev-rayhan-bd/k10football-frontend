/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useCoach } from "@/hooks/useCoach";
import CMSField from "@/components/shared/CMSField";
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
import { ACCOMPLISHMENT_ICONS, PREDEFINED_ACCOMPLISHMENTS } from "./constants";
import { IconTrophy } from "@tabler/icons-react";

export const CoachAccomplishments = ({ canEdit }: { canEdit: boolean }) => {
  const { coachData, handleUpdate } = useCoach();
  const [isAddAccOpen, setIsAddAccOpen] = useState(false);
  const [activeIconIndex, setActiveIconIndex] = useState<number | null>(null);

  return (
    <>
      <div className="p-6 order-5 xl:order-1">
        <h2 className="text-lg text-center font-heading font-normal mb-4">
          Key Accomplishments
        </h2>
        <div className="max-w-2xl">
          <div className="space-y-6">
            {coachData.qualifications.map((item: any, index: number) => {
              const IconComponent = ACCOMPLISHMENT_ICONS[item.icon || ""] || Trophy;
              return (
                <div
                  key={index}
                  className="flex gap-4 border border-white/10 rounded-xl p-3 relative group w-full overflow-hidden"
                >
                  <div
                    className={cn(
                      "shrink-0 pt-1 text-white",
                      canEdit ? "cursor-pointer hover:text-primary transition-colors" : ""
                    )}
                    onClick={() => {
                      if (canEdit) {
                        setActiveIconIndex(index);
                      }
                    }}
                  >
                    <IconComponent className="w-5 h-5 text-white hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 pr-6 min-w-0">
                    <CMSField
                      value={item.text}
                      onUpdate={(val) => {
                        const newQuals = [...coachData.qualifications];
                        newQuals[index] = { ...newQuals[index], text: String(val) };
                        handleUpdate("qualifications", newQuals);
                      }}
                      canEdit={canEdit}
                      type="textarea"
                      className="text-white text-sm leading-relaxed w-full wrap-break-word"
                    />
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => {
                        const newQuals = coachData.qualifications.filter((_, idx) => idx !== index);
                        handleUpdate("qualifications", newQuals);
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
            <Dialog open={isAddAccOpen} onOpenChange={setIsAddAccOpen}>
              <DialogTrigger asChild>
                <Button
 data-pdf-hide
                  variant="outline"
                  className="w-full mt-6 border-dashed border-white/20 hover:border-primary hover:bg-transparent text-gray-400 hover:text-white flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Accomplishment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0D0D0D] border-white/20 text-white max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading uppercase italic">
                    Select Accomplishment
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-2 mt-4">
                  {PREDEFINED_ACCOMPLISHMENTS.map((acc, idx) => {
                    const Icon = ACCOMPLISHMENT_ICONS[acc.icon] || Trophy;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          const newAcc = {
                            id: Date.now() + idx,
                            text: acc.text,
                            icon: acc.icon,
                          };
                          handleUpdate("qualifications", [...coachData.qualifications, newAcc]);
                          setIsAddAccOpen(false);
                        }}
                        className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all group"
                      >
                        <div className="shrink-0 p-2 rounded bg-white/5 group-hover:bg-primary/20 text-gray-400 group-hover:text-primary transition-all">
                          <Icon size={18} />
                        </div>
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                          {acc.text}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      const newAcc = {
                        id: Date.now(),
                        text: "Double-click to edit accomplishment details.",
                        icon: "trophy",
                      };
                      handleUpdate("qualifications", [...coachData.qualifications, newAcc]);
                      setIsAddAccOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 transition-all group text-gray-400 hover:text-white"
                  >
                    <div className="shrink-0 p-2 rounded bg-white/5 text-gray-400 group-hover:text-primary">
                      <Plus size={18} />
                    </div>
                    <span className="text-xs">Add Custom Accomplishment</span>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Icon Picker Dialog */}
        <Dialog
          open={activeIconIndex !== null}
          onOpenChange={(open) => !open && setActiveIconIndex(null)}
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
                    if (activeIconIndex !== null) {
                      const newQuals = [...coachData.qualifications];
                      newQuals[activeIconIndex] = {
                        ...newQuals[activeIconIndex],
                        icon: name,
                      };
                      handleUpdate("qualifications", newQuals);
                      setActiveIconIndex(null);
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

      {/* MAJOR TROPHIES */}
      <div className="p-6 order-6 xl:order-3">
        <h2 className="text-lg text-center font-heading font-normal mb-4">
          MAJOR TROPHIES
        </h2>
        <div className="">
          <div className="space-y-4">
            {coachData.majorTrophies.map((tournament: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-1 sm:px-4 border-b border-slate-800 gap-2 min-w-0"
              >
                <CMSField
                  value={tournament.name}
                  onUpdate={(val) => {
                    const newTrophies = [...coachData.majorTrophies];
                    newTrophies[index] = { ...newTrophies[index], name: String(val) };
                    handleUpdate("majorTrophies", newTrophies);
                  }}
                  canEdit={canEdit}
                  className="text-white text-[10px] sm:text-[12px] font-medium tracking-wide flex-1 min-w-0 truncate"
                />
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <CMSField
                    value={tournament.count}
                    onUpdate={(val) => {
                      const newTrophies = [...coachData.majorTrophies];
                      newTrophies[index] = { ...newTrophies[index], count: Number(val) };
                      handleUpdate("majorTrophies", newTrophies);
                    }}
                    canEdit={canEdit}
                    isNumeric
                    className="text-white text-sm font-semibold w-8 sm:w-12 justify-center"
                    inputClassName="text-center"
                  />
                  <div className="shrink-0">
                    <IconTrophy />
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => {
                        const newTrophies = coachData.majorTrophies.filter((_, idx) => idx !== index);
                        handleUpdate("majorTrophies", newTrophies);
                      }}
                      className="text-gray-500 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {canEdit && (
              <Button
 data-pdf-hide
                variant="outline"
                onClick={() => {
                  const newTrophy = {
                    name: "NEW TOURNAMENT CHAMPIONSHIP",
                    count: 1
                  };
                  handleUpdate("majorTrophies", [...coachData.majorTrophies, newTrophy]);
                }}
                className="w-full mt-4 border-dashed border-white/20 hover:border-primary hover:bg-transparent text-gray-400 hover:text-white flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Trophy
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
