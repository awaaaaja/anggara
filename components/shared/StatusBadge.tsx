import { Badge } from "@/components/ui/badge";
import { STATUS_PROPOSAL_BADGE, STATUS_PROPOSAL_LABEL } from "@/lib/constants";
import type { StatusProposal } from "@/lib/db/schema";

const badgeVariant: Record<string, string> = {
  zinc: "border-white/10 bg-white/5 text-muted-foreground",
  amber: "border-gold/40 bg-gold/10 text-gold",
  orange: "border-orange-400/40 bg-orange-400/10 text-orange-300",
  red: "border-red-400/40 bg-red-400/10 text-red-300",
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  sky: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  blue: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  green: "border-green-400/40 bg-green-400/10 text-green-300",
  violet: "border-violet-400/40 bg-violet-400/10 text-violet-300",
};

export function StatusBadge({ status }: { status: StatusProposal }) {
  const variant = badgeVariant[STATUS_PROPOSAL_BADGE[status]] ?? badgeVariant.zinc;
  return (
    <Badge
      variant="outline"
      className={`${variant} border font-medium backdrop-blur-sm`}
    >
      {STATUS_PROPOSAL_LABEL[status]}
    </Badge>
  );
}