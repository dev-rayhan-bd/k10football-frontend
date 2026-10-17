import { FC, ReactNode } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";
import { ShieldCheck, Loader2, CheckCircle2, RotateCcw } from "lucide-react";

interface OtpVerificationStepProps {
  registeredEmail: string;
  otpValue: string;
  setOtpValue: (val: string) => void;
  onVerifyOtp: () => void;
  isVerifyingOtp: boolean;
  onResendOtp: () => void;
  isResendingOtp: boolean;
  canResend: boolean;
  resendTimer: number;
  onBack: () => void;
  backButtonText?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  verifyButtonText?: string;
  verifyingButtonText?: string;
}

const OtpVerificationStep: FC<OtpVerificationStepProps> = ({
  registeredEmail,
  otpValue,
  setOtpValue,
  onVerifyOtp,
  isVerifyingOtp,
  onResendOtp,
  isResendingOtp,
  canResend,
  resendTimer,
  onBack,
  backButtonText = "← Back to registration",
  title,
  subtitle,
  icon,
  verifyButtonText = "Verify & Activate Account",
  verifyingButtonText = "Verifying OTP..."
}) => {
  return (
    <div className="w-full max-w-lg bg-[#0f1312]/95 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
      {/* Glowing Shield Icon */}
      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_-5px_rgba(0,255,98,0.4)]">
        {icon || <ShieldCheck className="size-8" />}
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading">
        {title || (
          <>
            Verify <span className="text-primary italic">Account</span>
          </>
        )}
      </h2>
      <p className="text-zinc-300 text-sm mt-2 font-normal leading-relaxed max-w-sm">
        {subtitle || (
          <>
            We sent a 6-digit verification code to{" "}
            <span className="text-white font-bold block mt-1">{registeredEmail}</span>
          </>
        )}
      </p>

      {/* Shadcn InputOTP Component */}
      <div className="my-8 flex flex-col items-center gap-3">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          value={otpValue}
          onChange={(value) => {
            const numericValue = value.replace(/\D/g, "");
            setOtpValue(numericValue);
          }}
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
          onClick={onVerifyOtp}
          disabled={isVerifyingOtp || otpValue.length < 6 || !/^\d{6}$/.test(otpValue)}
          className="w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isVerifyingOtp ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {verifyingButtonText}
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              {verifyButtonText}
            </>
          )}
        </Button>

        {/* Resend OTP */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 px-1">
          <span>Didn&apos;t receive the code?</span>
          {canResend ? (
            <button
              type="button"
              onClick={onResendOtp}
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
          onClick={onBack}
          className="text-zinc-400 hover:text-white text-xs uppercase tracking-wider font-bold transition-colors mt-4 cursor-pointer"
        >
          {backButtonText}
        </button>
      </div>
    </div>
  );
};

export default OtpVerificationStep;
