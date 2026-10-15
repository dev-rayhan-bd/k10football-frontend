"use client";

import { useRouter } from "next/navigation";
import { RoleType } from "@/types/auth.type";
import RoleSelectionStep from "@/components/auth/register/RoleSelectionStep";

const RegisterPage = () => {
  const router = useRouter();

  const handleRoleSelect = (role: RoleType) => {
    router.push(`/register/${role.toLowerCase()}`);
  };

  return (
    <div className="w-full max-w-5xl h-full max-h-screen px-4 py-4 sm:py-8 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar">
      <RoleSelectionStep onSelectRole={handleRoleSelect} />
    </div>
  );
};

export default RegisterPage;
