/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconDeviceFloppy,
  IconChevronDown,
  IconAlertCircle,
  IconLoader2,
  IconClock,
} from "@tabler/icons-react";
import {
  useGetTrainingSessionCoachesQuery,
  useGetTrainingSessionTeamsQuery,
  useUpdateTrainingSessionMutation,
} from "@/redux/features/academy/academyApi";
import {
  TRAINING_TIME_OPTIONS,
  parseTimeToMinutes,
} from "./training-sessions.constants";
import { ITrainingSessionListItem } from "@/types/academy.type";

interface EditTrainingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ITrainingSessionListItem | null;
}

interface TrainingSessionFormData {
  sessionName: string;
  teamId: string;
  coachId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  trainingLocation: string;
  sessionType: string;
  focusArea: string;
  maxParticipants: string;
  sessionDescription: string;
  requiredEquipment: string;
  additionalNotes: string;
}

const INITIAL_FORM_DATA: TrainingSessionFormData = {
  sessionName: "",
  teamId: "",
  coachId: "",
  sessionDate: "",
  startTime: "",
  endTime: "",
  trainingLocation: "",
  sessionType: "",
  focusArea: "",
  maxParticipants: "",
  sessionDescription: "",
  requiredEquipment: "",
  additionalNotes: "",
};

export const EditTrainingSessionModal: React.FC<EditTrainingSessionModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  const [formData, setFormData] = useState<TrainingSessionFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // RTK Queries & Mutation
  const { data: coachesResponse, isLoading: isLoadingCoaches } =
    useGetTrainingSessionCoachesQuery();
  const { data: teamsResponse, isLoading: isLoadingTeams } =
    useGetTrainingSessionTeamsQuery();
  const [updateTrainingSession, { isLoading }] =
    useUpdateTrainingSessionMutation();

  const coachesList = coachesResponse?.data || [];
  const teamsList = teamsResponse?.data || [];

  // Prefill formData when session opens
  useEffect(() => {
    if (!session || !isOpen) return;

    const matchingTeam = teamsList.find(
      (t) =>
        t._id === (session as any).teamId ||
        t.teamId === (session as any).teamId ||
        t.teamName?.toLowerCase() ===
          (session.teamName || session.teamBadge)?.toLowerCase()
    );

    const matchingCoach = coachesList.find(
      (c) =>
        c._id === (session as any).coachId ||
        c.coachId === (session as any).coachId ||
        c.fullName?.toLowerCase() ===
          (session.coachName || session.coach)?.toLowerCase()
    );

    // Format date string to YYYY-MM-DD for date input
    let formattedDate = "";
    if (session.sessionDate) {
      formattedDate = session.sessionDate.split("T")[0];
    } else if (session.date) {
      try {
        const d = new Date(session.date);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split("T")[0];
        } else {
          formattedDate = session.date;
        }
      } catch {
        formattedDate = session.date;
      }
    }

    let startT = session.startTime || "";
    let endT = session.endTime || "";
    if ((!startT || !endT) && session.timeRange && session.timeRange.includes("-")) {
      const parts = session.timeRange.split("-");
      startT = startT || parts[0]?.trim() || "";
      endT = endT || parts[1]?.trim() || "";
    }

    setFormData({
      sessionName: session.sessionName || session.title || "",
      teamId: matchingTeam?._id || (session as any).teamId || "",
      coachId: matchingCoach?._id || (session as any).coachId || "",
      sessionDate: formattedDate,
      startTime: startT,
      endTime: endT,
      trainingLocation: session.trainingLocation || session.locationVenue || "",
      sessionType: session.sessionType || "",
      focusArea: session.focusArea || "",
      maxParticipants: session.maxParticipants
        ? session.maxParticipants.toString()
        : "",
      sessionDescription:
        session.sessionDescription || (session as any).description || "",
      requiredEquipment: session.requiredEquipment || "",
      additionalNotes: session.additionalNotes || "",
    });
    setErrors({});
  }, [session, isOpen, coachesList, teamsList]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Dynamic Time validation check
    if (name === "startTime" || name === "endTime") {
      const start = name === "startTime" ? value : formData.startTime;
      const end = name === "endTime" ? value : formData.endTime;
      if (start && end) {
        const startMin = parseTimeToMinutes(start);
        const endMin = parseTimeToMinutes(end);
        if (startMin >= 0 && endMin >= 0 && startMin >= endMin) {
          setErrors((prev) => ({
            ...prev,
            endTime: "End time must be later than start time",
          }));
        } else if (errors.endTime === "End time must be later than start time") {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.endTime;
            return next;
          });
        }
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sessionName.trim()) {
      newErrors.sessionName = "Session name is required";
    }

    if (!formData.teamId) {
      newErrors.teamId = "Please select a team";
    }

    if (!formData.coachId) {
      newErrors.coachId = "Please select a head coach";
    }

    if (!formData.sessionDate) {
      newErrors.sessionDate = "Session date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    if (formData.startTime && formData.endTime) {
      const startMin = parseTimeToMinutes(formData.startTime);
      const endMin = parseTimeToMinutes(formData.endTime);
      if (startMin >= 0 && endMin >= 0 && startMin >= endMin) {
        newErrors.endTime = "End time must be later than start time";
      }
    }

    if (!formData.trainingLocation.trim()) {
      newErrors.trainingLocation = "Training location is required";
    }

    if (!formData.sessionType.trim()) {
      newErrors.sessionType = "Session type is required";
    }

    if (!formData.focusArea.trim()) {
      newErrors.focusArea = "Focus area is required";
    }

    if (formData.maxParticipants.trim()) {
      const num = Number(formData.maxParticipants);
      if (isNaN(num) || num <= 0) {
        newErrors.maxParticipants = "Max participants must be a positive number";
      }
    }

    if (!formData.sessionDescription.trim()) {
      newErrors.sessionDescription = "Session description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (isLoading) return;
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !session) return;

    const sessionId =
      session._id ||
      (session.id ? session.id.toString() : "");

    if (!sessionId) return;

    try {
      const payload = {
        sessionName: formData.sessionName.trim(),
        teamId: formData.teamId,
        coachId: formData.coachId,
        sessionDate: formData.sessionDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        trainingLocation: formData.trainingLocation.trim(),
        sessionType: formData.sessionType.trim(),
        focusArea: formData.focusArea.trim(),
        maxParticipants: formData.maxParticipants.trim()
          ? Number(formData.maxParticipants)
          : undefined,
        sessionDescription: formData.sessionDescription.trim(),
        requiredEquipment: formData.requiredEquipment.trim() || undefined,
        additionalNotes: formData.additionalNotes.trim() || undefined,
      };

      const res = await updateTrainingSession({
        sessionId,
        body: payload,
      }).unwrap();

      if (res?.success || !res?.error) {
        handleClose();
      }
    } catch {
      // Error handled in academyApi with ErrorToast
    }
  };

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Training Session"
      subtitle="Update scheduled training session details"
      showBackButton
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy size={18} className="shrink-0" />
                <span className="truncate">Save Changes</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
        {/* Session Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-white">
            Session Name <span className="text-[#E31B23]">*</span>
          </label>
          <input
            type="text"
            name="sessionName"
            value={formData.sessionName}
            onChange={handleChange}
            placeholder="e.g. Set Pieces & Dead Balls"
            className={`w-full bg-[#111111] border rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
              errors.sessionName
                ? "border-[#E31B23] focus:border-[#E31B23]"
                : "border-white/10 focus:border-white/20"
            }`}
          />
          {errors.sessionName && (
            <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
              <IconAlertCircle size={12} />
              {errors.sessionName}
            </p>
          )}
        </div>

        {/* Team and Head Coach Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Team <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                disabled={isLoadingTeams}
                className={`w-full bg-[#111111] border rounded-2xl p-4 pr-10 text-sm text-white focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 ${
                  errors.teamId
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/10 focus:border-white/20"
                }`}
              >
                <option value="" disabled className="bg-[#111111] text-white/40">
                  {isLoadingTeams ? "Loading teams..." : "Select team"}
                </option>
                {teamsList.map((t) => (
                  <option
                    key={t._id || t.teamId}
                    value={t._id || t.teamId}
                    className="bg-[#111111] text-white"
                  >
                    {t.displayName ||
                      t.label ||
                      `${t.teamName} ${t.ageGroup ? `(${t.ageGroup})` : ""}`}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
            </div>
            {errors.teamId && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.teamId}
              </p>
            )}
          </div>

          {/* Coach Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Head Coach <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <select
                name="coachId"
                value={formData.coachId}
                onChange={handleChange}
                disabled={isLoadingCoaches}
                className={`w-full bg-[#111111] border rounded-2xl p-4 pr-10 text-sm text-white focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 ${
                  errors.coachId
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/10 focus:border-white/20"
                }`}
              >
                <option value="" disabled className="bg-[#111111] text-white/40">
                  {isLoadingCoaches ? "Loading coaches..." : "Select head coach"}
                </option>
                {coachesList.map((c) => (
                  <option
                    key={c._id || c.coachId}
                    value={c._id || c.coachId}
                    className="bg-[#111111] text-white"
                  >
                    {c.displayName ||
                      c.label ||
                      `${c.fullName} - ${c.title || "COACH"}`}
                  </option>
                ))}
              </select>
              <IconChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
            </div>
            {errors.coachId && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.coachId}
              </p>
            )}
          </div>
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Session Date */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Session Date <span className="text-[#E31B23]">*</span>
            </label>
            <input
              type="date"
              name="sessionDate"
              value={formData.sessionDate}
              onChange={handleChange}
              className={`w-full bg-[#111111] border rounded-2xl p-4 text-sm text-white focus:outline-none transition-all [color-scheme:dark] ${
                errors.sessionDate
                  ? "border-[#E31B23] focus:border-[#E31B23]"
                  : "border-white/10 focus:border-white/20"
              }`}
            />
            {errors.sessionDate && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.sessionDate}
              </p>
            )}
          </div>

          {/* Start Time */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Start Time <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full bg-[#111111] border rounded-2xl p-4 pr-10 text-sm text-white focus:outline-none transition-all appearance-none cursor-pointer ${
                  errors.startTime
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/10 focus:border-white/20"
                }`}
              >
                <option value="" disabled className="bg-[#111111] text-white/40">
                  Select start time
                </option>
                {TRAINING_TIME_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-[#111111] text-white">
                    {t}
                  </option>
                ))}
              </select>
              <IconClock
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
            </div>
            {errors.startTime && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.startTime}
              </p>
            )}
          </div>

          {/* End Time */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              End Time <span className="text-[#E31B23]">*</span>
            </label>
            <div className="relative">
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full bg-[#111111] border rounded-2xl p-4 pr-10 text-sm text-white focus:outline-none transition-all appearance-none cursor-pointer ${
                  errors.endTime
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/10 focus:border-white/20"
                }`}
              >
                <option value="" disabled className="bg-[#111111] text-white/40">
                  Select end time
                </option>
                {TRAINING_TIME_OPTIONS.map((t) => (
                  <option key={t} value={t} className="bg-[#111111] text-white">
                    {t}
                  </option>
                ))}
              </select>
              <IconClock
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
            </div>
            {errors.endTime && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Location & Session Type Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Training Location <span className="text-[#E31B23]">*</span>
            </label>
            <input
              type="text"
              name="trainingLocation"
              value={formData.trainingLocation}
              onChange={handleChange}
              placeholder="e.g. Main Field A, Pitch 2"
              className={`w-full bg-[#111111] border rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                errors.trainingLocation
                  ? "border-[#E31B23] focus:border-[#E31B23]"
                  : "border-white/10 focus:border-white/20"
              }`}
            />
            {errors.trainingLocation && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.trainingLocation}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Session Type <span className="text-[#E31B23]">*</span>
            </label>
            <input
              type="text"
              name="sessionType"
              value={formData.sessionType}
              onChange={handleChange}
              placeholder="e.g. Technical, Tactical, Fitness"
              className={`w-full bg-[#111111] border rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                errors.sessionType
                  ? "border-[#E31B23] focus:border-[#E31B23]"
                  : "border-white/10 focus:border-white/20"
              }`}
            />
            {errors.sessionType && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.sessionType}
              </p>
            )}
          </div>
        </div>

        {/* Focus Area & Max Participants Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Focus Area <span className="text-[#E31B23]">*</span>
            </label>
            <input
              type="text"
              name="focusArea"
              value={formData.focusArea}
              onChange={handleChange}
              placeholder="e.g. Set Pieces, Ball Control, Counter Attack"
              className={`w-full bg-[#111111] border rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                errors.focusArea
                  ? "border-[#E31B23] focus:border-[#E31B23]"
                  : "border-white/10 focus:border-white/20"
              }`}
            />
            {errors.focusArea && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.focusArea}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-white">
              Max Participants (Optional)
            </label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="e.g. 25"
              min={1}
              className={`w-full bg-[#111111] border rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                errors.maxParticipants
                  ? "border-[#E31B23] focus:border-[#E31B23]"
                  : "border-white/10 focus:border-white/20"
              }`}
            />
            {errors.maxParticipants && (
              <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
                <IconAlertCircle size={12} />
                {errors.maxParticipants}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-white">
            Session Description <span className="text-[#E31B23]">*</span>
          </label>
          <textarea
            name="sessionDescription"
            value={formData.sessionDescription}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the training drills, tactical objectives, and session layout..."
            className={`w-full bg-[#111111] border rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all resize-none ${
              errors.sessionDescription
                ? "border-[#E31B23] focus:border-[#E31B23]"
                : "border-white/10 focus:border-white/20"
            }`}
          />
          {errors.sessionDescription && (
            <p className="text-[10px] text-[#E31B23] font-bold flex items-center gap-1">
              <IconAlertCircle size={12} />
              {errors.sessionDescription}
            </p>
          )}
        </div>

        {/* Required Equipment (Optional) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-white">
            Required Equipment (Optional)
          </label>
          <input
            type="text"
            name="requiredEquipment"
            value={formData.requiredEquipment}
            onChange={handleChange}
            placeholder="e.g. 10 Balls, 6 Dummy Walls, 20 Cones, Bibs"
            className="w-full bg-[#111111] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>

        {/* Additional Notes (Optional) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-white">
            Additional Notes (Optional)
          </label>
          <input
            type="text"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="e.g. Bring hydration bottles and studs for grass pitch."
            className="w-full bg-[#111111] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
      </form>
    </DashboardModal>
  );
};

export default EditTrainingSessionModal;
