/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconBallFootball,
  IconAward,
  IconShield,
  IconPencil,
} from "@tabler/icons-react";
import Image from "next/image";

interface ChildProfileForm {
  fullName: string;
  dob: string;
  height: number;
  weight: number;
  position: string;
  preferredFoot: string;
  academy: string;
}

const ManageChildProfile = () => {
const [isEditing, setIsEditing] = useState(false);
const [profileData, setProfileData] = useState<ChildProfileForm>({
fullName: "Marcus Silva",
dob: "2010-05-15",
height: 165,
weight: 58,
position: "Forward",
preferredFoot: "Right",
academy: "São Paulo Academy"
});

const {
register,
handleSubmit,
formState: { isSubmitting }
} = useForm<ChildProfileForm>({
defaultValues: profileData
});

const onSubmit = async (data: ChildProfileForm) => {
const toastId = toast.loading("Saving changes to child profile...");
try {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  setProfileData(data);
  setIsEditing(false);
  toast.success("Profile updated successfully!", { id: toastId });
} catch (error) {
  toast.error("Failed to update profile.", { id: toastId });
}
};

return (
<div className="space-y-8 pb-24 md:pb-12">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
    <div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
        Child <span className="text-primary italic">Profiles</span>
      </h1>
      <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 leading-relaxed">
        Manage your children&apos;s details, CV stats, and positions
      </p>
    </div>
    {!isEditing && (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full md:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white px-5 py-3 md:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#E31B23]/20 shrink-0"
      >
        <IconPencil size={16} />
        <span>Edit Profile</span>
      </button>
    )}
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Profile Card & Badges */}
    <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col gap-6 items-center text-center">
      <div className="relative">
        <Image
          src="https://i.pravatar.cc/150?u=marcus"
          alt="Marcus Silva"
          width={128}
          height={128}
          className="rounded-full object-cover border-4 border-primary/20"
        />
        <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-[#0A0A0A] text-black">
          <IconAward size={18} />
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white font-orbitron">{profileData.fullName}</h2>
        <p className="text-xs text-primary font-bold uppercase tracking-widest">{profileData.position}</p>
      </div>

      <div className="flex justify-center gap-2">
        <Badge className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-bold px-3 py-1 rounded-full text-xs">
          GOLD PROFILE
        </Badge>
        <Badge className="bg-green-500/10 border-green-500/30 text-green-400 font-bold px-3 py-1 rounded-full text-xs">
          VERIFIED CV
        </Badge>
      </div>

      <div className="w-full border-t border-white/5 pt-6 space-y-4 text-left">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <IconBallFootball size={18} className="text-primary/70" />
          <span>Academy: <strong className="text-white font-medium">{profileData.academy}</strong></span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <IconShield size={18} className="text-primary/70" />
          <span>Coaches Assigned: <strong className="text-white font-medium">Didier Deschamps</strong></span>
        </div>
      </div>
    </div>

    {/* Profile Details / Form */}
    <div className="lg:col-span-2 bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl">
      <h2 className="text-xl font-black uppercase text-white font-orbitron mb-6">
        {isEditing ? "Edit Profile Info" : "Profile Details"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Full Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              {...register("fullName", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50"
            />
          </div>

          {/* DOB */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Date of Birth
            </label>
            <input
              type="date"
              disabled={!isEditing}
              {...register("dob", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50 scheme-dark"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Height */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Height (cm)
            </label>
            <input
              type="number"
              disabled={!isEditing}
              {...register("height", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Weight (kg)
            </label>
            <input
              type="number"
              disabled={!isEditing}
              {...register("weight", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50"
            />
          </div>

          {/* Preferred Foot */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Preferred Foot
            </label>
            <select
              disabled={!isEditing}
              {...register("preferredFoot")}
              className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50"
            >
              <option value="Right" className="bg-black text-white">Right Foot</option>
              <option value="Left" className="bg-black text-white">Left Foot</option>
              <option value="Ambidextrous" className="bg-black text-white">Both Feet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Position */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Position
            </label>
            <select
              disabled={!isEditing}
              {...register("position")}
              className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50"
            >
              <option value="Forward" className="bg-black text-white">Forward / Striker</option>
              <option value="Midfielder" className="bg-black text-white">Midfielder</option>
              <option value="Defender" className="bg-black text-white">Defender</option>
              <option value="Goalkeeper" className="bg-black text-white">Goalkeeper</option>
            </select>
          </div>

          {/* Academy */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Academy Location
            </label>
            <input
              type="text"
              disabled={!isEditing}
              {...register("academy", { required: true })}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary/50 transition-all text-sm disabled:opacity-50"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-4 pt-6 mt-4 justify-end border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-11 px-6 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 transition-all uppercase tracking-wider flex items-center justify-center"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 bg-[#E31B23] hover:bg-[#C2181F] text-white px-8 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#E31B23]/20 flex items-center justify-center"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  </div>
</div>
);
}
export default ManageChildProfile;
