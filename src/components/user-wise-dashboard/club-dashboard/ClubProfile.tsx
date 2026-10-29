/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  IconCheck, 
  IconTrophy, 
  IconUpload, 
  IconCalendar,
  IconLoader2,
  IconTrash,
  IconShieldCheck,
  IconWorld,
  IconFileText,
  IconUserCheck,
  IconBuildingCommunity,
  IconFileDescription,
  IconPaperclip
} from "@tabler/icons-react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import { 
  SettingsInput 
} from "@/components/dashboard/DashboardSettingsElements";
import { 
  useGetClubProfileQuery, 
  useUpdateClubProfileMutation 
} from "@/redux/features/club/clubApi";
import { IClubAchievementItem } from "@/types/club.type";
import { cn } from "@/lib/utils";

const ClubProfile = () => {
  // Query API: GET {{baseUrl}}/clubs/club-profile
  const { data: profileResponse, isLoading, isFetching } = useGetClubProfileQuery();
  // Mutation API: PATCH {{baseUrl}}/clubs/club-profile (Multipart Form-Data)
  const [updateClubProfile] = useUpdateClubProfileMutation();

  // Track which section is currently saving
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const profileData = profileResponse?.data;

  // Form states: Section 1 - Academy / Club Information
  const [clubName, setClubName] = useState("");
  const [clubCountry, setClubCountry] = useState("");
  const [clubLeague, setClubLeague] = useState("");
  const [dateOfEstablishment, setDateOfEstablishment] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  // Upload states: Images
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Form states: Section 2 - About Club
  const [description, setDescription] = useState("");
  const [visionAndMission, setVisionAndMission] = useState("");

  // Form states: Section 3 - Verification & Documents
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [footballAssociation, setFootballAssociation] = useState("");
  const [authorizedRepresentativeName, setAuthorizedRepresentativeName] = useState("");
  const [authorizedRepresentativeJobTitle, setAuthorizedRepresentativeJobTitle] = useState("");
  const [clubRegistrationDocFile, setClubRegistrationDocFile] = useState<File | null>(null);
  const [authorizationDocFile, setAuthorizationDocFile] = useState<File | null>(null);

  // Form states: Section 4 - Achievements
  const [achievements, setAchievements] = useState<IClubAchievementItem[]>([]);
  const [achievementYear, setAchievementYear] = useState("");
  const [achievementChampionship, setAchievementChampionship] = useState("");
  const [achievementVenue, setAchievementVenue] = useState("");

  // File input refs
  const coverPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const clubRegDocInputRef = useRef<HTMLInputElement | null>(null);
  const authDocInputRef = useRef<HTMLInputElement | null>(null);

  // Sync API data to form state when loaded
  useEffect(() => {
    if (profileData) {
      setClubName(profileData.clubName || profileData.name || "");
      setClubCountry(profileData.clubCountry || profileData.country || "");
      setClubLeague(profileData.clubLeague || profileData.league || "");
      setDateOfEstablishment(
        profileData.dateOfEstablishment !== undefined && profileData.dateOfEstablishment !== null
          ? String(profileData.dateOfEstablishment)
          : profileData.establishedYear !== undefined && profileData.establishedYear !== null
          ? String(profileData.establishedYear)
          : ""
      );
      setContact(profileData.contact || profileData.contactPhone || profileData.userId?.phone || "");
      setEmail(profileData.email || profileData.contactEmail || profileData.userId?.email || "");

      setDescription(profileData.description || profileData.aboutClub?.description || "");
      setVisionAndMission(profileData.visionAndMission || profileData.aboutClub?.visionAndMission || "");

      setOfficialWebsite(profileData.officialWebsite || profileData.verification?.officialWebsite || "");
      setFootballAssociation(profileData.footballAssociation || profileData.verification?.footballAssociation || "");
      setAuthorizedRepresentativeName(
        profileData.authorizedRepresentativeName ||
        profileData.verification?.authorizedRepresentativeName ||
        ""
      );
      setAuthorizedRepresentativeJobTitle(
        profileData.authorizedRepresentativeJobTitle ||
        profileData.verification?.authorizedRepresentativeJobTitle ||
        profileData.clubType ||
        ""
      );

      if (profileData.bannerInfo?.coverPhoto) {
        setCoverPhotoPreview(profileData.bannerInfo.coverPhoto);
      }
      if (profileData.logo || profileData.bannerInfo?.logo) {
        setLogoPreview(profileData.logo || profileData.bannerInfo?.logo || "");
      }

      if (profileData.achievements && Array.isArray(profileData.achievements)) {
        setAchievements(profileData.achievements);
      }
    }
  }, [profileData]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (coverPhotoPreview && coverPhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPhotoPreview);
      }
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [coverPhotoPreview, logoPreview]);

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhotoFile(file);
      const url = URL.createObjectURL(file);
      setCoverPhotoPreview(url);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const getFormattedAchievements = (extraItem?: IClubAchievementItem) => {
    const list = extraItem ? [...achievements, extraItem] : [...achievements];
    return list.map((item) => ({
      year: Number(item.year) || item.year,
      championship: item.championship || item.title || "",
      venue: item.venue || "",
    }));
  };

  const buildBasePayload = (currentAchievements?: IClubAchievementItem[]) => ({
    clubName,
    clubCountry,
    clubLeague,
    dateOfEstablishment,
    contact,
    email,
    description,
    visionAndMission,
    achievements: currentAchievements || getFormattedAchievements(),
    officialWebsite,
    footballAssociation,
    authorizedRepresentativeName,
    authorizedRepresentativeJobTitle,
  });

  // Section 1: Save Academy Information (Basic Details + Cover & Logo)
  const handleSaveInfo = async () => {
    setSavingSection("info");
    try {
      const formData = new FormData();
      const payload = buildBasePayload();
      formData.append("data", JSON.stringify(payload));

      if (coverPhotoFile) {
        formData.append("coverPhoto", coverPhotoFile);
      }
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await updateClubProfile(formData).unwrap();
      setCoverPhotoFile(null);
      setLogoFile(null);
    } catch {
      // Handled by updateClubProfile toast
    } finally {
      setSavingSection(null);
    }
  };

  // Section 2: Save About the Club (Description & Vision/Mission)
  const handleSaveAbout = async () => {
    setSavingSection("about");
    try {
      const formData = new FormData();
      const payload = buildBasePayload();
      formData.append("data", JSON.stringify(payload));

      await updateClubProfile(formData).unwrap();
    } catch {
      // Handled by updateClubProfile toast
    } finally {
      setSavingSection(null);
    }
  };

  // Section 3: Save Verification & Documents
  const handleSaveVerification = async () => {
    setSavingSection("verification");
    try {
      const formData = new FormData();
      const payload = buildBasePayload();
      formData.append("data", JSON.stringify(payload));

      if (clubRegistrationDocFile) {
        formData.append("clubRegistrationDocument", clubRegistrationDocFile);
      }
      if (authorizationDocFile) {
        formData.append("authorizationDocument", authorizationDocFile);
      }

      await updateClubProfile(formData).unwrap();
      setClubRegistrationDocFile(null);
      setAuthorizationDocFile(null);
    } catch {
      // Handled by updateClubProfile toast
    } finally {
      setSavingSection(null);
    }
  };

  // Section 4: Save Achievements
  const handleSaveAchievements = async () => {
    setSavingSection("achievements");
    try {
      let currentAchievements = [...achievements];
      if (achievementYear || achievementChampionship || achievementVenue) {
        const newItem: IClubAchievementItem = {
          year: Number(achievementYear) || achievementYear,
          championship: achievementChampionship,
          venue: achievementVenue,
        };
        currentAchievements = [...currentAchievements, newItem];
        setAchievements(currentAchievements);
        setAchievementYear("");
        setAchievementChampionship("");
        setAchievementVenue("");
      }

      const formatted = currentAchievements.map((item) => ({
        year: Number(item.year) || item.year,
        championship: item.championship || item.title || "",
        venue: item.venue || "",
      }));

      const formData = new FormData();
      const payload = buildBasePayload(formatted);
      formData.append("data", JSON.stringify(payload));

      await updateClubProfile(formData).unwrap();
    } catch {
      // Handled by updateClubProfile toast
    } finally {
      setSavingSection(null);
    }
  };

  const handleAddAchievement = () => {
    if (!achievementYear && !achievementChampionship && !achievementVenue) return;
    const newItem: IClubAchievementItem = {
      year: Number(achievementYear) || achievementYear,
      championship: achievementChampionship,
      venue: achievementVenue,
    };
    setAchievements((prev) => [...prev, newItem]);
    setAchievementYear("");
    setAchievementChampionship("");
    setAchievementVenue("");
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Skeleton loading view
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 pb-12 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-64 bg-white/10 rounded-lg" />
          <div className="h-4 w-72 bg-white/5 rounded-md" />
        </div>

        <div className="p-5 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6">
          <div className="h-6 w-48 bg-white/10 rounded-md" />
          <div className="h-72 w-full bg-white/5 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            <div className="flex flex-col gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-white/5 rounded-xl" />
              ))}
            </div>
            <div className="flex flex-col gap-6">
              <div className="h-44 w-full bg-white/5 rounded-2xl" />
              <div className="h-32 w-full bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Derived banner details
  const displayTitle = clubName || profileData?.clubName || profileData?.name || "LIVERPOOL FC";
  const displayBadge = profileData?.tier || profileData?.activeStatus || profileData?.bannerInfo?.tier || "ACTIVE CLUB";
  const displaySubtitle = profileData?.clubType || profileData?.bannerInfo?.category || "Chief Scout / Director";
  const displayCoverPhoto = coverPhotoPreview || profileData?.bannerInfo?.coverPhoto || "/barcelona-la-liga-champions.avif";
  const displayLogo = logoPreview || profileData?.logo || profileData?.bannerInfo?.logo || "";
  const displayEst = dateOfEstablishment || (profileData?.establishedYear ? String(profileData.establishedYear) : "1878");
  const displayCountry = clubCountry || profileData?.country || "Bangladesh";
  const displayContact = contact || "+8801733333333";
  const displayEmail = email || "club2@yopmail.com";

  const verificationStatus = profileData?.verification?.status || profileData?.verificationStatus || "PENDING";
  const existingClubRegDoc = profileData?.verification?.clubRegistrationDocument;
  const existingAuthDoc = profileData?.verification?.authorizationDocument;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Club Profile</h1>
          <p className="text-gray-500 text-sm mt-2">Your professional football Club Profile</p>
        </div>
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <IconLoader2 className="animate-spin size-4 text-[#E31B23]" />
            <span>Syncing profile data...</span>
          </div>
        )}
      </div>

      {/* SECTION 1: Academy / Club Information */}
      <div className="p-5 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6 md:gap-8 min-w-0 w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <IconCheck className="size-4" />
          </div>
          <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">Academy Information</h3>
        </div>

        {/* Hero Preview */}
        <div className="rounded-3xl overflow-hidden border border-white/10">
          <DashboardHero 
            backgroundImage={displayCoverPhoto}
            badgeText={displayBadge}
            title={displayTitle}
            subtitle={displaySubtitle}
            details={[
              { text: `Est. ${displayEst}` },
              { text: displayCountry }
            ]}
            contacts={[
              { type: "phone", label: "Contact", value: displayContact },
              { type: "email", label: "Email", value: displayEmail },
            ]}
            logoImage={displayLogo}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pt-4">
          <div className="flex flex-col gap-4 md:gap-6 w-full min-w-0">
            <SettingsInput 
              label="Club Name" 
              placeholder="e.g. Bashundhara Kings" 
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
            <SettingsInput 
              label="Club Country" 
              placeholder="e.g. Bangladesh" 
              value={clubCountry}
              onChange={(e) => setClubCountry(e.target.value)}
            />
            <SettingsInput 
              label="Club League" 
              placeholder="e.g. BPL (Premier League)" 
              value={clubLeague}
              onChange={(e) => setClubLeague(e.target.value)}
            />
            <SettingsInput 
              label="Date of Establishment" 
              placeholder="e.g. 2026" 
              icon={<IconCalendar className="size-4.5" />} 
              value={dateOfEstablishment}
              onChange={(e) => setDateOfEstablishment(e.target.value)}
            />
            <SettingsInput 
              label="Contact" 
              placeholder="e.g. +8801733333333" 
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <SettingsInput 
              label="Email" 
              placeholder="e.g. club@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-6 md:gap-8 w-full min-w-0">
            {/* Upload Cover Photo */}
            <div className="flex flex-col gap-4">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Upload Cover Photo
              </label>
              <input
                ref={coverPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoChange}
              />
              <div 
                onClick={() => coverPhotoInputRef.current?.click()}
                className={cn(
                  "relative aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-white/2 flex flex-col items-center justify-center gap-3 group hover:border-[#E31B23]/40 transition-all cursor-pointer overflow-hidden",
                  coverPhotoPreview ? "border-solid border-white/20" : ""
                )}
              >
                {coverPhotoPreview ? (
                  <>
                    <Image
                      src={coverPhotoPreview}
                      alt="Cover Photo Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="p-3 rounded-xl bg-white/10 text-white">
                        <IconUpload className="size-6" />
                      </div>
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">Change Cover Photo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover:bg-[#E31B23]/10 group-hover:text-[#E31B23] transition-all">
                      <IconUpload className="size-6" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Upload image</span>
                  </>
                )}
              </div>
            </div>

            {/* Upload Logo */}
            <div className="flex flex-col gap-4">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Upload Logo
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <div 
                onClick={() => logoInputRef.current?.click()}
                className={cn(
                  "relative h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/2 flex flex-col items-center justify-center gap-3 group hover:border-[#E31B23]/40 transition-all cursor-pointer overflow-hidden",
                  logoPreview ? "border-solid border-white/20 bg-white/5" : ""
                )}
              >
                {logoPreview ? (
                  <>
                    <div className="relative size-20">
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="p-2 rounded-lg bg-white/10 text-white">
                        <IconUpload className="size-5" />
                      </div>
                      <span className="text-[9px] text-white font-bold uppercase tracking-widest">Change Logo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-white/5 text-white/40 group-hover:bg-[#E31B23]/10 group-hover:text-[#E31B23] transition-all">
                      <IconUpload className="size-6" />
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Upload image</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10 min-w-0 w-full">
          <button 
            type="button"
            onClick={handleSaveInfo}
            disabled={savingSection !== null}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E31B23] text-white text-xs font-black uppercase tracking-widest hover:bg-[#C1161D] transition-all shadow-[0_10px_30px_rgba(227,27,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {savingSection === "info" ? (
              <>
                <IconLoader2 className="animate-spin size-4" />
                <span>Saving Info...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 2: About the Club */}
      <div className="p-5 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6 md:gap-8 min-w-0 w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <IconCheck className="size-4" />
          </div>
          <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">About the Club</h3>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 px-5 py-4 rounded-xl bg-[#0D0D0D] border-2 border-white/10 text-white text-sm focus:border-[#E31B23]/50 focus:outline-none transition-all resize-none placeholder:text-gray-600"
              placeholder="Santos FC Academy is committed to developing world-class football talent..."
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vision & Mission</label>
            <textarea 
              value={visionAndMission}
              onChange={(e) => setVisionAndMission(e.target.value)}
              className="w-full h-32 px-5 py-4 rounded-xl bg-[#0D0D0D] border-2 border-white/10 text-white text-sm focus:border-[#E31B23]/50 focus:outline-none transition-all resize-none placeholder:text-gray-600"
              placeholder="To nurture the next generation of football stars..."
            />
          </div>
        </div>

        {/* Section 2 Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10 min-w-0 w-full">
          <button 
            type="button"
            onClick={handleSaveAbout}
            disabled={savingSection !== null}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E31B23] text-white text-xs font-black uppercase tracking-widest hover:bg-[#C1161D] transition-all shadow-[0_10px_30px_rgba(227,27,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {savingSection === "about" ? (
              <>
                <IconLoader2 className="animate-spin size-4" />
                <span>Saving About...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 3: Official Verification & Representative */}
      <div className="p-5 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6 md:gap-8 min-w-0 w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-[#E31B23]/10 text-[#E31B23] border border-[#E31B23]/20">
              <IconShieldCheck className="size-4" />
            </div>
            <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">Verification & Documents</h3>
          </div>
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            verificationStatus === "APPROVED" 
              ? "bg-green-500/10 text-green-400 border-green-500/30"
              : verificationStatus === "REJECTED"
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          )}>
            Status: {verificationStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-w-0 w-full">
          <SettingsInput 
            label="Official Website" 
            placeholder="e.g. https://www.bashundharakings.com" 
            icon={<IconWorld className="size-4.5" />}
            value={officialWebsite}
            onChange={(e) => setOfficialWebsite(e.target.value)}
          />
          <SettingsInput 
            label="Football Association" 
            placeholder="e.g. BFF, AFC, UEFA, RFEF" 
            icon={<IconBuildingCommunity className="size-4.5" />}
            value={footballAssociation}
            onChange={(e) => setFootballAssociation(e.target.value)}
          />
          <SettingsInput 
            label="Authorized Representative Name" 
            placeholder="e.g. David Martinez" 
            icon={<IconUserCheck className="size-4.5" />}
            value={authorizedRepresentativeName}
            onChange={(e) => setAuthorizedRepresentativeName(e.target.value)}
          />
          <SettingsInput 
            label="Authorized Representative Job Title" 
            placeholder="e.g. Chief Scout / Director" 
            icon={<IconFileText className="size-4.5" />}
            value={authorizedRepresentativeJobTitle}
            onChange={(e) => setAuthorizedRepresentativeJobTitle(e.target.value)}
          />
        </div>

        {/* Documents Upload Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-2">
          {/* Club Registration Document */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <IconPaperclip className="size-3.5 text-[#E31B23]" />
                <span>Club Registration Document</span>
              </label>
              {existingClubRegDoc && !clubRegistrationDocFile && (
                <a 
                  href={existingClubRegDoc} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline font-bold"
                >
                  View Current
                </a>
              )}
            </div>
            <input 
              ref={clubRegDocInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setClubRegistrationDocFile(file);
              }}
            />
            <div 
              onClick={() => clubRegDocInputRef.current?.click()}
              className="p-3 rounded-lg border border-dashed border-white/15 hover:border-[#E31B23]/40 bg-white/2 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-xs truncate">
                <IconFileDescription className="size-4 text-white/50 shrink-0" />
                <span className="truncate text-white/80">
                  {clubRegistrationDocFile ? clubRegistrationDocFile.name : (existingClubRegDoc ? "Replace Document" : "Select Document (PDF/Image)")}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#E31B23] shrink-0 ml-2">Browse</span>
            </div>
            {clubRegistrationDocFile && (
              <button
                type="button"
                onClick={() => setClubRegistrationDocFile(null)}
                className="text-[10px] text-red-400 hover:text-red-300 text-left font-bold"
              >
                Clear selected file
              </button>
            )}
          </div>

          {/* Authorization Document */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <IconPaperclip className="size-3.5 text-[#E31B23]" />
                <span>Authorization Document</span>
              </label>
              {existingAuthDoc && !authorizationDocFile && (
                <a 
                  href={existingAuthDoc} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] text-emerald-400 hover:underline font-bold"
                >
                  View Current
                </a>
              )}
            </div>
            <input 
              ref={authDocInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAuthorizationDocFile(file);
              }}
            />
            <div 
              onClick={() => authDocInputRef.current?.click()}
              className="p-3 rounded-lg border border-dashed border-white/15 hover:border-[#E31B23]/40 bg-white/2 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-xs truncate">
                <IconFileDescription className="size-4 text-white/50 shrink-0" />
                <span className="truncate text-white/80">
                  {authorizationDocFile ? authorizationDocFile.name : (existingAuthDoc ? "Replace Document" : "Select Document (PDF/Image)")}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#E31B23] shrink-0 ml-2">Browse</span>
            </div>
            {authorizationDocFile && (
              <button
                type="button"
                onClick={() => setAuthorizationDocFile(null)}
                className="text-[10px] text-red-400 hover:text-red-300 text-left font-bold"
              >
                Clear selected file
              </button>
            )}
          </div>
        </div>

        {/* Section 3 Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10 min-w-0 w-full">
          <button 
            type="button"
            onClick={handleSaveVerification}
            disabled={savingSection !== null}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E31B23] text-white text-xs font-black uppercase tracking-widest hover:bg-[#C1161D] transition-all shadow-[0_10px_30px_rgba(227,27,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {savingSection === "verification" ? (
              <>
                <IconLoader2 className="animate-spin size-4" />
                <span>Saving Verification...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 4: Achievements */}
      <div className="p-5 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-6 md:gap-8 min-w-0 w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-white/10 text-white border border-white/20">
              <IconTrophy className="size-4" />
            </div>
            <h3 className="text-xl font-bold text-white italic uppercase tracking-tight">Achievements</h3>
          </div>
          {(achievementYear || achievementChampionship || achievementVenue) && (
            <button
              type="button"
              onClick={handleAddAchievement}
              className="text-xs font-bold text-[#E31B23] hover:text-[#C1161D] uppercase tracking-wider transition-colors"
            >
              + Add to list
            </button>
          )}
        </div>

        {/* Existing Achievements list if any */}
        {achievements.length > 0 && (
          <div className="flex flex-col gap-3 pb-2">
            {achievements.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/2 text-sm"
              >
                <div className="flex items-center gap-4 text-white">
                  <span className="font-bold text-[#E31B23]">{item.year || "N/A"}</span>
                  <span className="font-semibold">{item.championship || item.title || "Championship"}</span>
                  {item.venue && <span className="text-white/40 text-xs">({item.venue})</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAchievement(index)}
                  className="text-white/40 hover:text-red-500 transition-colors p-1"
                >
                  <IconTrash className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 min-w-0 w-full">
          <SettingsInput 
            label="Year" 
            placeholder="Enter Year (e.g. 2024)" 
            value={achievementYear}
            onChange={(e) => setAchievementYear(e.target.value)}
          />
          <SettingsInput 
            label="Championship" 
            placeholder="Enter Championship" 
            value={achievementChampionship}
            onChange={(e) => setAchievementChampionship(e.target.value)}
          />
          <SettingsInput 
            label="Venue" 
            placeholder="Enter Venue" 
            value={achievementVenue}
            onChange={(e) => setAchievementVenue(e.target.value)}
          />
        </div>

        {/* Section 4 Save Button */}
        <div className="flex justify-end pt-4 border-t border-white/10 min-w-0 w-full">
          <button 
            type="button"
            onClick={handleSaveAchievements}
            disabled={savingSection !== null}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E31B23] text-white text-xs font-black uppercase tracking-widest hover:bg-[#C1161D] transition-all shadow-[0_10px_30px_rgba(227,27,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {savingSection === "achievements" ? (
              <>
                <IconLoader2 className="animate-spin size-4" />
                <span>Saving Achievements...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
