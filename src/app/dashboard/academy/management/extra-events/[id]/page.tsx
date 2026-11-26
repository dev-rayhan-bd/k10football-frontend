"use client";

import { useParams } from "next/navigation";
import ExtraEventManageView from "@/components/extra-events/manage/ExtraEventManageView";

const ExtraEventDetailPage = () => {
  const params = useParams<{ id: string }>();
  return <ExtraEventManageView eventId={String(params?.id ?? "")} />;
};

export default ExtraEventDetailPage;
