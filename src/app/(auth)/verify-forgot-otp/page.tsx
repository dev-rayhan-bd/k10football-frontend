/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import {
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordSendOtpMutation
} from "@/redux/features/auth/authApi";
import OtpVerificationStep from "@/components/auth/register/OtpVerificationStep";

const VerifyForgotOtpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [verifyForgotOtp, { isLoading: isVerifyingOtp }] = useForgotPasswordVerifyOtpMutation();
  const [resendForgotOtp, { isLoading: isResendingOtp }] = useForgotPasswordSendOtpMutation();

  const [registeredEmail, setRegisteredEmail] = useState(emailParam);
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setRegisteredEmail(emailParam);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("forgotEmail", emailParam);
      }
    } else if (typeof window !== "undefined") {
      const cachedEmail = sessionStorage.getItem("forgotEmail");
      if (cachedEmail) {
        setRegisteredEmail(cachedEmail);
      }
    }
  }, [emailParam]);

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
    if (!registeredEmail) {
      toast.error("Email address is missing. Please enter your email first.");
      router.push("/forgot-password");
      return;
    }

    if (otpValue.length < 6 || !/^\d{6}$/.test(otpValue)) {
      toast.error("Please enter a valid 6-digit numeric verification code");
      return;
    }

    try {
      const res = await verifyForgotOtp({
        email: registeredEmail,
        otp: otpValue
      }).unwrap();

      const resetToken = res?.data?.token || res?.token;
      if (resetToken && typeof window !== "undefined") {
        sessionStorage.setItem("resetToken", resetToken);
      }

      toast.success("Code verified successfully! Please set your new password.");

      if (resetToken) {
        router.push(
          `/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(registeredEmail)}`
        );
      } else {
        router.push(`/reset-password?email=${encodeURIComponent(registeredEmail)}`);
      }
    } catch {
      // ErrorToast is handled automatically in authApi onQueryStarted
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || !registeredEmail) return;
    try {
      await resendForgotOtp({ email: registeredEmail }).unwrap();
      setResendTimer(60);
      setCanResend(false);
    } catch {
      // ErrorToast handled in authApi onQueryStarted
    }
  };

  return (
    <div className="w-full max-w-5xl px-4 py-8 flex flex-col items-center">
      <OtpVerificationStep
        icon={<KeyRound className="size-8" />}
        title={
          <>
            Verify <span className="text-primary italic">OTP</span>
          </>
        }
        subtitle={
          <>
            We sent a 6-digit password reset code to{" "}
            <span className="text-white font-bold block mt-1">
              {registeredEmail || "your email address"}
            </span>
          </>
        }
        registeredEmail={registeredEmail}
        otpValue={otpValue}
        setOtpValue={setOtpValue}
        onVerifyOtp={handleVerifyOtp}
        isVerifyingOtp={isVerifyingOtp}
        onResendOtp={handleResendOtp}
        isResendingOtp={isResendingOtp}
        canResend={canResend}
        resendTimer={resendTimer}
        verifyButtonText="Verify & Reset Password"
        verifyingButtonText="Verifying Code..."
        backButtonText="← Back to forgot password"
        onBack={() => router.push("/forgot-password")}
      />
    </div>
  );
};

const VerifyForgotOtpPage = () => {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm">Loading verification...</div>}>
      <VerifyForgotOtpContent />
    </Suspense>
  );
};

export default VerifyForgotOtpPage;
