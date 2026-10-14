/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";

import {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation
} from "@/redux/features/auth/authApi";
import {
  IconBallFootball,
  IconSchool,
  IconBuildingCommunity,
  IconBriefcase,
  IconUsers,
  IconClipboardText
} from "@tabler/icons-react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Ruler,
  Weight,
  Building2,
  Award,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Loader2
} from "lucide-react";

type RoleType = "PARENT" | "AGENT" | "CLUB" | "ACADEMY" | "PLAYER" | "COACH";

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;

  // Coach fields
  experience: string;
  license: string;
  formation: string;

  // Player fields
  dob: string;
  position: string;
  height: string;
  weight: string;
  currentClub: string;

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
    id: "PLAYER" as RoleType,
    title: "Player",
    subtitle: "Player",
    description: "Create your football CV, track attributes, and showcase matches.",
    icon: IconBallFootball,
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400"
  },
  {
    id: "COACH" as RoleType,
    title: "Coach",
    subtitle: "Coach",
    description: "Build CV, manage formations, evaluate players, and create reports.",
    icon: IconClipboardText,
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400"
  },
  {
    id: "ACADEMY" as RoleType,
    title: "Academy",
    subtitle: "Academy",
    description: "Manage players, training sessions, coaches, and tournaments.",
    icon: IconSchool,
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400"
  },
  {
    id: "CLUB" as RoleType,
    title: "Club",
    subtitle: "Club",
    description: "Search talent, scout candidates, and shortlist players.",
    icon: IconBuildingCommunity,
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400"
  },
  {
    id: "AGENT" as RoleType,
    title: "Agent / Intermediary",
    subtitle: "Agent",
    description: "FIFA/FA licensed scouting and talent management.",
    icon: IconBriefcase,
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400"
  },
  {
    id: "PARENT" as RoleType,
    title: "Parent / Guardian",
    subtitle: "Parent",
    description: "Manage youth profiles, track development, and submit match stats.",
    icon: IconUsers,
    color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400"
  }
];

const RegisterPage = () => {
  const router = useRouter();

  // RTK Query Mutations
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<RoleType>("PLAYER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification step state
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    shouldUnregister: true,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      // Coach defaults
      experience: "8",
      license: "UEFA Pro License",
      formation: "4-3-3 (Attack-focused)",
      // Player defaults
      position: "Forward",
      height: "",
      weight: "",
      currentClub: "",
      // Other defaults
      academySize: "Under 50",
      relationship: "Father"
    }
  });

  const passwordVal = watch("password");

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setStep(2);
  };

  // STEP 2: On Submit Registration
  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const email = data.email.toLowerCase().trim();
      const name = data.fullName.trim();
      const phone = data.phone.trim();
      const password = data.password;

      let payload: Record<string, unknown> = {
        name,
        email,
        phone,
        password,
        role: selectedRole
      };

      if (selectedRole === "COACH") {
        payload = {
          name,
          email,
          phone,
          password,
          role: "COACH",
          yearsExperience: Number(data.experience) || 0,
          licenseStatus: data.license?.trim() || "UEFA Pro License",
          preferredFormation: data.formation?.trim() || "4-3-3 (Attack-focused)"
        };
      } else if (selectedRole === "PLAYER") {
        payload = {
          name,
          email,
          phone,
          password,
          role: "PLAYER",
          dateOfBirth: data.dob,
          position: data.position?.trim() || "Forward",
          height: Number(data.height) || 0,
          weight: Number(data.weight) || 0,
          currentClub: data.currentClub?.trim() || "N/A"
        };
      } else if (selectedRole === "ACADEMY") {
        payload = {
          name,
          email,
          phone,
          password,
          role: "ACADEMY",
          academyName: data.academyName?.trim() || "",
          academyLocation: data.academyLocation?.trim() || "",
          academyLicense: data.academyLicense?.trim() || "",
          academySize: data.academySize?.trim() || "Under 50"
        };
      } else if (selectedRole === "CLUB") {
        payload = {
          name,
          email,
          phone,
          password,
          role: "CLUB",
          clubName: data.clubName?.trim() || "",
          repTitle: data.repTitle?.trim() || "",
          leagueTier: data.leagueTier?.trim() || "",
          clubCountry: data.clubCountry?.trim() || ""
        };
      } else if (selectedRole === "AGENT") {
        payload = {
          name,
          email,
          phone,
          password,
          role: "AGENT",
          agentLicense: data.agentLicense?.trim() || "",
          agencyName: data.agencyName?.trim() || "",
          agentCountry: data.agentCountry?.trim() || ""
        };
      } else if (selectedRole === "PARENT") {
        payload = {
          name,
          email,
          phone,
          password,
          role: "PARENT",
          childName: data.childName?.trim() || "",
          childEmail: data.childEmail?.trim() || "",
          relationship: data.relationship?.trim() || "Father"
        };
      }

      // Build FormData with data key as JSON string matching backend Postman spec
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      await registerUser(formData).unwrap();

      setRegisteredEmail(email);
      setStep(3);
      setResendTimer(60);
      setCanResend(false);
    } catch {
      // ErrorToast handled automatically in authApi onQueryStarted
    }
  };

  // STEP 3: Verify OTP
  const handleVerifyOtp = async () => {
    if (otpValue.length < 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    try {
      await verifyOtp({
        email: registeredEmail,
        otp: otpValue
      }).unwrap();

      // Redirect to login page upon successful OTP verification
      router.push("/login");
    } catch {
      // ErrorToast handled in authApi onQueryStarted
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || !registeredEmail) return;
    try {
      await resendOtp({ email: registeredEmail }).unwrap();
      setResendTimer(60);
      setCanResend(false);
    } catch {
      // ErrorToast handled in authApi onQueryStarted
    }
  };

  return (
    <div className="w-full max-w-5xl px-4 py-8 flex flex-col items-center">
      {/* STEP 1: ROLE SELECTION */}
      {step === 1 && (
        <div className="w-full text-center flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/90 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit mx-auto">
              Get Started
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-heading">
              Select Your <span className="text-primary italic">Role</span>
            </h1>
            <p className="text-zinc-300 text-sm max-w-md mx-auto font-normal">
              Choose your profile type to configure the platform for your football career.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
            {ROLES_INFO.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`relative p-6 rounded-2xl border bg-[#111514]/90 backdrop-blur-md text-left hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-56 shadow-lg border-white/10 hover:border-primary/50`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all text-primary">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        {role.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed font-normal">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] uppercase tracking-widest font-black text-right w-full text-primary/80 group-hover:text-primary transition-colors mt-4 flex items-center justify-end gap-1">
                    Select & Continue &rarr;
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-zinc-400 text-sm font-medium pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold transition-all ml-1">
              Sign In
            </Link>
          </p>
        </div>
      )}

      {/* STEP 2: REGISTRATION FORM */}
      {step === 2 && (
        <div className="w-full max-w-2xl bg-[#0f1312]/95 backdrop-blur-2xl border border-white/15 p-6 sm:p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in fade-in slide-in-from-right-6 duration-500">
          {/* Header Controls */}
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <button
              onClick={() => setStep(1)}
              className="text-zinc-300 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
            >
              <ArrowLeft className="size-4" /> Change Role
            </button>
            <Badge className="bg-primary/15 text-primary border border-primary/30 font-bold uppercase tracking-widest text-[11px] px-3 py-1">
              {selectedRole} Account
            </Badge>
          </div>

          {/* Form Title */}
          <div className="text-center mb-8 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-heading">
              Create <span className="text-primary italic">Account</span>
            </h2>
            <p className="text-zinc-300 text-sm mt-1.5 font-normal">
              Fill in the credentials below to activate your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* SECTION 1: BASIC CREDENTIALS */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                    Basic Credentials
                  </h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-white/10 to-transparent" />
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-primary font-black">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Ferguson"
                    {...register("fullName", { required: "Full name is required" })}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-primary font-black">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="email"
                      placeholder="e.g. coach@k10football.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Phone Number</span>
                    <span className="text-primary font-black">*</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="e.g. +880171111111"
                      {...register("phone", { required: "Phone number is required" })}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Password</span>
                    <span className="text-primary font-black">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Min 6 characters required" }
                      })}
                      className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Confirm Password</span>
                    <span className="text-primary font-black">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: (value) => value === passwordVal || "Passwords do not match"
                      })}
                      className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: ROLE SPECIFIC DETAILS */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                    {selectedRole} Details
                  </h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-white/10 to-transparent" />
              </div>

              {/* COACH FIELDS */}
              {selectedRole === "COACH" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Years of Experience</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <div className="relative group">
                        <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                          type="number"
                          placeholder="e.g. 8"
                          {...register("experience", {
                            required: selectedRole === "COACH" ? "Years of experience is required" : false
                          })}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                      </div>
                      {errors.experience && (
                        <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                          {errors.experience.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Coaching License Level</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <div className="relative">
                        <select
                          {...register("license")}
                          className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
                        >
                          <option value="UEFA Pro License" className="bg-[#111514] text-white">UEFA Pro License</option>
                          <option value="UEFA A License" className="bg-[#111514] text-white">UEFA A License</option>
                          <option value="UEFA B License" className="bg-[#111514] text-white">UEFA B License</option>
                          <option value="AFC / BFF License" className="bg-[#111514] text-white">AFC / BFF License</option>
                          <option value="Grassroots / C License" className="bg-[#111514] text-white">Grassroots / C License</option>
                          <option value="No Official License" className="bg-[#111514] text-white">No Official License</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Preferred Formation</span>
                      <span className="text-primary font-black">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register("formation")}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="4-3-3 (Attack-focused)" className="bg-[#111514] text-white">4-3-3 (Attack-focused)</option>
                        <option value="3-5-2 (Wingbacks control)" className="bg-[#111514] text-white">3-5-2 (Wingbacks control)</option>
                        <option value="4-4-2 (Standard flat)" className="bg-[#111514] text-white">4-4-2 (Standard flat)</option>
                        <option value="4-2-3-1 (Modern possession)" className="bg-[#111514] text-white">4-2-3-1 (Modern possession)</option>
                        <option value="4-3-3 (Holding midfielder)" className="bg-[#111514] text-white">4-3-3 (Holding midfielder)</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* PLAYER FIELDS */}
              {selectedRole === "PLAYER" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Date of Birth</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                          type="date"
                          {...register("dob", {
                            required: selectedRole === "PLAYER" ? "Date of birth is required" : false
                          })}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner [color-scheme:dark]"
                        />
                      </div>
                      {errors.dob && (
                        <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                          {errors.dob.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                        Position
                      </label>
                      <div className="relative">
                        <select
                          {...register("position")}
                          className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
                        >
                          <option value="Forward" className="bg-[#111514] text-white">Forward</option>
                          <option value="Midfielder" className="bg-[#111514] text-white">Midfielder</option>
                          <option value="Defender" className="bg-[#111514] text-white">Defender</option>
                          <option value="Goalkeeper" className="bg-[#111514] text-white">Goalkeeper</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Height (cm)</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <div className="relative group">
                        <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                          type="number"
                          placeholder="e.g. 178"
                          {...register("height", {
                            required: selectedRole === "PLAYER" ? "Height is required" : false
                          })}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                      </div>
                      {errors.height && (
                        <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                          {errors.height.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Weight (kg)</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <div className="relative group">
                        <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                        <input
                          type="number"
                          placeholder="e.g. 70"
                          {...register("weight", {
                            required: selectedRole === "PLAYER" ? "Weight is required" : false
                          })}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                        />
                      </div>
                      {errors.weight && (
                        <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
                          {errors.weight.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Current Club / Academy
                    </label>
                    <div className="relative group">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Abahani Youth Academy, or N/A"
                        {...register("currentClub")}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACADEMY FIELDS */}
              {selectedRole === "ACADEMY" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                      <span>Academy Name</span>
                      <span className="text-primary font-black">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kings Football Academy"
                      {...register("academyName", {
                        required: selectedRole === "ACADEMY" ? "Academy name is required" : false
                      })}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Location (City, Country)</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dhaka, Bangladesh"
                        {...register("academyLocation", {
                          required: selectedRole === "ACADEMY" ? "Location is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Registration / License ID</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. REG-109283"
                        {...register("academyLicense", {
                          required: selectedRole === "ACADEMY" ? "License ID is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Estimated Academy Size
                    </label>
                    <div className="relative">
                      <select
                        {...register("academySize")}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="Under 50" className="bg-[#111514] text-white">Under 50 Players</option>
                        <option value="50 - 100" className="bg-[#111514] text-white">50 - 100 Players</option>
                        <option value="100 - 200" className="bg-[#111514] text-white">100 - 200 Players</option>
                        <option value="200+" className="bg-[#111514] text-white">More than 200 Players</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* CLUB FIELDS */}
              {selectedRole === "CLUB" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Club Name</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bashundhara Kings"
                        {...register("clubName", {
                          required: selectedRole === "CLUB" ? "Club name is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Your Title</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chief Scout / Director"
                        {...register("repTitle", {
                          required: selectedRole === "CLUB" ? "Title is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>League Tier</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Premier League"
                        {...register("leagueTier", {
                          required: selectedRole === "CLUB" ? "League tier is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Country</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. England"
                        {...register("clubCountry", {
                          required: selectedRole === "CLUB" ? "Country is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AGENT FIELDS */}
              {selectedRole === "AGENT" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                      <span>FIFA / FA License Number</span>
                      <span className="text-primary font-black">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FIFA-LIC-902831"
                      {...register("agentLicense", {
                        required: selectedRole === "AGENT" ? "License number is required" : false
                      })}
                      className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                        Agency Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Elite Football Management"
                        {...register("agencyName")}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Country of Operation</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. United Kingdom"
                        {...register("agentCountry", {
                          required: selectedRole === "AGENT" ? "Country is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PARENT FIELDS */}
              {selectedRole === "PARENT" && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                        <span>Linked Child Name</span>
                        <span className="text-primary font-black">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Marcus Silva"
                        {...register("childName", {
                          required: selectedRole === "PARENT" ? "Child's name is required" : false
                        })}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                        Linked Child Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. marcus@example.com"
                        {...register("childEmail")}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Relationship
                    </label>
                    <div className="relative">
                      <select
                        {...register("relationship")}
                        className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        <option value="Father" className="bg-[#111514] text-white">Father</option>
                        <option value="Mother" className="bg-[#111514] text-white">Mother</option>
                        <option value="Guardian" className="bg-[#111514] text-white">Legal Guardian</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isRegistering}
              className="w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                `Register as ${selectedRole}`
              )}
            </Button>
          </form>

          <p className="text-center text-zinc-400 text-sm mt-6 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold transition-all ml-1">
              Sign In
            </Link>
          </p>
        </div>
      )}

      {/* STEP 3: OTP VERIFICATION (Using Shadcn InputOTP) */}
      {step === 3 && (
        <div className="w-full max-w-lg bg-[#0f1312]/95 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
          {/* Glowing Shield Icon */}
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_-5px_rgba(0,255,98,0.4)]">
            <ShieldCheck className="size-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading">
            Verify <span className="text-primary italic">Account</span>
          </h2>
          <p className="text-zinc-300 text-sm mt-2 font-normal leading-relaxed max-w-sm">
            We sent a 6-digit verification code to{" "}
            <span className="text-white font-bold block mt-1">{registeredEmail}</span>
          </p>

          {/* Shadcn InputOTP Component */}
          <div className="my-8 flex flex-col items-center gap-3">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => setOtpValue(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <span className="text-xs text-zinc-400 font-medium">
              Enter the 6 digits sent to your email inbox
            </span>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3">
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || otpValue.length < 6}
              className="w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Verify & Activate Account
                </>
              )}
            </Button>

            {/* Resend OTP */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 px-1">
              <span>Didn&apos;t receive the code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResendingOtp}
                  className="text-primary hover:underline font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  {isResendingOtp ? "Sending..." : "Resend Code"}
                </button>
              ) : (
                <span className="text-zinc-500 font-medium">
                  Resend in <span className="text-primary font-bold">{resendTimer}s</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-zinc-400 hover:text-white text-xs uppercase tracking-wider font-bold transition-colors mt-4"
            >
              &larr; Back to edit details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
