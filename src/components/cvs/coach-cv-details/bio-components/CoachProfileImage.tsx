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
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";
import { smartRemoveBackground } from "@/lib/utils/backgroundRemoval";
import CMSField from "@/components/shared/CMSField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PencilIcon } from "lucide-react";
import { useCoach } from "@/hooks/useCoach";
import { ALL_COACH_STYLES, COACH_TYPES, coachStylesFromApi } from "./constants";

const MAX_COACH_STYLES = 4;
import { getDisplayAge, getFlagUrl, handleImageUpload } from "./utils";

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
  handleUpdate: (field: string, value: any, file?: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Processing image...");

  // Same flow as the player photo: strip the background in the browser, then
  // upload the transparent PNG.
  const onFileChange = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    const toastId = `img-upload-${field}`;
    try {
      let processedFile = file;
      if (field === "coachImage") {
        setUploadStatus("Removing background...");
        toast.loading("Removing background from coach photo...", { id: toastId });
        processedFile = await smartRemoveBackground(file, false, (percent, stage) => {
          const msg = `${stage} ${percent}%`;
          setUploadStatus(msg);
          toast.loading(msg, { id: toastId });
        });
        toast.dismiss(toastId);
      }
      await handleImageUpload(processedFile, field, handleUpdate);
    } catch (err) {
      console.error("Coach image upload error:", err);
      toast.error("Failed to remove background. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative group w-full h-full flex items-end justify-center",
        canEdit && !isUploading ? "cursor-pointer" : ""
      )}
      onClick={() => canEdit && !isUploading && fileInputRef.current?.click()}
    >
      {isUploading ? (
        <div className="w-full h-70 sm:h-95 md:h-125 bg-white/5 animate-pulse rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10">
          <IconLoader2 className="size-8 animate-spin text-[#E31B23]" />
          <span className="text-xs text-white/70 font-bold uppercase tracking-wider text-center px-4">
            {uploadStatus}
          </span>
        </div>
      ) : (
        <>
          {!isImgLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
              <IconLoader2 className="size-6 animate-spin text-white/30" />
            </div>
          )}
          <Image
            // Neutral placeholder when the coach hasn't uploaded a photo.
            src={src || "/profile_placeholder.png"}
            alt={alt || "Coach"}
            onLoad={() => setIsImgLoaded(true)}
            className={cn(className, !isImgLoaded && "opacity-0", "transition-opacity duration-300")}
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
                  e.target.value = "";
                  if (file) onFileChange(file);
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export const CoachProfileImage = ({ canEdit }: { canEdit: boolean }) => {
  const { coachData, handleUpdate } = useCoach();
  const displayAge = getDisplayAge(coachData.dob, coachData.age);

  const savedStyles = coachStylesFromApi(coachData.selectedStyleIds);

  // Same flow as the player's Player Style: ticking only edits a local draft;
  // "Save" sends the whole selection once.
  const [stylesOpen, setStylesOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(savedStyles);

  const handleStylesOpenChange = (next: boolean) => {
    if (next) setDraft(savedStyles);
    setStylesOpen(next);
  };

  const toggleStyle = (styleId: string) => {
    setDraft((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : prev.length < MAX_COACH_STYLES
          ? [...prev, styleId]
          : prev
    );
  };

  const isDraftChanged =
    draft.length !== savedStyles.length || draft.some((id, i) => id !== savedStyles[i]);

  const handleSaveStyles = () => {
    if (isDraftChanged) handleUpdate("selectedStyleIds", draft);
    setStylesOpen(false);
  };

  const orderedSelectedStyles = savedStyles
    .map((id) => ALL_COACH_STYLES.find((s) => s.id === id))
    .filter((s): s is { id: string; label: string } => Boolean(s));

  return (
    <div className="col-span-12 order-2 xl:order-0 xl:col-span-4 flex flex-col items-center">
      {/* Player Name */}
      <div className="text-center mb-8">
        <div className="flex items-center mb-8 justify-center">
          {coachData.birthCountry && getFlagUrl(coachData.birthCountry) ? (
            <div className="relative w-32 h-20">
              <Image
                src={getFlagUrl(coachData.birthCountry)}
                alt="Birth Country"
                width={100}
                height={100}
                className="object-cover rounded shadow-lg border border-border"
              />
              {coachData.dualNationality && getFlagUrl(coachData.dualNationality) ? (
                <div className="absolute -bottom-2 -right-2 w-12 h-8 border-2 border-white rounded shadow-md overflow-hidden">
                  <Image
                    src={getFlagUrl(coachData.dualNationality)}
                    alt="Dual Nationality"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-10 flex items-center justify-center">
              <span className="text-xs text-white/40 uppercase tracking-widest font-bold">
                {coachData.birthCountry || "No Country Selected"}
              </span>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold font-heading mb-2 uppercase flex items-center justify-center gap-2">
          <CMSField
            value={coachData.fullName}
            onUpdate={(val) => handleUpdate("fullName", val)}
            canEdit={canEdit}
            className="text-2xl font-bold font-heading uppercase"
          />
          {/* Age (not editable — it comes from the date of birth). Hidden when unknown. */}
          {displayAge && <span className="text-primary">[{displayAge}]</span>}
        </h1>
      </div>

      {/* Position Selector */}
      <div className="mb-8">
        <CMSField
          value={coachData.title || coachData.coachType || "Head Coach"}
          onUpdate={(val) => {
            handleUpdate("title", String(val));
            handleUpdate("coachType", String(val));
          }}
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

      {/* Coach Style Section — mirrors the player's Player Style section */}
      <div className="w-full min-w-0 px-2 sm:px-0">
        <div className="text-center w-full min-w-0">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 w-full min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold font-heading truncate">
              Coach Style
            </h3>
            {canEdit && (
              <Dialog open={stylesOpen} onOpenChange={handleStylesOpenChange}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 sm:size-7 text-primary hover:bg-primary/10 shrink-0 cursor-pointer"
                  >
                    <PencilIcon className="size-3 sm:size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-cardBg border-border text-foreground w-[95vw] sm:w-125 max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Coach Styles (Max {MAX_COACH_STYLES})</DialogTitle>
                    <DialogDescription>
                      {draft.length}/{MAX_COACH_STYLES} selected
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4">
                    {ALL_COACH_STYLES.map((style) => {
                      const checked = draft.includes(style.id);
                      const disabled = !checked && draft.length >= MAX_COACH_STYLES;
                      return (
                        <div key={style.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`coach-style-${style.id}`}
                            checked={checked}
                            onCheckedChange={() => toggleStyle(style.id)}
                            disabled={disabled}
                            className="border-muted-foreground"
                          />
                          <Label
                            htmlFor={`coach-style-${style.id}`}
                            className={cn(
                              "text-xs sm:text-sm font-medium leading-none cursor-pointer",
                              disabled && "cursor-not-allowed opacity-50"
                            )}
                          >
                            {style.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setStylesOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveStyles} disabled={!isDraftChanged}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-4 w-full min-w-0">
            {orderedSelectedStyles.map((style) => {
              const icon = COACH_STYLE_ICONS[style.id];
              const iconSrc = icon ? icon.src : badge2.src;

              return (
                <div key={style.id} className="flex flex-col gap-2 sm:gap-4 w-full min-w-0">
                  <div className="flex justify-center">
                    <Image
                      src={iconSrc}
                      className="size-16 sm:size-20 object-contain drop-shadow-md"
                      alt={style.label}
                      width={200}
                      height={200}
                    />
                  </div>
                  <p className="text-xs sm:text-base md:text-lg font-heading truncate w-full px-1">
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
