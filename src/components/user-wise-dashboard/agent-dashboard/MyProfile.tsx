/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import {
  IconCircleCheck,
  IconCloudUpload,
  IconShieldCheck,
  IconCertificate,
  IconPhone,
  IconMail,
  IconAlertCircle,
  IconLoader2,
  IconRefresh,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
} from "@/redux/features/agent/agentApi";
import { toast } from "sonner";

// Reusable Section Header
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-2 text-white">
      <IconCircleCheck className="text-green-500 size-5" />
      <h2 className="text-lg font-bold font-orbitron">{title}</h2>
    </div>
  </div>
);

interface ProfileHeroProps {
  completion: number;
  verificationStatus: string;
  fullName: string;
  nationality: string;
  licenseId: string;
  certifications: string;
  contact: string;
  email: string;
  coverPhoto: string;
  tier?: string;
  tagline?: string;
}

const ProfileHero = ({
  completion,
  verificationStatus,
  fullName,
  nationality,
  licenseId,
  certifications,
  contact,
  email,
  coverPhoto,
  tier = "ACTIVE AGENT",
  tagline,
}: ProfileHeroProps) => {
  const normStatus = (verificationStatus || "").toUpperCase();

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[300px] border border-white/15 group flex flex-col mb-8">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url(${
            coverPhoto || "/707964211aa29e42aa7d522475b870cad9c4ad92.png"
          })`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />

      <div className="relative p-4 sm:p-6 w-full flex flex-col h-full justify-between z-10">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            {/* Progress Circle SVG */}
            <div className="relative size-24 flex items-center justify-center shrink-0">
              <svg className="size-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-[#E31B23] transition-all duration-500 ease-out"
                  strokeDasharray={276}
                  strokeDashoffset={276 * (1 - completion / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-lg font-black italic">{completion}%</span>
                <span className="text-[8px] text-white/60 uppercase font-bold tracking-widest">
                  Profile
                </span>
              </div>
            </div>
          </div>

          {/* Tier & Verification Status Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[8px] font-bold text-white uppercase w-fit tracking-[0.2em]">
              {tier}
            </div>

            {normStatus === "APPROVED" && (
              <span className="inline-flex items-center gap-1.5 bg-[#00FF62]/10 border border-[#00FF62]/20 text-[#00FF62] text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-[#00FF62]/5">
                <IconShieldCheck size={12} className="animate-pulse" />
                VERIFIED BY ADMIN
              </span>
            )}
            {normStatus === "PENDING" && (
              <span className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                <IconAlertCircle size={12} />
                VERIFICATION PENDING
              </span>
            )}
            {normStatus === "REJECTED" && (
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                VERIFICATION REJECTED
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase leading-none font-orbitron mb-2 break-words">
            {fullName || "David Agent"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <span className="text-[#E31B23]">
              {tagline || "Premium Agent"}
            </span>
            {nationality && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  {nationality}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-6 pt-6 mt-6 border-t border-white/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/15 text-white/40 shrink-0">
              <IconShieldCheck className="size-4 sm:size-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[9px] text-white/40 uppercase font-black tracking-widest truncate">
                License ID
              </p>
              <p className="text-white text-sm font-bold truncate">
                {licenseId || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/15 text-white/40 shrink-0">
              <IconCertificate className="size-4 sm:size-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[9px] text-white/40 uppercase font-black tracking-widest truncate">
                Certifications
              </p>
              <p className="text-[#E31B23] text-sm font-bold truncate">
                {certifications || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/15 text-white/40 shrink-0">
              <IconPhone className="size-4 sm:size-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[9px] text-white/40 uppercase font-black tracking-widest truncate">
                Contact
              </p>
              <p className="text-white text-sm font-bold truncate">
                {contact || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/15 text-white/40 shrink-0">
              <IconMail className="size-4 sm:size-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-[9px] text-white/40 uppercase font-black tracking-widest truncate">
                Email
              </p>
              <p className="text-white text-sm font-bold truncate">
                {email || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AgentProfile = () => {
  // Query: GET {{baseUrl}}/agents/agent-profile
  const {
    data: profileResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAgentProfileQuery();

  // Mutation: PATCH {{baseUrl}}/agents/agent-profile
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateAgentProfileMutation();

  const profileData = profileResponse?.data;

  // Form states: Personal Information
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [dob, setDob] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  // Form states: Professional Details
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [achievements, setAchievements] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");

  // Form states: Biography
  const [bio, setBio] = useState("");

  // Cover photo states
  const [coverPhoto, setCoverPhoto] = useState("");
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>("");

  const coverUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Sync data from API into form state
  useEffect(() => {
    if (profileData) {
      setFullName(
        profileData.personalInformation?.fullName ||
          profileData.fullName ||
          profileData.name ||
          profileData.userId?.name ||
          ""
      );
      setNationality(
        profileData.personalInformation?.nationality ||
          profileData.nationality ||
          profileData.country ||
          profileData.userId?.country ||
          ""
      );
      setLicenseId(
        profileData.personalInformation?.licenseId ||
          profileData.licenseId ||
          profileData.fifaLicenseNumber ||
          ""
      );

      const rawDob =
        profileData.personalInformation?.dateOfBirth ||
        profileData.dateOfBirth;
      if (rawDob) {
        setDob(new Date(rawDob).toISOString().split("T")[0]);
      } else {
        setDob("");
      }

      setContact(
        profileData.personalInformation?.contact ||
          profileData.contact ||
          profileData.phone ||
          profileData.userId?.phone ||
          ""
      );
      setEmail(
        profileData.personalInformation?.email ||
          profileData.email ||
          profileData.userId?.email ||
          ""
      );

      const exp =
        profileData.professionalDetails?.yearsOfExperience ??
        profileData.yearsOfExperience;
      setExperience(exp !== null && exp !== undefined ? String(exp) : "");

      setCertifications(
        profileData.professionalDetails?.certifications ||
          profileData.certifications ||
          ""
      );
      setAchievements(
        profileData.professionalDetails?.achievements ||
          profileData.achievements ||
          ""
      );
      setAgencyName(
        profileData.professionalDetails?.agencyName ||
          profileData.agencyName ||
          ""
      );
      setOfficialWebsite(
        profileData.professionalDetails?.officialWebsite ||
          profileData.officialWebsite ||
          ""
      );

      setBio(
        profileData.biography?.professionalBio ||
          profileData.biography?.bio ||
          profileData.professionalBio ||
          profileData.bio ||
          ""
      );

      const initialCover =
        profileData.personalInformation?.coverPhoto ||
        profileData.coverPhoto ||
        profileData.headerCard?.coverPhoto ||
        "";
      setCoverPhoto(initialCover);
      setCoverPhotoPreview("");
      setCoverPhotoFile(null);
    }
  }, [profileData]);

  // Handle Cover Photo Selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Max size is 5MB.");
        return;
      }
      setCoverPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPhotoPreview(previewUrl);
      toast.success("Cover photo selected! Click Save Changes to apply.");
    }
  };

  // Submit Profile Changes
  const handleSave = async () => {
    try {
      const formData = new FormData();
      const dataPayload = {
        fullName,
        nationality,
        licenseId,
        dateOfBirth: dob || null,
        contact,
        email,
        yearsOfExperience: experience ? Number(experience) || experience : null,
        certifications,
        achievements,
        agencyName,
        officialWebsite,
        bio,
        professionalBio: bio,
      };

      formData.append("data", JSON.stringify(dataPayload));
      if (coverPhotoFile) {
        formData.append("coverPhoto", coverPhotoFile);
      }

      await updateProfile(formData).unwrap();
      setCoverPhotoFile(null);
    } catch {
      // Handled by RTK mutation onQueryStarted
    }
  };

  const completion =
    profileData?.profileCompletion ??
    profileData?.headerCard?.profileCompletion ??
    55;

  const verificationStatus =
    profileData?.verificationStatus ||
    profileData?.licensedVerification?.status ||
    "PENDING";

  const normStatus = verificationStatus.toUpperCase();

  return (
    <div className="p-2 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide mb-1">
            My Profile
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Manage your professional information
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-[320px] rounded-2xl bg-white/5 border border-white/10" />
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="h-6 w-48 rounded bg-white/10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-11 rounded-xl bg-white/5" />
                ))}
              </div>
              <div className="h-72 rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
          <IconAlertTriangle className="size-8 text-destructive" />
          <p className="text-sm font-bold text-destructive">
            Failed to load agent profile
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            variant="outline"
            className="mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
          >
            <IconRefresh size={14} className="mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Status Banners */}
          {normStatus === "APPROVED" && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3">
              <IconShieldCheck size={24} className="shrink-0" />
              <div>
                <p className="font-bold text-sm">Verified Account Status</p>
                <p className="text-xs text-emerald-400/80">
                  Your profile has been fully verified and approved by the
                  administrator.
                </p>
              </div>
            </div>
          )}
          {normStatus === "PENDING" && (
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-6 py-4 rounded-2xl flex items-center gap-3">
              <IconAlertCircle size={24} className="shrink-0" />
              <div>
                <p className="font-bold text-sm">Verification Pending</p>
                <p className="text-xs text-orange-400/80">
                  Your profile is currently under review by the administrator.
                </p>
              </div>
            </div>
          )}

          {/* Personal Information & Hero Card */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <SectionHeader title="Personal Information" />

            <ProfileHero
              completion={completion}
              verificationStatus={verificationStatus}
              fullName={fullName}
              nationality={nationality}
              licenseId={licenseId}
              certifications={certifications}
              contact={contact}
              email={email}
              coverPhoto={coverPhotoPreview || coverPhoto}
              tier={
                profileData?.tier ||
                profileData?.currentTier ||
                profileData?.headerCard?.tier ||
                "ACTIVE AGENT"
              }
              tagline={profileData?.headerCard?.tagline}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Form Fields */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Full Name
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Nationality
                  </Label>
                  <Input
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Nationality"
                    className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    License ID
                  </Label>
                  <Input
                    value={licenseId}
                    onChange={(e) => setLicenseId(e.target.value)}
                    placeholder="License ID"
                    className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 scheme-dark focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Contact
                  </Label>
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Contact Number"
                    className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Email
                  </Label>
                  <Input
                    value={email}
                    disabled
                    readOnly
                    placeholder="Email Address"
                    className="bg-[#0a0a0a] border-white/20 text-white/70 rounded-xl h-11 cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              {/* Right Column: Upload Cover Photo */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Upload Cover Photo
                </Label>
                <input
                  ref={coverUploadInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div
                  onClick={() => coverUploadInputRef.current?.click()}
                  className="flex-1 min-h-[300px] border border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-white/30 hover:text-white transition-colors cursor-pointer bg-white/2 relative overflow-hidden group/upload min-w-0"
                >
                  {coverPhotoPreview || coverPhoto ? (
                    <>
                      <Image
                        src={coverPhotoPreview || coverPhoto}
                        alt="Cover Preview"
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover/upload:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center text-white z-10">
                        <IconCloudUpload className="size-8 mb-2" stroke={1.5} />
                        <p className="text-[11px] font-black uppercase tracking-widest">
                          Change Cover Photo
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <IconCloudUpload
                        className="size-8 mb-3 opacity-50"
                        stroke={1.5}
                      />
                      <p className="text-[11px] font-medium opacity-50 uppercase tracking-widest">
                        Upload Image
                      </p>
                      <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-wider">
                        Click to browse files
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <SectionHeader title="Professional Details" />
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Years of Experience
                </Label>
                <Input
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 5"
                  className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Certifications
                </Label>
                <Input
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  placeholder="e.g. FIFA Licensed Agent, UEFA B License"
                  className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Achievements
                </Label>
                <Input
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="e.g. Represented 10+ professional players"
                  className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Agency Name
                  </Label>
                  <Input
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. Pro Talent Global Agency"
                    className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Official Website
                  </Label>
                  <Input
                    value={officialWebsite}
                    onChange={(e) => setOfficialWebsite(e.target.value)}
                    placeholder="https://..."
                    className="bg-[#0a0a0a] border-white/20 text-white rounded-xl h-11 focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <SectionHeader title="Biography" />
            <div className="flex flex-col gap-1.5">
              <Label className="text-gray-300 text-xs ml-1 font-medium">
                Professional Bio
              </Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself and your sports agency work..."
                className="min-h-32 bg-[#0a0a0a] border-white/20 text-white rounded-xl resize-none p-4 text-sm focus:border-white/40 focus:ring-1 focus:ring-white/40"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              disabled={isUpdating}
              onClick={handleSave}
              className="bg-[#E31B23] hover:bg-[#C2181F] text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#E31B23]/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <IconLoader2 className="animate-spin size-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentProfile;
