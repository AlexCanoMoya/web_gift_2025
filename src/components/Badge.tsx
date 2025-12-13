import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "soft" | "outline";
}) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const styles =
    variant === "outline"
      ? "border border-zinc-200 bg-white text-zinc-700"
      : variant === "soft"
      ? "bg-zinc-100 text-zinc-700"
      : "bg-zinc-900 text-white";
  return <span className={cn(base, styles)}>{children}</span>;
}
