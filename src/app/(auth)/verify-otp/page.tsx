"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  useVerifyOtpMutation,
  useResendOtpMutation
} from "@/redux/features/auth/authApi";
import OtpVerificationStep from "@/components/auth/register/OtpVerificationStep";

const VerifyOtpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  const [registeredEmail] = useState(emailParam);
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
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
  }, [resendTimer]);

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otpValue.length < 6 || !/^\d{6}$/.test(otpValue)) {
      toast.error("Please enter a valid 6-digit numeric verification code");
      return;
    }

    try {
      await verifyOtp({
        email: registeredEmail,
        otp: otpValue
      }).unwrap();

      toast.success("Account verified successfully! Please sign in.");
      router.push("/login");
    } catch {
      // ErrorToast handled automatically in authApi onQueryStarted
    }
  };

  // Resend OTP
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
      <OtpVerificationStep
        registeredEmail={registeredEmail}
        otpValue={otpValue}
        setOtpValue={setOtpValue}
        onVerifyOtp={handleVerifyOtp}
        isVerifyingOtp={isVerifyingOtp}
        onResendOtp={handleResendOtp}
        isResendingOtp={isResendingOtp}
        canResend={canResend}
        resendTimer={resendTimer}
        onBack={() => router.push("/register")}
      />
    </div>
  );
};

const VerifyOtpPage = () => {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm">Loading verification...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
};

export default VerifyOtpPage;
