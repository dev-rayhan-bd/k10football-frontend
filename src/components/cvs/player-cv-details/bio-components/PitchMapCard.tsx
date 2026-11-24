/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import positionMap from "@/assets/cvs/id/position-map.png";
import futsalPitch from "@/assets/cvs/id/Futsal Pitch.jpg";
import positionIcon from "@/assets/cvs/id/positionIcon.png";
import { cn } from "@/lib/utils";
import {
  buildPitchMarkers,
  pitchSlotLabel,
  toPitchMapPayload,
  type PitchMarker,
} from "./bioConstants";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { updatePlayerField } from "@/redux/features/player/playerSlice";
import { useUpdateMyPlayerProfileMutation } from "@/redux/features/player/playerApi";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface PitchMapCardProps {
  playerData: any;
  handleUpdate?: (field: string, value: any) => void;
  canEditBio?: boolean;
}

export const PitchMapCard = ({
  playerData,
  canEditBio = true,
}: PitchMapCardProps) => {
  const dispatch = useAppDispatch();
  const [updateMyPlayerProfile] = useUpdateMyPlayerProfileMutation();

  const [isPositionMap, setIsPositionMap] = useState(true);
  const [activeMarker, setActiveMarker] = useState<{
    id: string;
    type: "position" | "futsal";
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPositionDirty, setIsPositionDirty] = useState(false);
  const [isFutsalDirty, setIsFutsalDirty] = useState(false);

  // Each map always has 6 markers: 3 attacking + 3 defending.
  const playerPosition: string = playerData?.position || "";
  const savedPositionMarkers = () => buildPitchMarkers(playerData?.positionMarkers, playerPosition, false);
  const savedFutsalMarkers = () => buildPitchMarkers(playerData?.futsalMarkers, playerPosition, true);

  const [positionMarkers, setPositionMarkers] = useState<PitchMarker[]>(savedPositionMarkers);
  const [futsalMarkers, setFutsalMarkers] = useState<PitchMarker[]>(savedFutsalMarkers);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const prevPositionRef = useRef<string>("");

  // Auto-switch maps when position changes
  useEffect(() => {
    if (!playerData || !playerData.position) return;
    const cleanPos = playerData.position.toLowerCase();
    const shouldBeFutsal =
      cleanPos.includes("goalkeeper") ||
      cleanPos.includes("fixo") ||
      cleanPos.includes("alas") ||
      cleanPos.includes("pivot");

    // Only auto-switch the map if the position itself has changed
    if (playerData.position !== prevPositionRef.current) {
      setIsPositionMap(!shouldBeFutsal);
      prevPositionRef.current = playerData.position;
    }
  }, [playerData.position]);

  // Sync with playerData from API if user hasn't made unsaved changes
  useEffect(() => {
    if (!isPositionDirty) setPositionMarkers(savedPositionMarkers());
  }, [playerData?.positionMarkers, playerPosition, isPositionDirty]);

  useEffect(() => {
    if (!isFutsalDirty) setFutsalMarkers(savedFutsalMarkers());
  }, [playerData?.futsalMarkers, playerPosition, isFutsalDirty]);

  const updateMarkerPosition = (
    e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent
  ) => {
    if (!activeMarker || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();

    let clientX: number | undefined;
    let clientY: number | undefined;
    if ("touches" in e) {
      clientX = e.touches[0]?.clientX;
      clientY = e.touches[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    // Constrain to bounds
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    if (activeMarker.type === "position") {
      setPositionMarkers((prev) =>
        prev.map((m) => (m.id === activeMarker.id ? { ...m, x, y } : m))
      );
      setIsPositionDirty(true);
    } else {
      setFutsalMarkers((prev) =>
        prev.map((m) => (m.id === activeMarker.id ? { ...m, x, y } : m))
      );
      setIsFutsalDirty(true);
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (activeMarker) {
        if ("touches" in e && e.cancelable) {
          e.preventDefault();
        }
        updateMarkerPosition(e);
      }
    };
    const handleGlobalEnd = () => {
      setActiveMarker(null);
    };

    if (activeMarker) {
      window.addEventListener("mousemove", handleGlobalMove);
      window.addEventListener("mouseup", handleGlobalEnd);
      window.addEventListener("touchmove", handleGlobalMove, { passive: false });
      window.addEventListener("touchend", handleGlobalEnd);
      window.addEventListener("touchcancel", handleGlobalEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalMove);
      window.removeEventListener("touchend", handleGlobalEnd);
      window.removeEventListener("touchcancel", handleGlobalEnd);
    };
  }, [activeMarker]);

  const isDirty = isPositionMap ? isPositionDirty : isFutsalDirty;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (isPositionMap) {
        const positionMap = toPitchMapPayload(positionMarkers, playerPosition);
        await updateMyPlayerProfile({ positionMap }).unwrap();
        dispatch(updatePlayerField({ field: "positionMarkers", value: positionMap.map((m, i) => ({ id: positionMarkers[i].id, ...m })) }));
        setIsPositionDirty(false);
        toast.success("Position map saved successfully!");
      } else {
        const futsalMap = toPitchMapPayload(futsalMarkers, playerPosition);
        await updateMyPlayerProfile({ futsalMap }).unwrap();
        dispatch(updatePlayerField({ field: "futsalMarkers", value: futsalMap.map((m, i) => ({ id: futsalMarkers[i].id, ...m })) }));
        setIsFutsalDirty(false);
        toast.success("Futsal map saved successfully!");
      }
    } catch (err: any) {
      console.error("Failed to save map markers:", err);
      toast.error(err?.data?.message || "Failed to save position map. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isPositionMap) {
      setPositionMarkers(savedPositionMarkers());
      setIsPositionDirty(false);
    } else {
      setFutsalMarkers(savedFutsalMarkers());
      setIsFutsalDirty(false);
    }
  };

  const currentDisplayMarkers = isPositionMap ? positionMarkers : futsalMarkers;

  return (
    <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 w-full min-w-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPositionMap(true)}
            className={`${
              isPositionMap
                ? "px-2 sm:px-3 py-1 bg-primary text-black text-[10px] sm:text-xs text-center font-heading font-normal rounded cursor-pointer"
                : "px-2 sm:px-3 py-1 border border-border text-[10px] sm:text-xs rounded hover:bg-gray-900 cursor-pointer text-gray-300"
            }`}
          >
            Position Map
          </button>
          <button
            type="button"
            onClick={() => setIsPositionMap(false)}
            className={cn(
              "px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded transition-all cursor-pointer",
              !isPositionMap
                ? "bg-primary text-black font-heading font-normal"
                : "border border-border hover:bg-gray-900 text-gray-300"
            )}
          >
            Futsal Map
          </button>
        </div>

        {isDirty && (
          <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded font-orbitron">
            Unsaved Changes
          </span>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="relative w-full h-auto mx-auto overflow-hidden select-none max-w-[350px] sm:max-w-md landscape:max-w-[280px] sm:landscape:max-w-[350px] md:landscape:max-w-md lg:landscape:max-w-lg"
      >
        <Image
          src={isPositionMap ? positionMap : futsalPitch}
          alt={isPositionMap ? "position map" : "futsal map"}
          width={800}
          height={600}
          className="w-full h-auto rounded"
          draggable={false}
          priority
        />

        {/* Render markers — 3 attacking + 3 defending */}
        {currentDisplayMarkers.map((marker) => (
          <div
            key={marker.id}
            title={pitchSlotLabel(marker.phase, marker.index)}
            className={cn(
              "absolute z-20 group/marker flex flex-col items-center select-none",
              canEditBio ? "cursor-move" : "cursor-default"
            )}
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={(e) => {
              if (!canEditBio) return;
              e.stopPropagation();
              setActiveMarker({
                id: marker.id,
                type: isPositionMap ? "position" : "futsal",
              });
            }}
            onTouchStart={(e) => {
              if (!canEditBio) return;
              e.stopPropagation();
              setActiveMarker({
                id: marker.id,
                type: isPositionMap ? "position" : "futsal",
              });
            }}
          >
            <span
              className={cn(
                "flex rounded-full ring-2 transition-transform group-hover/marker:scale-110",
                marker.phase === "attacking" ? "ring-destructive" : "ring-sky-500"
              )}
            >
              <Image
                src={positionIcon}
                alt={pitchSlotLabel(marker.phase, marker.index)}
                width={28}
                height={28}
                className="pointer-events-none size-6 drop-shadow-lg sm:size-7"
                draggable={false}
              />
            </span>
            <div
              className={cn(
                "mt-1 rounded border px-1 py-0.5 text-center text-[8px] font-bold whitespace-nowrap text-white shadow-md pointer-events-none select-none sm:px-1.5 sm:text-[9px]",
                marker.phase === "attacking"
                  ? "border-destructive/60 bg-destructive/85"
                  : "border-sky-500/60 bg-sky-600/85"
              )}
            >
              {marker.phase === "attacking" ? "ATT" : "DEF"} {marker.index}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive" /> Attacking (3)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-sky-500" /> Defending (3)
        </span>
      </div>

      {/* Save Changes Footer Bar */}
      {canEditBio && (
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5 w-full">
          {isDirty && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider font-orbitron transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 font-orbitron",
              isDirty && !isSaving
                ? "bg-[#E31B23] hover:bg-[#C2181F] text-white cursor-pointer shadow-lg shadow-red-900/25"
                : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <>
                <IconLoader2 className="size-4 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
