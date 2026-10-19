/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import positionMap from "@/assets/cvs/id/position-map.png";
import futsalPitch from "@/assets/cvs/id/Futsal Pitch.jpg";
import positionIcon from "@/assets/cvs/id/positionIcon.png";
import { cn } from "@/lib/utils";
import { getMarkersForPosition } from "./bioConstants";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { updatePlayerField } from "@/redux/features/player/playerSlice";

interface PitchMapCardProps {
  playerData: any;
  handleUpdate: (field: string, value: any) => void;
}

export const PitchMapCard = ({
  playerData,
  handleUpdate,
}: PitchMapCardProps) => {
  const dispatch = useAppDispatch();
  const [isPositionMap, setIsPositionMap] = useState(true);
  const [activeMarker, setActiveMarker] = useState<{
    id: string;
    type: "position" | "futsal";
  } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const prevPositionRef = useRef<string>("");
  const draggedMarkersRef = useRef<{ field: string; markers: any[] } | null>(null);

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

  // Synchronize markers for the active map in local Redux state only (do not call API on mount)
  useEffect(() => {
    if (!playerData || !playerData.position) return;
    const expected = getMarkersForPosition(playerData.position, !isPositionMap);
    const field = isPositionMap ? "positionMarkers" : "futsalMarkers";
    const current =
      (isPositionMap ? playerData.positionMarkers : playerData.futsalMarkers) ||
      [];
    const needsReset =
      current.length !== 3 ||
      current.some((m: any, idx: number) => m.name !== expected[idx]?.name);
    if (needsReset) {
      dispatch(updatePlayerField({ field, value: expected }));
    }
  }, [playerData.position, isPositionMap, dispatch]);

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
    const field =
      activeMarker.type === "position" ? "positionMarkers" : "futsalMarkers";
    const markers =
      (activeMarker.type === "position"
        ? playerData.positionMarkers
        : playerData.futsalMarkers) || [];
    const newMarkers = markers.map((m: any) =>
      m.id === activeMarker.id ? { ...m, x, y } : m
    );
    // Smoothly update local Redux state during drag without spamming API
    dispatch(updatePlayerField({ field, value: newMarkers }));
    draggedMarkersRef.current = { field, markers: newMarkers };
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
      if (draggedMarkersRef.current) {
        const { field, markers } = draggedMarkersRef.current;
        handleUpdate(field, markers);
        draggedMarkersRef.current = null;
      }
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

  return (
    <div className="p-4 sm:p-6 border-t border-white/5 w-full min-w-0">
      <div className="flex flex-wrap gap-2 mb-4 w-full min-w-0">
        <button
          type="button"
          onClick={() => setIsPositionMap(true)}
          className={`${
            isPositionMap
              ? "px-2 sm:px-3 py-1 bg-primary text-black text-[10px] sm:text-xs text-center font-heading font-normal rounded cursor-pointer"
              : "px-2 sm:px-3 py-1 border border-border text-[10px] sm:text-xs rounded hover:bg-gray-900 cursor-pointer"
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
              : "border border-border hover:bg-gray-900"
          )}
        >
          Futsal Map
        </button>
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
        {/* Render markers */}
        {(() => {
          const currentMarkers =
            (isPositionMap
              ? playerData.positionMarkers
              : playerData.futsalMarkers) || [];
          const displayMarkers =
            currentMarkers.length > 0
              ? currentMarkers
              : getMarkersForPosition(
                  playerData?.position || "Striker",
                  !isPositionMap
                );
          return displayMarkers.map((marker: any, idx: number) => (
            <div
              key={marker.id || idx}
              className="absolute z-20 cursor-move group/marker flex flex-col items-center"
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setActiveMarker({
                  id: marker.id,
                  type: isPositionMap ? "position" : "futsal",
                });
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setActiveMarker({
                  id: marker.id,
                  type: isPositionMap ? "position" : "futsal",
                });
              }}
            >
              <Image
                src={positionIcon}
                alt="position icon"
                width={idx === 0 ? 40 : 28}
                height={idx === 0 ? 40 : 28}
                className={cn(
                  "pointer-events-none drop-shadow-lg transition-transform group-hover/marker:scale-110",
                  idx === 0
                    ? "w-8 h-8 sm:w-10 sm:h-10"
                    : "w-5 h-5 sm:w-7 sm:h-7"
                )}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
              {marker.name && (
                <div
                  className={cn(
                    "mt-1 px-1 sm:px-1.5 py-0.5 rounded bg-black/85 border border-white/10 text-white text-[8px] sm:text-[9px] font-medium text-center whitespace-nowrap shadow-md pointer-events-none tracking-wide select-none transition-all"
                  )}
                >
                  Position-{idx + 1}
                </div>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
};
