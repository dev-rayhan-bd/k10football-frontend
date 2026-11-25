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

export const EvaluationStatusBadge = ({ status, className }: { status?: string | null; className?: string }) => {
  if (!status) return null;
  return (
    <Badge variant={statusVariant(status)} className={cn("uppercase tracking-wider font-bold", className)}>
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
