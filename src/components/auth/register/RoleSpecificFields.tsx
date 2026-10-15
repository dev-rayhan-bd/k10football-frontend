import { FC } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegisterFormData, RoleType } from "@/types/auth.type";
import CoachFields from "./role-fields/CoachFields";
import PlayerFields from "./role-fields/PlayerFields";
import AcademyFields from "./role-fields/AcademyFields";
import ClubFields from "./role-fields/ClubFields";
import AgentFields from "./role-fields/AgentFields";
import ParentFields from "./role-fields/ParentFields";

interface RoleSpecificFieldsProps {
  selectedRole: RoleType;
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

const RoleSpecificFields: FC<RoleSpecificFieldsProps> = ({
  selectedRole,
  register,
  errors
}) => {
  return (
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

      {selectedRole === "COACH" && (
        <CoachFields register={register} errors={errors} selectedRole={selectedRole} />
      )}
      {selectedRole === "PLAYER" && (
        <PlayerFields register={register} errors={errors} selectedRole={selectedRole} />
      )}
      {selectedRole === "ACADEMY" && (
        <AcademyFields register={register} errors={errors} selectedRole={selectedRole} />
      )}
      {selectedRole === "CLUB" && (
        <ClubFields register={register} errors={errors} selectedRole={selectedRole} />
      )}
      {selectedRole === "AGENT" && (
        <AgentFields register={register} errors={errors} selectedRole={selectedRole} />
      )}
      {selectedRole === "PARENT" && (
        <ParentFields register={register} errors={errors} selectedRole={selectedRole} />
      )}
    </div>
  );
};

export default RoleSpecificFields;
