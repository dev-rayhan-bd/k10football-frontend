import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { humanize } from "./evaluationFormat";

/** Maps the API status (never computed client-side) to a Badge variant. */
const statusVariant = (status: string) => {
  const s = status.toUpperCase();
  if (s.includes("EXPIRED") || s.includes("OVERDUE")) return "destructive" as const;
  if (s.includes("EVALUATED") || s.includes("SUBMITTED") || s.includes("COMPLETED")) return "default" as const;
  return "secondary" as const;
};

/** Open requests (NEED_EVALUATION / PENDING) are yellow; EVALUATED green; EXPIRED red. */
const isOpenStatus = (status: string) => /NEED_EVALUATION|PENDING/i.test(status);

export const EvaluationStatusBadge = ({ status, className }: { status?: string | null; className?: string }) => {
  if (!status) return null;
  return (
    <Badge
      variant={statusVariant(status)}
      className={cn(
        "uppercase tracking-wider font-bold",
        isOpenStatus(status) && "border-amber-500/30 bg-amber-500/15 text-amber-400",
        className
      )}
    >
      {humanize(status)}
    </Badge>
  );
};

const gradeVariant = (grade: string) => {
  const g = grade.toUpperCase();
  if (g.includes("EXCELLENT")) return "default" as const;
  if (g.includes("IMPROVE")) return "destructive" as const;
  return "secondary" as const;
};

export const EvaluationGradeBadge = ({ grade, className }: { grade?: string | null; className?: string }) => {
  if (!grade) return null;
  return (
    <Badge variant={gradeVariant(grade)} className={cn("uppercase tracking-wider font-bold", className)}>
      {humanize(grade)}
    </Badge>
  );
};
