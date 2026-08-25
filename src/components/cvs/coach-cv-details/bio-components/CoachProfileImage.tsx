/* eslint-disable @typescript-eslint/no-explicit-any */
import badge1 from "@/assets/cvs/id/coach-badge1.png";
import badge2 from "@/assets/cvs/id/coach-badge2.png";
import iconAttackMinded from "@/assets/cvs/id/coach-styles-icons/attack minded.png";
import iconCounterAttack from "@/assets/cvs/id/coach-styles-icons/counter-attack.png";
import iconDisciplinarian from "@/assets/cvs/id/coach-styles-icons/disciplainarian.png";
import iconGegenpressing from "@/assets/cvs/id/coach-styles-icons/gegenpressing.png";
import iconHolistic from "@/assets/cvs/id/coach-styles-icons/holistic.png";
import iconMotivator from "@/assets/cvs/id/coach-styles-icons/motivator.png";
import iconParkTheBus from "@/assets/cvs/id/coach-styles-icons/park the bus.png";
import iconPlayerCentric from "@/assets/cvs/id/coach-styles-icons/player-centric.png";
import iconSetPieceSpecialist from "@/assets/cvs/id/coach-styles-icons/set-piece specialist.png";
import iconTikiTaka from "@/assets/cvs/id/coach-styles-icons/tiki-taka.png";
import iconYouthDevelopment from "@/assets/cvs/id/coach-styles-icons/youth development.png";
import Image from "next/image";
import { useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CMSField from "@/components/shared/CMSField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PencilIcon } from "lucide-react";
import { useCoach } from "@/lib/hooks/useCoach";
import { ALL_COACH_STYLES, COACH_TYPES } from "./constants";
import { getFlagUrl, handleImageUpload } from "./utils";

const COACH_STYLE_ICONS: Record<string, { src: string }> = {
  "tiki-taka": iconTikiTaka,
  "gegenpressing": iconGegenpressing,
  "counter-attack": iconCounterAttack,
  "park-the-bus": iconParkTheBus,
  "motivator": iconMotivator,
  "disciplinarian": iconDisciplinarian,
  "holistic": iconHolistic,
  "player-centric": iconPlayerCentric,
  "youth-development": iconYouthDevelopment,
  "set-piece-specialist": iconSetPieceSpecialist,
  "defensive-solid": badge1,
  "attack-minded": iconAttackMinded,
};

const EditableImage = ({
  src,
  alt,
  className,
  field,
  width,
  height,
  fill,
  canEdit,
  handleUpdate,
}: {
  src: any;
  alt: string;
  className?: string;
  field: string;
  width?: number;
  height?: number;
  fill?: boolean;
  canEdit: boolean;
  handleUpdate: (field: string, value: any) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "relative group w-full h-full",
        canEdit ? "cursor-pointer" : ""
      )}
      onClick={() => canEdit && fileInputRef.current?.click()}
    >
      <Image
        src={src}
        alt={alt}
        className={className}
        {...(!fill ? { width: width || 500, height: height || 500 } : { fill: true })}
      />
      {canEdit && (
        <>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
            <span className="text-[10px] text-white font-black uppercase tracking-widest">
              Click to Change
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, field, handleUpdate);
            }}
          />
        </>
      )}
    </div>
  );
};

export const CoachProfileImage = ({ canEdit }: { canEdit: boolean }) => {
  const { coachData, handleUpdate } = useCoach();

  const toggleStyle = (styleId: string) => {
    const currentStyles = coachData.selectedStyleIds || [];
    if (currentStyles.includes(styleId)) {
      handleUpdate(
        "selectedStyleIds",
        currentStyles.filter((id) => id !== styleId)
      );
    } else if (currentStyles.length < 4) {
      handleUpdate("selectedStyleIds", [...currentStyles, styleId]);
    } else {
      toast.error("Maximum 4 styles allowed");
    }
  };

  const orderedSelectedStyles = (coachData.selectedStyleIds || []).map(
    (id: string) => ALL_COACH_STYLES.find((s) => s.id === id)!
  ).filter(Boolean);

  return (
    <div className="col-span-12 order-2 xl:order-0 xl:col-span-4 flex flex-col items-center">
      {/* Player Name */}
      <div className="text-center mb-8">
        <div className="flex items-center mb-8 justify-center">
          <div className="relative w-32 h-20">
            <Image
              src={getFlagUrl(coachData.birthCountry)}
              alt="Birth Country"
              width={100}
              height={100}
              className="object-cover rounded shadow-lg border border-border"
            />
            {coachData.dualNationality && (
              <div className="absolute -bottom-2 -right-2 w-12 h-8 border-2 border-white rounded shadow-md overflow-hidden">
                <Image
                  src={getFlagUrl(coachData.dualNationality)}
                  alt="Dual Nationality"
                  layout="fill"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold font-heading mb-2 uppercase flex items-center justify-center gap-2">
          <CMSField
            value={coachData.fullName}
            onUpdate={(val) => handleUpdate("fullName", val)}
            canEdit={canEdit}
            className="text-2xl font-bold font-heading uppercase"
          />
          <span className="text-primary">[{coachData.age ? coachData.age.replace(/\D/g, "") : ""}]</span>
        </h1>
      </div>

      {/* Position Selector */}
      <div className="mb-8">
        <CMSField
          value={coachData.coachType}
          onUpdate={(val) => handleUpdate("coachType", String(val))}
          canEdit={canEdit}
          type="combobox"
          options={COACH_TYPES}
          className="flex items-center gap-2 border border-border px-4 py-2 rounded hover:bg-gray-900 bg-transparent text-foreground h-auto w-fit mx-auto"
        />
      </div>

      <div className="relative w-full h-75 sm:h-100 md:h-130.75 mb-6 sm:mb-8 flex items-end justify-center min-w-0 overflow-hidden">
        <EditableImage
          src={coachData.coachImage}
          alt={coachData.fullName}
          className="object-contain w-auto mx-auto h-70 sm:h-95 md:h-125 max-w-full"
          width={800}
          height={800}
          field="coachImage"
          canEdit={canEdit}
          handleUpdate={handleUpdate}
        />
      </div>

      {/* Coach Style Section */}
      <div className="w-full space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h3 className="text-2xl font-bold font-heading">
              Coach Style
            </h3>
            {canEdit && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-cardBg border-border text-foreground">
                  <DialogHeader>
                    <DialogTitle>Select Coach Styles (Max 4)</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    {ALL_COACH_STYLES.map((style) => (
                      <div
                        key={style.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={style.id}
                          checked={(coachData.selectedStyleIds || []).includes(
                            style.id
                          )}
                          onCheckedChange={() => toggleStyle(style.id)}
                          disabled={
                            !(coachData.selectedStyleIds || []).includes(
                              style.id
                            ) && (coachData.selectedStyleIds || []).length >= 4
                          }
                        />
                        <Label
                          htmlFor={style.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {style.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {orderedSelectedStyles.map((style: any) => {
              const icon = COACH_STYLE_ICONS[style.id];
              const iconSrc = icon ? icon.src : badge2.src;

              return (
                <div key={style.id} className="flex flex-col items-center justify-center gap-2">
                  <div className="flex justify-center shrink-0">
                    <Image
                      src={iconSrc}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
                      alt={style.label}
                      width={80}
                      height={80}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs md:text-sm font-heading text-white text-center uppercase tracking-widest leading-snug wrap-break-word">
                    {style.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
