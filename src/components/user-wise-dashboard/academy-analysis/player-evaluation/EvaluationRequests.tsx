"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconBell,
  IconCircleCheck,
  IconClipboardList,
  IconEye,
  IconHourglass,
  IconLoader2,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getEvaluationApiError,
  useGetAcademyEvaluationsDashboardQuery,
  useRemindEvaluationMutation,
} from "@/redux/features/evaluation/evaluationApi";
import type { IAcademyEvaluationRequestItem } from "@/types/evaluation.type";
import { EvaluationStatusBadge } from "@/components/evaluations/EvaluationBadges";
import {
  display,
  formatDate,
  initials,
  refAvatar,
  refField,
  refId,
  refName,
} from "@/components/evaluations/evaluationFormat";

import { SummaryCard } from "./SummaryCard";
import { RequestEvaluationModal, RequestEvaluationPrefill } from "./RequestEvaluationModal";

const SHEET_BASE_PATH = "/dashboard/academy/management/player-evaluation";

type Bucket = "due" | "overdue" | "evaluated";

const EMPTY_TEXT: Record<Bucket, string> = {
  due: "No open evaluation requests.",
  overdue: "No players need re-evaluation.",
  evaluated: "No valid evaluations yet.",
};

const PersonCell = ({ refValue, subtitleKey }: { refValue: IAcademyEvaluationRequestItem["playerId"]; subtitleKey: string }) => {
  const name = refName(refValue);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar className="size-9">
        <AvatarImage src={refAvatar(refValue) || undefined} alt={name || ""} className="object-cover" />
        <AvatarFallback className="text-xs font-bold">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-white truncate">{display(name)}</span>
        <span className="text-[11px] text-muted-foreground truncate">{display(refField(refValue, subtitleKey))}</span>
      </div>
    </div>
  );
};

const EvaluationRequests = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAcademyEvaluationsDashboardQuery();
  const [remindEvaluation, { isLoading: isReminding, originalArgs: remindingId }] = useRemindEvaluationMutation();

  const [modal, setModal] = useState<{ open: boolean; key: number; prefill?: RequestEvaluationPrefill }>({
    open: false,
    key: 0,
  });

  const dashboard = data?.data;
  const summary = dashboard?.summary;
  const due = dashboard?.due ?? [];
  const overdue = dashboard?.overdue ?? [];
  const evaluated = dashboard?.evaluated ?? [];

  const openModal = (prefill?: RequestEvaluationPrefill) =>
    setModal((m) => ({ open: true, key: m.key + 1, prefill }));

  const requestAgain = (item: IAcademyEvaluationRequestItem) =>
    openModal({
      playerId: refId(item.playerId),
      playerName: refName(item.playerId),
      coachId: refId(item.coachId),
      coachName: refName(item.coachId),
    });

  const remind = async (item: IAcademyEvaluationRequestItem) => {
    try {
      await remindEvaluation(item._id).unwrap();
    } catch {
      // toasted by the API layer (400 no longer open, 403 not your academy)
    }
  };

  const renderAction = (bucket: Bucket, item: IAcademyEvaluationRequestItem) => {
    if (bucket === "due") {
      const busy = isReminding && remindingId === item._id;
      return (
        <Button size="sm" variant="outline" onClick={() => remind(item)} disabled={busy}>
          {busy ? <IconLoader2 className="animate-spin" /> : <IconBell />}
          Remind
        </Button>
      );
    }
    if (bucket === "overdue") {
      return (
        <Button size="sm" onClick={() => requestAgain(item)}>
          <IconRefresh />
          Request again
        </Button>
      );
    }
    return (
      <Button size="sm" variant="outline" asChild>
        <Link href={`${SHEET_BASE_PATH}/${item._id}`}>
          <IconEye />
          View
        </Link>
      </Button>
    );
  };

  const renderTable = (bucket: Bucket, items: IAcademyEvaluationRequestItem[]) => {
    if (items.length === 0) {
      return <p className="text-center text-muted-foreground text-sm font-bold py-14">{EMPTY_TEXT[bucket]}</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/10">
              <th className="px-5 py-3 font-bold">Player</th>
              <th className="px-3 py-3 font-bold">Coach</th>
              <th className="px-3 py-3 font-bold">Requested</th>
              <th className="px-3 py-3 font-bold">Status</th>
              <th className="px-3 py-3 font-bold">Next due</th>
              <th className="px-3 py-3 font-bold text-right">Reminders</th>
              <th className="px-5 py-3 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b border-white/5 last:border-0 text-white/90">
                <td className="px-5 py-3">
                  <PersonCell refValue={item.playerId} subtitleKey="position" />
                </td>
                <td className="px-3 py-3">
                  <PersonCell refValue={item.coachId} subtitleKey="title" />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{display(formatDate(item.createdAt))}</td>
                <td className="px-3 py-3">
                  <EvaluationStatusBadge status={item.status} />
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{display(formatDate(item.nextEvaluationDue))}</td>
                <td className="px-3 py-3 text-right tabular-nums">{display(item.reminderCount)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">{renderAction(bucket, item)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const errorMessage = isError ? getEvaluationApiError(error, "Failed to load evaluation requests").message : null;

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            Evaluation Requests
          </h1>
          <p className="text-muted-foreground font-medium mt-2 text-sm md:text-lg">
            Ask your coaches to evaluate players
            {summary?.evaluationCycleMonths ? ` · each evaluation is valid for ${summary.evaluationCycleMonths} months` : ""}
          </p>
        </div>
        <Button onClick={() => openModal()} className="font-black uppercase tracking-wider">
          <IconPlus />
          Request evaluation
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard label="Total Evaluations" value={display(summary?.totalEvaluations)} icon={IconClipboardList} />
        <SummaryCard label="Evaluated" value={display(summary?.evaluatedCount)} icon={IconCircleCheck} />
        <SummaryCard label="Due" value={display(summary?.dueCount)} icon={IconHourglass} />
        <SummaryCard
          label="Overdue"
          value={display(summary?.overdueCount)}
          icon={IconAlertTriangle}
          iconClassName="text-destructive"
        />
      </div>

      <div className="bg-[#111111] border border-white/20 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
            <p className="text-destructive text-sm font-bold">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="due" className="gap-0">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
              <TabsList>
                <TabsTrigger value="due">Due ({due.length})</TabsTrigger>
                <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
                <TabsTrigger value="evaluated">Evaluated ({evaluated.length})</TabsTrigger>
              </TabsList>
              {isFetching && <IconLoader2 className="size-4 text-muted-foreground animate-spin" />}
            </div>
            <TabsContent value="due">{renderTable("due", due)}</TabsContent>
            <TabsContent value="overdue">{renderTable("overdue", overdue)}</TabsContent>
            <TabsContent value="evaluated">{renderTable("evaluated", evaluated)}</TabsContent>
          </Tabs>
        )}
      </div>

      {modal.open && (
        <RequestEvaluationModal
          key={modal.key}
          open={modal.open}
          onOpenChange={(open) => setModal((m) => ({ ...m, open }))}
          prefill={modal.prefill}
          dueItems={due}
          onConflict={() => refetch()}
          isRefreshing={isFetching}
        />
      )}
    </div>
  );
};

export default EvaluationRequests;
