"use client";

import React, { useState } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconPlus,
  IconChevronDown,
  IconAlertCircle,
  IconLoader2,
  IconClock,
} from "@tabler/icons-react";
import {
  useGetTrainingSessionCoachesQuery,
  useGetTrainingSessionTeamsQuery,
  useCreateTrainingSessionMutation,
} from "@/redux/features/academy/academyApi";
import {
  TRAINING_TIME_OPTIONS,
  parseTimeToMinutes,
} from "./training-sessions.constants";

interface CreateTrainingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const CreateTrainingSessionModal: React.FC<CreateTrainingSessionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<TrainingSessionFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // RTK Queries
  const { data: coachesResponse, isLoading: isLoadingCoaches } = useGetTrainingSessionCoachesQuery();
  const { data: teamsResponse, isLoading: isLoadingTeams } = useGetTrainingSessionTeamsQuery();
  const [createTrainingSession, { isLoading }] = useCreateTrainingSessionMutation();

  const coachesList = coachesResponse?.data || [];
  const teamsList = teamsResponse?.data || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
    if (!validate()) return;

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

      const res = await createTrainingSession(payload).unwrap();
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
      title="Create Training Session"
      subtitle="Schedule a new training session for your team"
      showBackButton
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
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
                <span>Creating Session...</span>
              </>
            ) : (
              <>
                <IconPlus size={18} className="shrink-0" />
                <span className="truncate">Create Session</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {/* Basic Information */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Session Name <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                name="sessionName"
                value={formData.sessionName}
                onChange={handleChange}
                placeholder="e.g., Set Pieces & Dead Balls"
                className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                  errors.sessionName
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.sessionName && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.sessionName}
                </p>
              )}
            </div>

            {/* Team Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Team <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-10 text-sm appearance-none focus:outline-none transition-all cursor-pointer ${
                    formData.teamId ? "text-white" : "text-white/40"
                  } ${
                    errors.teamId
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    {isLoadingTeams ? "Loading teams..." : "Select team"}
                  </option>
                  {teamsList.map((team) => (
                    <option
                      key={team._id || team.teamId}
                      value={team.teamId || team._id}
                      className="bg-[#111111] text-white"
                    >
                      {team.displayName || team.label || `${team.teamName} (${team.ageGroup || ""})`}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.teamId && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.teamId}
                </p>
              )}
            </div>

            {/* Head Coach Dropdown */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Head Coach <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  name="coachId"
                  value={formData.coachId}
                  onChange={handleChange}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-10 text-sm appearance-none focus:outline-none transition-all cursor-pointer ${
                    formData.coachId ? "text-white" : "text-white/40"
                  } ${
                    errors.coachId
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    {isLoadingCoaches ? "Loading coaches..." : "Select head coach"}
                  </option>
                  {coachesList.map((coach) => (
                    <option
                      key={coach._id || coach.coachId}
                      value={coach.coachId || coach._id}
                      className="bg-[#111111] text-white"
                    >
                      {coach.displayName || coach.label || `${coach.fullName} (${coach.title || "COACH"})`}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.coachId && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.coachId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">
            Schedule Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Date */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Date <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="sessionDate"
                  value={formData.sessionDate}
                  onChange={handleChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all cursor-pointer [color-scheme:dark] ${
                    errors.sessionDate
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                />
              </div>
              {errors.sessionDate && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.sessionDate}
                </p>
              )}
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Start Time <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-10 text-sm appearance-none focus:outline-none transition-all cursor-pointer ${
                    formData.startTime ? "text-white" : "text-white/40"
                  } ${
                    errors.startTime
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    Select start time
                  </option>
                  {TRAINING_TIME_OPTIONS.map((time) => (
                    <option key={time} value={time} className="bg-[#111111] text-white">
                      {time}
                    </option>
                  ))}
                </select>
                <IconClock
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.startTime && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.startTime}
                </p>
              )}
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                End Time <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-10 text-sm appearance-none focus:outline-none transition-all cursor-pointer ${
                    formData.endTime ? "text-white" : "text-white/40"
                  } ${
                    errors.endTime
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    Select end time
                  </option>
                  {TRAINING_TIME_OPTIONS.map((time) => (
                    <option key={time} value={time} className="bg-[#111111] text-white">
                      {time}
                    </option>
                  ))}
                </select>
                <IconClock
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.endTime && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.endTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location & Venue (Input field per user request) */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">
            Location &amp; Venue
          </h3>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
              Training Location <span className="text-[#E31B23]">*</span>
            </label>
            <input
              type="text"
              name="trainingLocation"
              value={formData.trainingLocation}
              onChange={handleChange}
              placeholder="e.g., Main Field A"
              className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                errors.trainingLocation
                  ? "border-[#E31B23] focus:border-[#E31B23]"
                  : "border-white/15 focus:border-white/25"
              }`}
            />
            {errors.trainingLocation && (
              <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                <IconAlertCircle size={14} /> {errors.trainingLocation}
              </p>
            )}
          </div>
        </div>

        {/* Session Type & Focus (Input fields per user request) */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">
            Session Type &amp; Focus
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Type */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Session Type <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
                placeholder="e.g., Technical"
                className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                  errors.sessionType
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.sessionType && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.sessionType}
                </p>
              )}
            </div>

            {/* Focus Area */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Focus Area <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                name="focusArea"
                value={formData.focusArea}
                onChange={handleChange}
                placeholder="e.g., Set Pieces & Dead Balls"
                className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                  errors.focusArea
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.focusArea && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.focusArea}
                </p>
              )}
            </div>

            {/* Max Participants */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                min="1"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="e.g., 25"
                className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                  errors.maxParticipants
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.maxParticipants ? (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.maxParticipants}
                </p>
              ) : (
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                  Leave blank for unlimited participants
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">
            Session Details
          </h3>
          <div className="flex flex-col gap-4">
            {/* Session Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Session Description <span className="text-[#E31B23]">*</span>
              </label>
              <textarea
                name="sessionDescription"
                value={formData.sessionDescription}
                onChange={handleChange}
                placeholder="Describe the training session objectives, drills, and activities..."
                className={`w-full h-32 bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all resize-none ${
                  errors.sessionDescription
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.sessionDescription && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.sessionDescription}
                </p>
              )}
            </div>

            {/* Required Equipment */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Required Equipment
              </label>
              <textarea
                name="requiredEquipment"
                value={formData.requiredEquipment}
                onChange={handleChange}
                placeholder="List all equipment needed: cones, balls, bibs, etc."
                className="w-full h-28 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
              />
            </div>

            {/* Additional Notes */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Any additional information for coaches or players..."
                className="w-full h-28 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </form>
    </DashboardModal>
  );
};

export default CreateTrainingSessionModal;
