"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  IconCircleCheck,
  IconPencil,
  IconUpload,
  IconCalendar,
  IconX,
  IconMapPin,
  IconCalendarEvent,
  IconLoader2,
} from "@tabler/icons-react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useGetMyAcademyProfileQuery,
  useUpdateAcademyProfileMutation,
} from "@/redux/features/academy/academyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AcademyProfile = () => {
  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetMyAcademyProfileQuery();
  const [updateAcademyProfile, { isLoading: isUpdatingProfile }] =
    useUpdateAcademyProfileMutation();

  const profileData = profileResponse?.data;

  // Form states: Section 1 - Academy Information
  const [academyName, setAcademyName] = useState("");
  const [nationality, setNationality] = useState("");
  const [academyCategory, setAcademyCategory] = useState("");
  const [dateOfEstablishment, setDateOfEstablishment] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");

  // Upload states
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Form states: Section 2 - About the Academy
  const [description, setDescription] = useState("");
  const [visionAndMission, setVisionAndMission] = useState("");
  const [trainingPhilosophy, setTrainingPhilosophy] = useState("");

  // File input refs
  const coverPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Sync API data to form state when loaded
  useEffect(() => {
    if (profileData) {
      setAcademyName(
        profileData.name ||
          profileData.academyName ||
          profileData.clubName ||
          ""
      );
      setNationality(
        profileData.nationality ||
          profileData.country ||
          profileData.locationText ||
          profileData.location ||
          ""
      );
      setAcademyCategory(
        profileData.category || profileData.academyCategory || ""
      );
      setDateOfEstablishment(
        profileData.dateOfEstablishmentFormatted ||
          profileData.dateOfEstablishment ||
          (profileData.foundedYear ? `01/01/${profileData.foundedYear}` : "")
      );
      setContact(
        profileData.contactPhone ||
          profileData.contact ||
          profileData.userId?.phone ||
          ""
      );
      setEmail(
        profileData.contactEmail ||
          profileData.email ||
          profileData.userId?.email ||
          ""
      );

      setDescription(
        profileData.description ||
          profileData.aboutAcademy?.description ||
          ""
      );
      setVisionAndMission(
        profileData.visionAndMission ||
          profileData.aboutAcademy?.visionAndMission ||
          ""
      );
      setTrainingPhilosophy(
        profileData.trainingPhilosophy ||
          profileData.aboutAcademy?.trainingPhilosophy ||
          ""
      );

      if (profileData.coverPhoto || profileData.bannerInfo?.coverPhoto) {
        setCoverPhotoPreview(
          profileData.coverPhoto || profileData.bannerInfo?.coverPhoto || ""
        );
      }
      if (profileData.logo || profileData.bannerInfo?.logo) {
        setLogoPreview(
          profileData.logo || profileData.bannerInfo?.logo || ""
        );
      }
    }
  }, [profileData]);

  // Clean up object URLs on unmount
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

  // File handlers
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setCoverPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverPhotoPreview(previewUrl);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo size must be less than 5MB");
      return;
    }

    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };

  // Direct cover upload from DashboardHero button
  const handleDirectCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setIsUploadingCover(true);
    const previewUrl = URL.createObjectURL(file);
    setCoverPhotoPreview(previewUrl);
    setCoverPhotoFile(file);

    try {
      const formData = new FormData();
      formData.append("coverPhoto", file);
      formData.append("data", JSON.stringify({}));
      await updateAcademyProfile(formData).unwrap();
    } catch (err: any) {
      console.error("Failed to update cover photo:", err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Full form save
  const handleSave = async () => {
    try {
      const formData = new FormData();
      const textData = {
        name: academyName,
        nationality,
        category: academyCategory,
        dateOfEstablishment,
        contactPhone: contact,
        contactEmail: email,
        description,
        visionAndMission,
        trainingPhilosophy,
      };
      formData.append("data", JSON.stringify(textData));

      if (coverPhotoFile) {
        formData.append("coverPhoto", coverPhotoFile);
      }
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await updateAcademyProfile(formData).unwrap();
    } catch (err: any) {
      console.error("Failed to update academy profile:", err);
    }
  };

  const displayCoverPhoto =
    coverPhotoPreview ||
    profileData?.coverPhoto ||
    profileData?.bannerInfo?.coverPhoto ||
    "/placeholder_img.jpg";

  const displayLogo =
    logoPreview ||
    profileData?.logo ||
    profileData?.bannerInfo?.logo ||
    "/image 47.png";

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-black text-white font-orbitron uppercase tracking-tight">
          Academy Profile
        </h1>
        <p className="text-white/60 font-medium mt-2 text-lg">
          Your professional football Academy profile
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Academy Information Section */}
        <section className="bg-[#111111] rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <IconCircleCheck size={24} className="text-[#4ADE80]" />
              <h2 className="text-xl font-black text-white font-orbitron uppercase">
                Academy Information
              </h2>
            </div>
            <button
              type="button"
              onClick={() => coverPhotoInputRef.current?.click()}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all cursor-pointer"
              title="Edit Profile Photos"
            >
              <IconPencil size={18} />
            </button>
          </div>

          {/* Profile Hero Card with Dynamic Cover Photo */}
          <DashboardHero
            backgroundImage={displayCoverPhoto}
            logoImage={displayLogo}
            badgeText={
              profileData?.activeStatus ||
              profileData?.tier ||
              "Active Academy"
            }
            title={academyName || "Santos FC Academy"}
            subtitle={academyCategory || "Premier League Academy"}
            details={[
              {
                icon: <IconCalendarEvent size={16} />,
                text:
                  profileData?.foundedText ||
                  (profileData?.foundedYear
                    ? `Founded ${profileData.foundedYear}`
                    : "Founded 2018"),
              },
              {
                icon: <IconMapPin size={16} className="text-green-500" />,
                text: nationality || "São Paulo, Brazil",
              },
            ]}
            contacts={[
              {
                type: "phone",
                label: "Contact",
                value: contact || "+55 11 9999-8888",
              },
              {
                type: "email",
                label: "Email",
                value: email || "contact@santosfc.academy",
              },
            ]}
            isLoading={isLoadingProfile}
            onCoverUpload={handleDirectCoverUpload}
            isUploadingCover={isUploadingCover}
          />

          {/* Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 mt-4">
            {/* Left Column - Inputs */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Academy Name
                </Label>
                <Input
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="Santos FC Academy"
                  className="bg-black/40 border-white/10 h-12 rounded-xl text-white font-medium focus:border-white/20 transition-all px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Nationality
                </Label>
                <Input
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="São Paulo, Brazil"
                  className="bg-black/40 border-white/10 h-12 rounded-xl text-white font-medium focus:border-white/20 transition-all px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Academy Category
                </Label>
                <Input
                  value={academyCategory}
                  onChange={(e) => setAcademyCategory(e.target.value)}
                  placeholder="Premier League Academy"
                  className="bg-black/40 border-white/10 h-12 rounded-xl text-white font-medium focus:border-white/20 transition-all px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Date of Establishment
                </Label>
                <div className="relative">
                  <Input
                    value={dateOfEstablishment}
                    onChange={(e) => setDateOfEstablishment(e.target.value)}
                    placeholder="01/01/2018"
                    className="bg-black/40 border-white/10 h-12 rounded-xl text-white font-medium focus:border-white/20 transition-all px-4 pr-12"
                  />
                  <IconCalendar
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Contact
                </Label>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+55 11 9999-8888"
                  className="bg-black/40 border-white/10 h-12 rounded-xl text-white font-medium focus:border-white/20 transition-all px-4"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Email
                </Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@santosfc.academy"
                  className="bg-black/40 border-white/10 h-12 rounded-xl text-white font-medium focus:border-white/20 transition-all px-4"
                />
              </div>
            </div>

            {/* Right Column - Uploads */}
            <div className="flex flex-col gap-8 h-full">
              {/* Upload Cover Photo */}
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Upload Cover Photo
                </Label>
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
                    "relative h-[380px] border-2 border-dashed border-white/10 hover:border-white/20 bg-black/20 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden transition-all group",
                    displayCoverPhoto ? "border-solid border-white/20" : ""
                  )}
                >
                  {displayCoverPhoto ? (
                    <>
                      <Image
                        src={displayCoverPhoto}
                        alt="Cover Photo Preview"
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.srcset = "";
                          target.src = "/placeholder_img.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="p-3 rounded-xl bg-white/10 text-white">
                          <IconUpload size={24} />
                        </div>
                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">
                          Change Cover Photo
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-all">
                        <IconUpload
                          size={24}
                          className="text-white/60 group-hover:text-white transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                        Upload image
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Upload Logo */}
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                  Upload Logo
                </Label>
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
                    "relative h-[180px] border-2 border-dashed border-white/10 hover:border-white/20 bg-black/20 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden transition-all group",
                    displayLogo ? "border-solid border-white/20" : ""
                  )}
                >
                  {displayLogo ? (
                    <>
                      <Image
                        src={displayLogo}
                        alt="Logo Preview"
                        fill
                        unoptimized
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.srcset = "";
                          target.src = "/image 47.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="p-3 rounded-xl bg-white/10 text-white">
                          <IconUpload size={24} />
                        </div>
                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">
                          Change Logo
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-all">
                        <IconUpload
                          size={24}
                          className="text-white/60 group-hover:text-white transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                        Upload image
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About the Academy Section */}
        <section className="bg-[#111111] rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <IconCircleCheck size={24} className="text-[#4ADE80]" />
              <h2 className="text-xl font-black text-white font-orbitron uppercase">
                About the Academy
              </h2>
            </div>
            <button
              type="button"
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all"
            >
              <IconPencil size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Santos FC Academy description..."
                className="bg-black/40 border-white/10 min-h-[100px] rounded-2xl text-white font-medium focus:border-white/20 transition-all p-4 resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                Vision & Mission
              </Label>
              <Textarea
                value={visionAndMission}
                onChange={(e) => setVisionAndMission(e.target.value)}
                placeholder="Vision and mission statement..."
                className="bg-black/40 border-white/10 min-h-[100px] rounded-2xl text-white font-medium focus:border-white/20 transition-all p-4 resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">
                Training Philosophy
              </Label>
              <Textarea
                value={trainingPhilosophy}
                onChange={(e) => setTrainingPhilosophy(e.target.value)}
                placeholder="Training philosophy..."
                className="bg-black/40 border-white/10 min-h-[100px] rounded-2xl text-white font-medium focus:border-white/20 transition-all p-4 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Footer Buttons */}
        <div className="flex justify-end items-center gap-4 mt-12">
          <button
            type="button"
            onClick={() => {
              if (profileData) {
                setAcademyName(profileData.name || profileData.academyName || "");
                setNationality(profileData.nationality || profileData.country || "");
                setAcademyCategory(profileData.category || profileData.academyCategory || "");
                setDateOfEstablishment(
                  profileData.dateOfEstablishmentFormatted ||
                    profileData.dateOfEstablishment ||
                    ""
                );
                setContact(profileData.contactPhone || profileData.contact || "");
                setEmail(profileData.contactEmail || profileData.email || "");
                setDescription(profileData.description || "");
                setVisionAndMission(profileData.visionAndMission || "");
                setTrainingPhilosophy(profileData.trainingPhilosophy || "");
                setCoverPhotoPreview(
                  profileData.coverPhoto || profileData.bannerInfo?.coverPhoto || ""
                );
                setLogoPreview(
                  profileData.logo || profileData.bannerInfo?.logo || ""
                );
                setCoverPhotoFile(null);
                setLogoFile(null);
              }
            }}
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-white/5 border border-white/10 text-white/60 hover:text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all cursor-pointer"
          >
            Cancel <IconX size={18} />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdatingProfile}
            className="flex items-center gap-2 bg-[#00FF85] hover:bg-[#00E676] text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_0_20px_rgba(0,255,133,0.2)] cursor-pointer disabled:opacity-50"
          >
            {isUpdatingProfile ? (
              <>
                <IconLoader2 size={18} className="animate-spin text-black" />
                Saving...
              </>
            ) : (
              <>
                <IconCircleCheck size={18} /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademyProfile;
