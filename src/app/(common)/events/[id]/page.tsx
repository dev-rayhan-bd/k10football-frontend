"use client";

import { useParams } from "next/navigation";
import EventDetail from "@/components/extra-events/public/EventDetail";

const EventDetailPage = () => {
  const params = useParams<{ id: string }>();
  return <EventDetail eventId={String(params?.id || "")} />;
};

export default EventDetailPage;
