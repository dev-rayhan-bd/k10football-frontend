'use client'

import formation1 from "@/assets/cvs/id/position-map.png"
import formationPin from "@/assets/cvs/id/positionIcon.png"
import { useCoach } from "@/hooks/useCoach"
import { cn } from "@/lib/utils"
import Image, { StaticImageData } from 'next/image'
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

type Marker = { id: string | number; x: number; y: number };

const FORMATION_COUNT = 3;

const clamp = (v: number) => Math.max(0, Math.min(100, v));

const normalizeFormations = (value: unknown): Marker[][] =>
  Array.from({ length: FORMATION_COUNT }, (_, i) =>
    Array.isArray(value) && Array.isArray(value[i]) ? (value[i] as Marker[]) : []
  );

/** Purely local editor: reports every change via `onChange`, never saves. */
const TacticalMap = ({
  formationIndex,
  image,
  pinIcon,
  markers,
  editable,
  onChange
}: {
  formationIndex: number;
  image: StaticImageData;
  pinIcon: StaticImageData;
  markers: Marker[];
  editable: boolean;
  onChange: (markers: Marker[]) => void
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | number | null>(null);

  const markersRef = useRef(markers);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    markersRef.current = markers;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (activeMarkerId === null) return;

    const handleMove = (e: PointerEvent) => {
      const rect = mapContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp(((e.clientX - rect.left) / rect.width) * 100);
      const y = clamp(((e.clientY - rect.top) / rect.height) * 100);
      onChangeRef.current(
        markersRef.current.map((m) => (m.id === activeMarkerId ? { ...m, x, y } : m))
      );
    };
    const handleUp = () => setActiveMarkerId(null);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [activeMarkerId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-2">
        <span className="text-xs font-bold text-primary uppercase">Formation {formationIndex + 1}</span>
        {editable && (
          <Button
            data-pdf-hide
            size="sm"
            variant="outline"
            className="h-7 text-[10px] border-primary/20 hover:bg-primary/10 text-primary"
            onClick={() => onChange([...markers, { id: Date.now(), x: 50, y: 50 }])}
          >
            + Add Icon
          </Button>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="relative w-full h-auto overflow-hidden select-none rounded-xl border border-white/10 touch-none"
      >
        <Image
          src={image}
          alt={`formation ${formationIndex + 1}`}
          width={400}
          height={300}
          className="w-full h-auto"
          draggable={false}
        />

        {markers.map((marker) => (
          <div
            key={marker.id}
            className={cn("absolute z-20 group/marker", editable && "cursor-move")}
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onPointerDown={(e) => {
              if (!editable) return;
              e.preventDefault();
              e.stopPropagation();
              setActiveMarkerId(marker.id);
            }}
          >
            <Image
              src={pinIcon}
              alt="marker"
              width={40}
              height={40}
              draggable={false}
              className={cn(
                "pointer-events-none drop-shadow-lg transition-transform group-hover/marker:scale-110",
                "size-8 md:size-10"
              )}
            />
            {editable && (
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-4 flex items-center justify-center text-[10px] opacity-0 group-hover/marker:opacity-100 transition-opacity cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(markers.filter((m) => m.id !== marker.id));
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Top3Formation = ({ editable, coachId }: { editable?: boolean; coachId?: string }) => {
  const { coachData, handleUpdate } = useCoach(coachId);

  const savedFormations = normalizeFormations(coachData.formationMarkers);

  // null = no unsaved edits (show what's saved). All edits stay in this draft
  // until "Save Formations" is pressed — one API call per save.
  const [draft, setDraft] = useState<Marker[][] | null>(null);
  const formations = draft ?? savedFormations;
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(savedFormations);

  const updateFormation = (index: number, markers: Marker[]) => {
    setDraft((prev) => {
      const base = prev ?? savedFormations;
      return base.map((m, i) => (i === index ? markers : m));
    });
  };

  const handleSave = () => {
    if (!draft || !isDirty) return;
    handleUpdate('formationMarkers', draft);
    setDraft(null);
  };

  return (
    <div className="py-8 sm:py-16 md:py-20 bg-black p-4 sm:p-8 md:p-12 rounded-3xl">
      <div className="container mx-auto">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading text-white text-center mb-6 sm:mb-12 tracking-wide uppercase">
          Top 3 Formations
        </h1>

        {/* Formation Maps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {formations.map((markers, index) => (
            <TacticalMap
              key={index}
              formationIndex={index}
              image={formation1}
              pinIcon={formationPin}
              markers={markers}
              editable={!!editable}
              onChange={(next) => updateFormation(index, next)}
            />
          ))}
        </div>

        {editable && (
          <div data-pdf-hide className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 sm:mt-8">
            {isDirty && (
              <span className="text-xs text-muted-foreground sm:mr-auto">
                You have unsaved formation changes.
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => setDraft(null)}
              disabled={!isDirty}
              className="w-full sm:w-auto cursor-pointer"
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isDirty}
              className="w-full sm:w-auto cursor-pointer font-bold uppercase tracking-wider"
            >
              Save Formations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Top3Formation;
