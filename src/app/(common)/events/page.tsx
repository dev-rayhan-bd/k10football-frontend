"use client";

import EventsBrowser from "@/components/extra-events/public/EventsBrowser";

const EventsPage = () => (
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:py-14">
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-3xl text-foreground uppercase sm:text-5xl">Events</h1>
      <p className="max-w-2xl text-sm text-foreground/70">
        Camps, trials, clinics, workshops and tournaments run by academies on K10 Football. Register yourself, your
        child or your team.
      </p>
    </div>
    <EventsBrowser />
  </div>
);

export default EventsPage;
