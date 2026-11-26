"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconCircleX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventPaymentCancelled } from "@/components/extra-events/public/EventPaymentResult";

const GenericPaymentCancelled = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
    <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl border border-border bg-cardBg p-6 text-center sm:p-10">
      <div className="flex size-20 items-center justify-center rounded-full border-2 border-destructive/50 text-destructive">
        <IconCircleX className="size-10" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl uppercase sm:text-3xl">Payment cancelled</h1>
        <p className="text-sm text-foreground/70">The checkout was cancelled and you were not charged.</p>
      </div>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  </div>
);

// Stripe cancel return. Event registrations (`type=EXTRA_EVENT` / `TOURNAMENT_CLUB`) link back to the event.
const PaymentCancelRouter = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  if (type === "EXTRA_EVENT" || type === "TOURNAMENT_CLUB") {
    return <EventPaymentCancelled eventId={searchParams.get("eventId") || ""} kind={type} />;
  }
  return <GenericPaymentCancelled />;
};

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Skeleton className="h-64 w-full max-w-lg rounded-3xl" />
        </div>
      }
    >
      <PaymentCancelRouter />
    </Suspense>
  );
}
