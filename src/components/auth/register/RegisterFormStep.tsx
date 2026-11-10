import { FC, FormEventHandler } from "react";
import Link from "next/link";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { RegisterFormData, RoleType } from "@/types/auth.type";
import BasicCredentialsFields from "./BasicCredentialsFields";
import RoleSpecificFields from "./RoleSpecificFields";

interface RegisterFormStepProps {
  selectedRole: RoleType;
  onBackToRoleSelection: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  passwordVal?: string;
  isRegistering: boolean;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
  onOpenTermsModal: () => void;
}

const RegisterFormStep: FC<RegisterFormStepProps> = ({
  selectedRole,
  onBackToRoleSelection,
  onSubmit,
  register,
  errors,
  passwordVal,
  isRegistering,
  termsAccepted,
  onTermsAcceptedChange,
  onOpenTermsModal,
}) => {
  return (
    <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0f1312]/95 backdrop-blur-2xl border border-white/15 p-5 sm:p-8 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in fade-in slide-in-from-right-6 duration-500 overflow-hidden">
      {/* Header Controls (Fixed - Top) */}
      <div className="flex-shrink-0 mb-4 sm:mb-5">
        <div className="flex justify-between items-center mb-3 sm:mb-4 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={onBackToRoleSelection}
            className="text-zinc-300 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest font-bold transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer"
          >
            <ArrowLeft className="size-4" /> Change Role
          </button>
          <Badge className="bg-primary/15 text-primary border border-primary/30 font-bold uppercase tracking-widest text-[11px] px-3 py-1">
            {selectedRole} Account
          </Badge>
        </div>

        {/* Form Title */}
        <div className="text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading">
            Create <span className="text-primary italic">Account</span>
          </h2>
          <p className="text-zinc-300 text-xs sm:text-sm mt-1 font-normal">
            Fill in the credentials below to activate your account.
          </p>
        </div>
      </div>

      {/* Form with scrollable fields container and fixed submit button */}
      <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Scrollable Fields Container (Marked Content) */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 sm:pr-3 flex flex-col gap-5 custom-scrollbar">
          {/* SECTION 1: BASIC CREDENTIALS */}
          <BasicCredentialsFields
            register={register}
            errors={errors}
            passwordVal={passwordVal}
          />

          {/* SECTION 2: ROLE SPECIFIC DETAILS */}
          <RoleSpecificFields
            selectedRole={selectedRole}
            register={register}
            errors={errors}
          />
        </div>

        {/* Fixed Footer Controls (Terms Acknowledgment, Submit Button & Sign In Link) */}
        <div className="flex-shrink-0 pt-4 mt-2 border-t border-white/10 flex flex-col gap-3">
          {/* TERMS & CONDITIONS ACKNOWLEDGMENT */}
          <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 transition-colors">
            <Checkbox
              id="termsAccepted"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsAcceptedChange(checked === true)}
              className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:text-black"
            />
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="text-xs text-zinc-300 leading-snug">
                <label htmlFor="termsAccepted" className="select-none cursor-pointer">
                  I acknowledge and accept the{" "}
                </label>
                <button
                  type="button"
                  onClick={onOpenTermsModal}
                  className="text-primary hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  Terms & Conditions, Data Protection & Media Consent Agreement
                  <ExternalLink className="size-3 shrink-0" />
                </button>
                <span className="text-red-500 ml-1 font-bold">*</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                You must read and acknowledge the policy agreement before registering.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isRegistering || !termsAccepted}
            className="w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
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

          <p className="text-center text-zinc-400 text-xs sm:text-sm font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold transition-all ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterFormStep;
