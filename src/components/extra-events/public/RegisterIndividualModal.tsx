"use client";

import React, { useState } from "react";
import { IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getExtraEventApiError, useRegisterForEventMutation } from "@/redux/features/extraEvent/extraEventApi";
import type { IPublicEvent, IRegisterForEventPayload } from "@/types/extraEvent.type";
import { formatFee, readSession } from "./eventUtils";

interface RegisterIndividualModalProps {
  event: IPublicEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterIndividualForm = ({ event, onClose }: { event: IPublicEvent; onClose: () => void }) => {
  // Read once when the dialog opens (client-only).
  const [session] = useState(readSession);
  const isParent = session.role === "parent";

  const [name, setName] = useState(isParent ? "" : session.fullName);
  const [email, setEmail] = useState(session.email);
  const [phone, setPhone] = useState("");
  const [teamName, setTeamName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [registerForEvent, { isLoading }] = useRegisterForEventMutation();
  const fee = formatFee(event);
  const isPaid = Boolean(event.registrationFee) && fee !== "Free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return setFormError(isParent ? "Enter your child's full name." : "Enter your full name.");
    if (!session.loggedIn && !email.trim()) return setFormError("Email is required.");
    if (email.trim() && !EMAIL_RE.test(email.trim())) return setFormError("Enter a valid email address.");

    const body: IRegisterForEventPayload = { name: name.trim() };
    if (email.trim()) body.email = email.trim();
    if (phone.trim()) body.phone = phone.trim();
    if (teamName.trim()) body.teamName = teamName.trim();

    try {
      const res = await registerForEvent({ eventId: event._id, body }).unwrap();
      const result = res.data;
      if (result?.requiresPayment && result.checkoutUrl) {
        // Paid: Stripe confirms the place through its webhook; nothing is marked paid here.
        setIsRedirecting(true);
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result?.requiresPayment) {
        setFormError("Payment could not be started. Please try again in a moment.");
        return;
      }
      const message = result?.message || res.message || "You're registered!";
      setSuccessMessage(message);
      toast.success(message);
    } catch (err) {
      const { message } = getExtraEventApiError(err, "Registration failed. Please try again.");
      setFormError(message);
      toast.error(message);
    }
  };

  if (successMessage) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <IconCircleCheck className="size-14 text-primary" />
        <div className="flex flex-col gap-1">
          <DialogTitle>You&apos;re registered</DialogTitle>
          <DialogDescription>{successMessage}</DialogDescription>
        </div>
        <Button onClick={onClose}>Done</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Register for {event.eventName}</DialogTitle>
        <DialogDescription>
          {isPaid
            ? `Registration fee: ${fee}. You'll be taken to secure checkout to pay.`
            : "This event is free to attend."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-name">{isParent ? "Child's full name" : "Full name"} *</Label>
        <Input
          id="reg-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isParent ? "Your child's name" : "Your name"}
          autoComplete={isParent ? "off" : "name"}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-email">
          {isParent ? "Your email" : "Email"}
          {session.loggedIn ? "" : " *"}
        </Label>
        <Input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-phone">Phone</Label>
          <Input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
            autoComplete="tel"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-team">Current team / club</Label>
          <Input id="reg-team" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isRedirecting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isRedirecting}>
          {(isLoading || isRedirecting) && <IconLoader2 className="animate-spin" />}
          {isRedirecting ? "Redirecting to payment…" : isPaid ? `Continue to payment (${fee})` : "Register"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const RegisterIndividualModal = ({ event, open, onOpenChange }: RegisterIndividualModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      {/* Remount per open so the form starts fresh and re-reads the session. */}
      {open && <RegisterIndividualForm event={event} onClose={() => onOpenChange(false)} />}
    </DialogContent>
  </Dialog>
);

export default RegisterIndividualModal;
