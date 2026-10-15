import { FC } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegisterFormData, RoleType } from "@/types/auth.type";

interface AgentFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  selectedRole: RoleType;
}

const AgentFields: FC<AgentFieldsProps> = ({ register, errors, selectedRole }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
          <span>FIFA / FA License Number</span>
          <span className="text-primary font-black">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. FIFA-LIC-902831"
          {...register("fifaLicenseNumber", {
            required: selectedRole === "AGENT" ? "License number is required" : false
          })}
          className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
        />
        {errors.fifaLicenseNumber && (
          <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
            {errors.fifaLicenseNumber.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Agency Name</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Elite Football Management"
            {...register("agencyName", {
              required: selectedRole === "AGENT" ? "Agency name is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.agencyName && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.agencyName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Country of Operation</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. United Kingdom"
            {...register("countryOfOperation", {
              required: selectedRole === "AGENT" ? "Country is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.countryOfOperation && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.countryOfOperation.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentFields;
