/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Image from "next/image";
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
import { ALL_STYLES, STYLE_ICONS } from "./bioConstants";

interface PlayerStylesSectionProps {
  playerData: any;
  handleUpdate: (field: string, value: any) => void;
  canEditBio: boolean;
}

export const PlayerStylesSection = ({
  playerData,
  handleUpdate,
  canEditBio,
}: PlayerStylesSectionProps) => {
  const toggleStyle = (id: string) => {
    const currentStyles = playerData?.selectedStyleIds || [];
    if (currentStyles.includes(id)) {
      handleUpdate(
        "selectedStyleIds",
        currentStyles.filter((styleId: any) => styleId !== id)
      );
    } else if (currentStyles.length < 4) {
      handleUpdate("selectedStyleIds", [...currentStyles, id]);
    }
  };

  const orderedSelectedStyles = (playerData?.selectedStyleIds || [])
    .map((item: any) => {
      if (!item) return null;
      if (typeof item === "object" && item.id) {
        const found = ALL_STYLES.find((s: any) => s.id === item.id);
        return found || { id: item.id, label: item.label || item.name || item.id };
      }
      const str = String(item).trim();
      const normalizedId = str.toLowerCase().replace(/\s+/g, "-");
      const found = ALL_STYLES.find(
        (s: any) =>
          s.id === str ||
          s.id === normalizedId ||
          s.label.toLowerCase() === str.toLowerCase()
      );
      return found || { id: normalizedId, label: str };
    })
    .filter((s: any): s is { id: string; label: string } => Boolean(s && s.id));

  return (
    <div className="w-full space-y-4 sm:space-y-6 min-w-0 px-2 sm:px-0">
      <div className="text-center w-full min-w-0">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 w-full min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold font-heading truncate">
            Player Style
          </h3>
          {canEditBio && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7 text-primary hover:bg-primary/10 shrink-0 cursor-pointer"
                >
                  <PencilIcon className="size-3 sm:size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-cardBg border-border text-foreground w-[95vw] sm:w-125 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Player Styles (Max 4)</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-4">
                  {ALL_STYLES.map((style) => (
                    <div
                      key={style.id}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={style.id}
                        checked={(playerData?.selectedStyleIds || []).includes(
                          style.id
                        )}
                        onCheckedChange={() => toggleStyle(style.id)}
                        disabled={
                          !(playerData?.selectedStyleIds || []).includes(
                            style.id
                          ) && (playerData?.selectedStyleIds || []).length >= 4
                        }
                      />
                      <Label
                        htmlFor={style.id}
                        className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-4 w-full min-w-0">
          {orderedSelectedStyles.map((style: any) => {
            if (!style || !style.id) return null;
            const badge = STYLE_ICONS[style.id];
            const badgeSrc =
              typeof badge === "string" ? badge : badge?.src || "";
            return (
              <div
                key={style.id}
                className="space-y-2 sm:space-y-4 w-full min-w-0"
              >
                <div className="flex justify-center">
                  {badgeSrc ? (
                    <Image
                      src={badgeSrc}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
                      alt={style.label}
                      width={200}
                      height={200}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.srcset = "";
                        target.src = "/placeholder_img.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs">
                      {style.label}
                    </div>
                  )}
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
  );
};
