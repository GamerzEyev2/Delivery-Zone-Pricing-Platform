import { cn } from "@/lib/utils";
import * as React from "react";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    default:
      "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border-blue-400/40",
    secondary: "bg-slate-700/50 text-slate-200 border-slate-600/50",
    success: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-200 border-amber-500/30",
    danger: "bg-rose-500/20 text-rose-200 border-rose-500/30",
    outline: "bg-transparent text-slate-300 border-slate-500/40",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm hover:border-opacity-70 transition-all",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

// ✅ default export so "import Badge from ..." works
export default Badge;
