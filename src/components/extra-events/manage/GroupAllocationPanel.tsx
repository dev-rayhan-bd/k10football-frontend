"use client";

import React, { useMemo, useState } from "react";
import { IconArrowsShuffle, IconDeviceFloppy, IconLayoutColumns } from "@tabler/icons-react";
import { toast } from "sonner";
import { getExtraEventApiError, useAllocateEventGroupsMutation } from "@/redux/features/extraEvent/extraEventApi";
import type { IRegisteredClub, TournamentGroup } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";
import { buildAllocationClubs, clubLogoOf, paymentTone, type AllocationClub } from "./extraEventUtils";
import { ActionButton, ClubLogo, EmptyState, Pill, SectionCard } from "./ManageUi";

type Group = TournamentGroup | "";
const GROUPS: TournamentGroup[] = ["GROUP A", "GROUP B"];
const isEligible = (c: AllocationClub) => ["PAID", "FREE"].includes(String(c.paymentStatus || "").toUpperCase());

export const GroupAllocationPanel = ({
  eventId,
  clubs,
  allocation,
  editable,
  isLoading,
}: {
  eventId: string;
  clubs: IRegisteredClub[];
  allocation: unknown;
  editable: boolean;
  isLoading?: boolean;
}) => {
  const [allocateGroups, { isLoading: isSaving }] = useAllocateEventGroupsMutation();
  // Only local edits are kept in state; the server allocation is the base.
  const [draft, setDraft] = useState<Record<string, Group>>({});

  const base = useMemo(() => buildAllocationClubs(clubs, allocation), [clubs, allocation]);
  const effective = base.map((c) => ({ ...c, group: (c.id in draft ? draft[c.id] : c.group) as Group }));
  const dirty = Object.keys(draft).some((id) => base.find((c) => c.id === id)?.group !== draft[id]);

  const setGroup = (id: string, group: Group) => setDraft((d) => ({ ...d, [id]: group }));

  const autoBalance = () => {
    const eligible = effective.filter(isEligible);
    const next: Record<string, Group> = {};
    eligible.forEach((c, i) => (next[c.id] = GROUPS[i % 2]));
    setDraft(next);
  };

  const save = async () => {
    const allocations = effective
      .filter((c) => c.group)
      .map((c) => ({ clubId: c.id, group: c.group as TournamentGroup }));
    if (!allocations.length) return toast.error("Assign at least one club to a group");
    try {
      const res = await allocateGroups({ eventId, allocations }).unwrap();
      toast.success(res?.message || "Groups saved");
      setDraft({});
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to save groups").message);
    }
  };

  const columns: { key: Group; label: string }[] = [
    { key: "GROUP A", label: "Group A" },
    { key: "GROUP B", label: "Group B" },
    { key: "", label: "Unallocated" },
  ];

  return (
    <SectionCard
      title="Group Allocation"
      subtitle={editable ? "Assign paid clubs to Group A or Group B, then save" : "Current group draw"}
      actions={
        editable && base.length > 0 ? (
          <>
            <ActionButton icon={<IconArrowsShuffle size={14} />} onClick={autoBalance}>
              Auto-balance
            </ActionButton>
            <ActionButton variant="primary" icon={<IconDeviceFloppy size={14} />} loading={isSaving} disabled={!dirty} onClick={save}>
              Save Groups
            </ActionButton>
          </>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="h-32 rounded-3xl bg-white/5 shimmer" />
      ) : base.length === 0 ? (
        <EmptyState icon={<IconLayoutColumns size={28} />} title="No clubs to allocate" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {columns.map((col) => {
            const items = effective.filter((c) => c.group === col.key);
            return (
              <div key={col.label} className="bg-[#151515] border border-white/5 rounded-3xl p-4 flex flex-col gap-3 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white font-orbitron">{col.label}</h4>
                  <span className="text-[10px] font-black text-white/40">{items.length}</span>
                </div>
                {items.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 py-4 text-center">Empty</p>}
                {items.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 bg-black/30 border border-white/5 rounded-2xl p-2.5 min-w-0">
                    <ClubLogo logo={clubLogoOf(c.raw)} name={c.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate">{c.name}</p>
                      <Pill className={cn("mt-1 px-2 py-0.5", paymentTone(c.paymentStatus))}>{c.paymentStatus || "—"}</Pill>
                    </div>
                    {editable && (
                      <div className="flex gap-1 shrink-0">
                        {GROUPS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            disabled={!isEligible(c)}
                            title={isEligible(c) ? `Move to ${g}` : "Awaiting payment"}
                            onClick={() => setGroup(c.id, c.group === g ? "" : g)}
                            className={cn(
                              "size-8 rounded-lg border text-[10px] font-black transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
                              c.group === g
                                ? "bg-[#E31B23] border-[#E31B23] text-white"
                                : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                            )}
                          >
                            {g.slice(-1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};

export default GroupAllocationPanel;
