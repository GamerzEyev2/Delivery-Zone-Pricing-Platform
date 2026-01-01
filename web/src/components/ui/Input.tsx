import { cn } from "@/lib/utils";
import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-11 w-full rounded-xl border bg-slate-900/50 border-blue-500/20 px-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none",
      "focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-900/80",
      "hover:border-blue-400/40 hover:bg-slate-900/70",
      "transition-all duration-200 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

// ✅ default export so "import Input from ..." works
export default Input;
