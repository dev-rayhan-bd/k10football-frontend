"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetMeQuery, useAcceptTermsMutation } from "@/redux/features/user/userApi";
import { useGetPolicyByTypeQuery } from "@/redux/features/content/contentApi";
import { getToken, getUserRole, normalizeRole } from "@/helpers/SessionHelper";
import { useAppSelector } from "@/hooks/reduxHooks";
import { formatDate } from "@/lib/utils";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";

export const DashboardTermsGuard: React.FC = () => {
  const pathname = usePathname();
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reactive token and role from Redux or session helper
  const auth = useAppSelector((state) => state.auth);
  const token = auth?.accessToken || (typeof window !== "undefined" ? getToken() : null);
  const role = auth?.user?.role || (typeof window !== "undefined" ? getUserRole() : "");

  const isSuperAdmin =
    normalizeRole(role) === "super_admin" || pathname.startsWith("/dashboard/admin");

  const skipMeQuery = !token || isSuperAdmin;

  // 1. Fetch user profile from /users/me with immediate refetch on mount or auth change
  const {
    data: meResponse,
    isLoading: isMeLoading,
    refetch: refetchMe,
  } = useGetMeQuery(undefined, {
    skip: skipMeQuery,
    refetchOnMountOrArgChange: true,
  });

  // Always refetch /users/me immediately when landing on a dashboard path or when token updates
  useEffect(() => {
    if (!skipMeQuery && isClient) {
      refetchMe();
    }
  }, [pathname, token, skipMeQuery, isClient, refetchMe]);

  const userData = meResponse?.data;
  const userRoleNormalized = normalizeRole(userData?.role);
  const isActualSuperAdmin = userRoleNormalized === "super_admin";

  const termsAgreement = userData?.termsAgreement;
  const requiresReacceptance = Boolean(
    !isSuperAdmin && !isActualSuperAdmin && termsAgreement?.requiresReacceptance
  );
  const latestVersion = termsAgreement?.latestVersion || "2.0";

  // 2. Fetch policy terms content if reacceptance is required
  const {
    data: policyResponse,
    isLoading: isPolicyLoading,
    isError: isPolicyError,
    refetch: refetchPolicy,
  } = useGetPolicyByTypeQuery("TERMS_AND_CONDITIONS", {
    skip: !requiresReacceptance,
    refetchOnMountOrArgChange: true,
  });

  // 3. Mutation to accept terms
  const [acceptTermsMutation, { isLoading: isAccepting }] = useAcceptTermsMutation();

  const policy = policyResponse?.data;

  const handleAcceptTerms = async () => {
    try {
      await acceptTermsMutation({
        termsAccepted: true,
        version: latestVersion,
      }).unwrap();
      setHasConfirmedCheckbox(false);
      refetchMe();
    } catch {
      // ErrorToast handled automatically in userApi
    }
  };

  if (!isClient || skipMeQuery || isMeLoading || !requiresReacceptance) {
    return null;
  }

  return (
    <Dialog open={requiresReacceptance} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-[#0d1210] border-primary/30 text-white shadow-2xl ring-1 ring-primary/20"
      >
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="size-4 text-primary" /> Mandatory Policy Update
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-white leading-tight">
            {policy?.title || "Platform Terms & Conditions, Data Protection and Media Consent Agreement"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 mt-1.5 flex flex-wrap items-center gap-2">
            <span>
              Our terms and conditions have been updated. You must acknowledge the updated agreement to continue using your dashboard.
            </span>
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px] px-2 py-0">
              v{latestVersion}
            </Badge>
            {policy?.effectiveDate && (
              <span className="text-[11px] text-zinc-400">
                Effective: {formatDate(policy.effectiveDate)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-[280px] max-h-[54vh] overflow-y-auto p-5 sm:p-6 custom-scrollbar text-zinc-200">
          {isPolicyLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs text-zinc-400">Loading updated policy document...</p>
            </div>
          ) : isPolicyError || !policy?.content ? (
            <div className="flex flex-col items-center justify-center min-h-[280px] gap-3 text-center p-4">
              <p className="text-sm text-zinc-400">
                Unable to load the policy document at this moment.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchPolicy()}
                className="gap-2 text-xs"
              >
                <RefreshCw className="size-3.5" /> Try Again
              </Button>
            </div>
          ) : (
            <div
              className="policy-html-content space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-300
                [&_h2]:text-base sm:[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:uppercase [&_h2]:tracking-wider
                [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-4 [&_h3]:mb-1.5
                [&_h4]:text-xs sm:[&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-zinc-100 [&_h4]:mt-4 [&_h4]:mb-1
                [&_h5]:text-xs sm:[&_h5]:text-xs [&_h5]:font-semibold [&_h5]:text-zinc-200 [&_h5]:mt-3 [&_h5]:mb-1
                [&_p]:mb-2.5 [&_p]:text-zinc-300 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1.5
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1.5
                [&_li]:text-zinc-300 [&_li]:leading-normal
                [&_strong]:text-white [&_strong]:font-semibold
                [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t border-white/10 shrink-0 bg-[#0a0f0d] flex flex-col gap-3">
          <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 w-full">
            <Checkbox
              id="reacceptanceConfirm"
              checked={hasConfirmedCheckbox}
              onCheckedChange={(checked) => setHasConfirmedCheckbox(checked === true)}
              className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:text-black"
            />
            <label
              htmlFor="reacceptanceConfirm"
              className="text-xs text-zinc-300 select-none cursor-pointer leading-snug"
            >
              I confirm that I have read, understood, and accept the updated{" "}
              <span className="text-primary font-semibold">
                Terms & Conditions, Data Protection and Media Consent Agreement (Version {latestVersion})
              </span>
              .
            </label>
          </div>

          <div className="flex items-center justify-end w-full gap-3 pt-1">
            <Button
              type="button"
              disabled={!hasConfirmedCheckbox || isAccepting}
              onClick={handleAcceptTerms}
              className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_-3px_rgba(0,255,98,0.5)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 px-6 py-2.5 ml-auto"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Accepting Terms...
                </>
              ) : (
                "I Acknowledge & Accept"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardTermsGuard;
