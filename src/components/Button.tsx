import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed";
  const v =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : variant === "secondary"
      ? "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-500"
      : "bg-transparent text-zinc-800 hover:bg-zinc-100";
  const s = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
  return (
    <button className={cn(base, v, s)} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
