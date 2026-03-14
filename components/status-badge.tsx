import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  paid: "bg-emerald-50 text-emerald-700",
  released: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  onboarding: "bg-amber-50 text-amber-700",
  processing: "bg-cyan-50 text-cyan-700",
  approved: "bg-cyan-50 text-cyan-700",
  failed: "bg-rose-50 text-rose-700",
  rejected: "bg-rose-50 text-rose-700",
  blocked: "bg-rose-50 text-rose-700"
};

export function StatusBadge({ value }: { value: string }): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        toneMap[value] ?? "bg-slate-100 text-slate-700"
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
