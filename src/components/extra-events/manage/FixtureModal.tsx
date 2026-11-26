"use client";

import React, { useState } from "react";
import { IconDeviceFloppy, IconScoreboard } from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  getExtraEventApiError,
  useRecordEventMatchResultMutation,
  useUpdateEventFixtureMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IUpdateFixturePayload } from "@/types/extraEvent.type";
import { type ParsedFixture, toDateInput } from "./extraEventUtils";
import { ActionButton, Field, fieldClass } from "./ManageUi";

const STATUSES = ["SCHEDULED", "LIVE", "COMPLETED"];

const ScoreInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <Field label={label} className="flex-1">
    <input
      type="number"
      min={0}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} text-center text-2xl font-black font-orbitron`}
    />
  </Field>
);

/** "edit" → PATCH fixtures/:matchId ; "result" → POST record-match-result. */
export const FixtureModal = ({
  eventId,
  fixture,
  mode,
  onClose,
}: {
  eventId: string;
  fixture: ParsedFixture;
  mode: "edit" | "result";
  onClose: () => void;
}) => {
  const [updateFixture, { isLoading: isUpdating }] = useUpdateEventFixtureMutation();
  const [recordResult, { isLoading: isRecording }] = useRecordEventMatchResultMutation();
  const [homeScore, setHomeScore] = useState(fixture.homeScore !== null ? String(fixture.homeScore) : "");
  const [awayScore, setAwayScore] = useState(fixture.awayScore !== null ? String(fixture.awayScore) : "");
  const [kickoffTime, setKickoffTime] = useState(fixture.kickoffTime);
  const [matchDate, setMatchDate] = useState(toDateInput(fixture.matchDate));
  const [pitch, setPitch] = useState(fixture.pitch);
  const [status, setStatus] = useState(STATUSES.includes(fixture.status) ? fixture.status : "SCHEDULED");

  const parseScore = (v: string) => (v.trim() === "" ? undefined : Math.max(0, Math.floor(Number(v))));

  const submit = async () => {
    const h = parseScore(homeScore);
    const a = parseScore(awayScore);
    try {
      if (mode === "result") {
        if (h === undefined || a === undefined || Number.isNaN(h) || Number.isNaN(a)) return toast.error("Enter both scores");
        const res = await recordResult({ eventId, matchId: fixture.id, score1: h, score2: a }).unwrap();
        toast.success(res?.message || "Result recorded");
      } else {
        const body: IUpdateFixturePayload = { status };
        if (h !== undefined && !Number.isNaN(h)) body.homeScore = h;
        if (a !== undefined && !Number.isNaN(a)) body.awayScore = a;
        if (kickoffTime.trim()) body.kickoffTime = kickoffTime.trim();
        if (pitch.trim()) body.pitch = pitch.trim();
        if (matchDate) body.matchDate = matchDate;
        const res = await updateFixture({ eventId, matchId: fixture.id, body }).unwrap();
        toast.success(res?.message || "Fixture updated");
      }
      onClose();
    } catch (err) {
      toast.error(getExtraEventApiError(err, mode === "result" ? "Failed to record result" : "Failed to update fixture").message);
    }
  };

  return (
    <DashboardModal
      isOpen
      onClose={onClose}
      title={mode === "result" ? "Record Result" : "Edit Fixture"}
      subtitle={`${fixture.home} vs ${fixture.away}`}
      maxWidth="max-w-xl"
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton
            variant="primary"
            loading={isUpdating || isRecording}
            icon={mode === "result" ? <IconScoreboard size={16} /> : <IconDeviceFloppy size={16} />}
            onClick={submit}
          >
            {mode === "result" ? "Record Result" : "Save Fixture"}
          </ActionButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-end gap-4">
          <ScoreInput label={fixture.home} value={homeScore} onChange={setHomeScore} />
          <span className="pb-4 text-white/30 font-black">–</span>
          <ScoreInput label={fixture.away} value={awayScore} onChange={setAwayScore} />
        </div>
        {mode === "edit" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Match Date">
              <input type="date" style={{ colorScheme: "dark" }} value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className={fieldClass} />
            </Field>
            <Field label="Kickoff Time">
              <input value={kickoffTime} onChange={(e) => setKickoffTime(e.target.value)} placeholder="e.g., 10:30" className={fieldClass} />
            </Field>
            <Field label="Pitch">
              <input value={pitch} onChange={(e) => setPitch(e.target.value)} placeholder="e.g., Pitch 2" className={fieldClass} />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#111111]">
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        {mode === "result" && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Recording a result completes the match and updates standings / the bracket.
          </p>
        )}
      </div>
    </DashboardModal>
  );
};

export default FixtureModal;
