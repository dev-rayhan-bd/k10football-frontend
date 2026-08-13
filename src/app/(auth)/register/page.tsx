/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/hooks/reduxHooks";
import { setAccessToken, setUser } from "@/redux/features/auth";
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconBallFootball,
  IconSchool,
  IconBuildingCommunity,
  IconBriefcase,
  IconUsers,
  IconClipboardText
} from "@tabler/icons-react";

type RoleType = "player" | "coach" | "academy" | "club" | "agent" | "parent";

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  // Player fields
  dob: string;
  position: string;
  height: string;
  weight: string;
  currentClub: string;

  // Coach fields
  experience: string;
  license: string;
  formation: string;

  // Academy fields
  academyName: string;
  academyLocation: string;
  academyLicense: string;
  academySize: string;

  // Club fields
  clubName: string;
  repTitle: string;
  leagueTier: string;
  clubCountry: string;

  // Agent fields
  agentLicense: string;
  agencyName: string;
  agentCountry: string;

  // Parent fields
  childName: string;
  childEmail: string;
  relationship: string;
}

const ROLES_INFO = [
  {
    id: "player" as RoleType,
    title: "Player",
    subtitle: "Player",
    description: "Create your football CV, track attributes, and showcase matches.",
    icon: IconBallFootball,
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400"
  },
  {
    id: "coach" as RoleType,
    title: "Coach",
    subtitle: "Coach",
    description: "Build CV, manage formations, evaluate players, and create reports.",
    icon: IconClipboardText,
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400"
  },
  {
    id: "academy" as RoleType,
    title: "Academy",
    subtitle: "Academy",
    description: "Manage players, training sessions, coaches, and tournaments.",
    icon: IconSchool,
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400"
  },
  {
    id: "club" as RoleType,
    title: "Club",
    subtitle: "Club",
    description: "Search talent, scout candidates, and shortlist players.",
    icon: IconBuildingCommunity,
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400"
  },
  {
    id: "agent" as RoleType,
    title: "Agent / Intermediary",
    subtitle: "Agent",
    description: "FIFA/FA licensed scouting and talent management.",
    icon: IconBriefcase,
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400"
  },
  {
    id: "parent" as RoleType,
    title: "Parent / Reporter",
    subtitle: "Parent",
    description: "Manage youth profiles, pay fees, and submit match stats.",
    icon: IconUsers,
    color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400"
  }
];

const RegisterPage = () => {
const router = useRouter();
const dispatch = useAppDispatch();
const [step, setStep] = useState<1 | 2>(1);
const [selectedRole, setSelectedRole] = useState<RoleType>("player");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const {
register,
handleSubmit,
watch,
formState: { errors, isSubmitting }
} = useForm<RegisterFormData>({
defaultValues: {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  position: "Forward",
  license: "UEFA Pro",
  formation: "4-3-3",
  academySize: "Under 50",
  relationship: "Father"
}
});

const passwordVal = watch("password");

const onSubmit = async (data: RegisterFormData) => {
if (data.password !== data.confirmPassword) {
  toast.error("Passwords do not match!");
  return;
}

const toastId = toast.loading("Creating your professional account...");

try {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const email = data.email.toLowerCase();
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userRole", selectedRole);

  dispatch(setAccessToken("dummy-token"));
  dispatch(setUser({ user: { email, role: selectedRole, name: data.fullName } }));

  toast.success("Account created successfully!", { id: toastId });

  if (selectedRole === "academy") {
    router.push("/dashboard/academy/analysis");
  } else {
    router.push(`/dashboard/${selectedRole}`);
  }
} catch (err) {
  toast.error("Registration failed. Please try again.", { id: toastId });
}
};

const handleRoleSelect = (role: RoleType) => {
setSelectedRole(role);
setStep(2);
};

return (
<div className="w-full max-w-5xl px-4 py-8 flex flex-col items-center">
  {step === 1 && (
    <div className="w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-heading">
          Select Your <span className="text-primary italic">Role</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Select your appropriate role to begin your career.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {ROLES_INFO.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`relative p-6 rounded-2xl border bg-black/40 text-left hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-56 ${role.color}`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                    {role.title}
                    <span className="text-xs font-normal text-gray-400">({role.subtitle})</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed font-light">
                    {role.description}
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest font-black text-right w-full text-primary/70 group-hover:text-primary transition-colors mt-4">
                Select & Continue &rarr;
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-gray-500 text-xs uppercase tracking-widest pt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-white hover:text-primary transition-colors font-bold">
          Sign In
        </Link>
      </p>
    </div>
  )}

  {step === 2 && (
    <div className="w-full max-w-2xl bg-cardBg/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-right-6 duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
        <button
          onClick={() => setStep(1)}
          className="text-gray-400 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors"
        >
          <IconArrowLeft size={16} /> Back to Roles
        </button>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-primary/80 tracking-widest">
            Selected Role
          </span>
          <p className="text-white font-bold capitalize text-sm">
            {selectedRole}
          </p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
          Create <span className="text-primary italic">Account</span>
        </h2>
        <p className="text-gray-400 text-xs mt-1 font-light">
          Fill in the form below to activate your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
            Basic Credentials
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register("fullName", { required: "Full name is required" })}
              className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
            />
            {errors.fullName && (
              <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1 ml-1 uppercase">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. john@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email"
                  }
                })}
                className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1 ml-1 uppercase">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +88017XXXXXXXX"
                {...register("phone", { required: "Phone number is required" })}
                className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
              />
              {errors.phone && (
                <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1 ml-1 uppercase">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters required" }
                  })}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1 ml-1 uppercase">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) => value === passwordVal || "Passwords do not match"
                  })}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1 ml-1 uppercase">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
            {selectedRole.toUpperCase()} DETAILS
          </h3>

          {selectedRole === "player" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    {...register("dob", { required: "Date of Birth is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-sm scheme-dark"
                  />
                  {errors.dob && (
                    <p className="text-red-500 text-[10px] font-bold tracking-wide mt-1 ml-1 uppercase">
                      {errors.dob.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Position
                  </label>
                  <select
                    {...register("position")}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-sm"
                  >
                    <option value="Forward" className="bg-black text-white">Forward</option>
                    <option value="Midfielder" className="bg-black text-white">Midfielder</option>
                    <option value="Defender" className="bg-black text-white">Defender</option>
                    <option value="Goalkeeper" className="bg-black text-white">Goalkeeper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 178"
                    {...register("height", { required: "Height is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    {...register("weight", { required: "Weight is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Current Club / Academy
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abahani Youth Academy, or N/A"
                  {...register("currentClub")}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                />
              </div>
            </div>
          )}

          {selectedRole === "coach" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    {...register("experience", { required: "Years of experience is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Coaching License Level
                  </label>
                  <select
                    {...register("license")}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-sm"
                  >
                    <option value="UEFA Pro" className="bg-black text-white">UEFA Pro License</option>
                    <option value="UEFA A" className="bg-black text-white">UEFA A License</option>
                    <option value="UEFA B" className="bg-black text-white">UEFA B License</option>
                    <option value="AFC A / B" className="bg-black text-white">AFC/BFF A or B License</option>
                    <option value="Grassroots" className="bg-black text-white">Grassroots / C License</option>
                    <option value="None" className="bg-black text-white">No Official License</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Preferred Formation
                </label>
                <select
                  {...register("formation")}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-sm"
                >
                  <option value="4-3-3" className="bg-black text-white">4-3-3 (Attack-focused)</option>
                  <option value="3-5-2" className="bg-black text-white">3-5-2 (Wingbacks control)</option>
                  <option value="4-4-2" className="bg-black text-white">4-4-2 (Standard flat)</option>
                  <option value="4-2-3-1" className="bg-black text-white">4-2-3-1 (Modern possession)</option>
                </select>
              </div>
            </div>
          )}

          {selectedRole === "academy" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Academy Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kings Football Academy"
                  {...register("academyName", { required: "Academy name is required" })}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Location (City, Country)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, Bangladesh"
                    {...register("academyLocation", { required: "Location is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Registration / License ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REG-109283"
                    {...register("academyLicense", { required: "License ID is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Estimated Academy Size
                </label>
                <select
                  {...register("academySize")}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-sm"
                >
                  <option value="Under 50" className="bg-black text-white">Under 50 Players</option>
                  <option value="50 - 100" className="bg-black text-white">50 - 100 Players</option>
                  <option value="100 - 200" className="bg-black text-white">100 - 200 Players</option>
                  <option value="200+" className="bg-black text-white">More than 200 Players</option>
                </select>
              </div>
            </div>
          )}

          {selectedRole === "club" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Club Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bashundhara Kings"
                    {...register("clubName", { required: "Club name is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Your Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Scout / Director"
                    {...register("repTitle", { required: "Title is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    League Tier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BPL (Premier League)"
                    {...register("leagueTier", { required: "League tier is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangladesh"
                    {...register("clubCountry", { required: "Club country is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic font-light">
                * Note: Professional club profiles are subject to manual validation by platform administrators before activation.
              </p>
            </div>
          )}

          {selectedRole === "agent" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  FIFA / FA License Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. FIFA-LIC-902831"
                  {...register("agentLicense", { required: "License number is required" })}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Elite Football Management"
                    {...register("agencyName")}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Country of Operation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. United Kingdom"
                    {...register("agentCountry", { required: "Country is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic font-light">
                * Access will be enabled after license verification and subscription payment.
              </p>
            </div>
          )}

          {selectedRole === "parent" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Linked Child Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Silva"
                    {...register("childName", { required: "Linked child's name is required" })}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Linked Child Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. marcus@example.com"
                    {...register("childEmail")}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Relationship
                </label>
                <select
                  {...register("relationship")}
                  className="w-full px-4 py-3.5 rounded-xl border border-white/5 bg-black/40 text-white focus:outline-none focus:border-primary/50 transition-all text-sm"
                >
                  <option value="Father" className="bg-black text-white">Father</option>
                  <option value="Mother" className="bg-black text-white">Mother</option>
                  <option value="Guardian" className="bg-black text-white">Legal Guardian</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-7 rounded-xl font-bold text-black text-sm uppercase tracking-[0.2em] bg-primary hover:bg-primary/95 transition-all shadow-[0_0_20px_-5px_rgba(0,255,100,0.4)] hover:shadow-[0_0_25px_-5px_rgba(0,255,100,0.6)] disabled:opacity-50 mt-6"
        >
          {isSubmitting ? "Registering..." : `Register as ${selectedRole}`}
        </Button>
      </form>

      <p className="text-center text-gray-500 text-xs mt-6 uppercase tracking-widest">
        Already have an account?{" "}
        <Link href="/login" className="text-white hover:text-primary transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  )}
</div>
);
}
export default RegisterPage;
