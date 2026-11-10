/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useRegisterMutation } from "@/redux/features/auth/authApi";
import { RoleType, RegisterFormData } from "@/types/auth.type";
import RegisterFormStep from "@/components/auth/register/RegisterFormStep";
import TermsAndConditionsModal from "@/components/auth/register/TermsAndConditionsModal";

const VALID_ROLES: RoleType[] = ["PLAYER", "COACH", "ACADEMY", "CLUB", "AGENT", "PARENT"];

const RegisterRoleFormPage = () => {
  const router = useRouter();
  const params = useParams();

  const roleParam = typeof params.role === "string" ? params.role.toUpperCase() : "";
  const isValidRole = VALID_ROLES.includes(roleParam as RoleType);
  const selectedRole: RoleType = isValidRole ? (roleParam as RoleType) : "PLAYER";

  // Redirect to role selection if invalid role URL is entered
  useEffect(() => {
    if (!isValidRole) {
      router.replace("/register");
    }
  }, [isValidRole, router]);

  // Terms & Conditions acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // RTK Query Mutation
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

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
      estimatedAcademySize: "Under 50 Players",
      relationship: "Father"
    }
  });

  const passwordVal = watch("password");

  // On Submit Registration
  const onSubmit = async (data: RegisterFormData) => {
    if (!termsAccepted) {
      toast.error("You must acknowledge and accept the Terms & Conditions before registering.");
      setIsTermsModalOpen(true);
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const email = data.email.toLowerCase().trim();
      const name = data.fullName.trim();
      const phone = data.phone.trim();
      const password = data.password;
      const confirmPassword = data.confirmPassword;

      let payload: Record<string, unknown> = {
        name,
        email,
        phone,
        password,
        confirmPassword,
        role: selectedRole
      };

      if (selectedRole === "COACH") {
        payload = {
          name,
          email,
          phone,
          password,
          confirmPassword,
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
          confirmPassword,
          role: "PLAYER",
          dateOfBirth: data.dob,
          position: data.position?.trim() || "Forward",
          height: Number(data.height) || 0,
          weight: Number(data.weight) || 0,
          currentClub: data.currentClub?.trim() || ""
        };
      } else if (selectedRole === "ACADEMY") {
        payload = {
          name,
          email,
          phone,
          password,
          confirmPassword,
          role: "ACADEMY",
          academyName: data.academyName?.trim() || "",
          location: (data.location || data.academyLocation)?.trim() || "",
          registrationId: (data.registrationId || data.academyLicense)?.trim() || "",
          estimatedAcademySize: (data.estimatedAcademySize || data.academySize)?.trim() || "Under 50 Players"
        };
      } else if (selectedRole === "CLUB") {
        payload = {
          name,
          email,
          phone,
          password,
          confirmPassword,
          role: "CLUB",
          clubName: data.clubName?.trim() || "",
          title: (data.title || data.repTitle)?.trim() || "",
          leagueTier: data.leagueTier?.trim() || "",
          country: (data.country || data.clubCountry)?.trim() || ""
        };
      } else if (selectedRole === "AGENT") {
        payload = {
          name,
          email,
          phone,
          password,
          confirmPassword,
          role: "AGENT",
          fifaLicenseNumber: (data.fifaLicenseNumber || data.agentLicense)?.trim() || "",
          agencyName: data.agencyName?.trim() || "",
          countryOfOperation: (data.countryOfOperation || data.agentCountry)?.trim() || ""
        };
      } else if (selectedRole === "PARENT") {
        payload = {
          name,
          email,
          phone,
          password,
          confirmPassword,
          role: "PARENT",
          childName: data.childName?.trim() || "",
          childEmail: data.childEmail?.trim() || "",
          relationship: data.relationship?.trim() || "Father"
        };
      }

      // Explicit requirement: payload must include termsAccepted: true
      payload.termsAccepted = true;

      // Build FormData with data key as JSON string matching backend Postman spec
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      await registerUser(formData).unwrap();

      toast.success("Account created successfully! Please verify your email.");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      // ErrorToast handled automatically in authApi onQueryStarted
    }
  };

  if (!isValidRole) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl h-full max-h-screen px-2 sm:px-4 py-2 flex flex-col items-center justify-center overflow-hidden">
      <RegisterFormStep
        selectedRole={selectedRole}
        onBackToRoleSelection={() => router.push("/register")}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        passwordVal={passwordVal}
        isRegistering={isRegistering}
        termsAccepted={termsAccepted}
        onTermsAcceptedChange={setTermsAccepted}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
      />

      <TermsAndConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => setTermsAccepted(true)}
        isAccepted={termsAccepted}
      />
    </div>
  );
};

export default RegisterRoleFormPage;
