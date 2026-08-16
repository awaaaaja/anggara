import { Badge } from "@/components/ui/badge";
import { STATUS_PROPOSAL_BADGE, STATUS_PROPOSAL_LABEL } from "@/lib/constants";
import type { StatusProposal } from "@/lib/db/schema";

const badgeVariant: Record<string, string> = {
  zinc: "border-border bg-muted text-muted-foreground",
  amber:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-gold/40 dark:bg-gold/10 dark:text-gold",
  orange:
    "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-400/40 dark:bg-orange-400/10 dark:text-orange-300",
  red: "border-red-300 bg-red-50 text-red-700 dark:border-red-400/40 dark:bg-red-400/10 dark:text-red-300",
  emerald:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300",
  sky: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300",
  blue: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-400/40 dark:bg-blue-400/10 dark:text-blue-300",
  green:
    "border-green-300 bg-green-50 text-green-700 dark:border-green-400/40 dark:bg-green-400/10 dark:text-green-300",
  violet:
    "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-400/40 dark:bg-violet-400/10 dark:text-violet-300",
};

const dotVariant: Record<string, string> = {
  zinc: "bg-zinc-400 dark:bg-zinc-500",
  amber: "bg-amber-500 dark:bg-gold",
  orange: "bg-orange-500",
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  violet: "bg-violet-500",
};

export function StatusBadge({ status }: { status: StatusProposal }) {
  const variant = STATUS_PROPOSAL_BADGE[status] ?? "zinc";
  return (
    <Badge
      variant="outline"
      className={`${badgeVariant[variant] ?? badgeVariant.zinc} inline-flex items-center gap-1.5 border font-medium backdrop-blur-sm`}
    >
      <span
        aria-hidden
        className={`size-1.5 shrink-0 rounded-full ${dotVariant[variant] ?? dotVariant.zinc}`}
      />
      {STATUS_PROPOSAL_LABEL[status]}
    </Badge>
  );
}