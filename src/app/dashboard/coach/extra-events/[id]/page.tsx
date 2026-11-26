"use client";

import { useParams } from "next/navigation";
import ExtraEventManageView from "@/components/extra-events/manage/ExtraEventManageView";

const CoachExtraEventDetailPage = () => {
  const params = useParams<{ id: string }>();
  return <ExtraEventManageView eventId={String(params?.id ?? "")} readOnly basePath="/dashboard/coach/extra-events" />;
};

export default CoachExtraEventDetailPage;
