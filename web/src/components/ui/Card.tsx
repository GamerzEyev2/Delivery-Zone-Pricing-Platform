import { cn } from "@/lib/utils";
import * as React from "react";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/80 to-slate-800/60 shadow-xl backdrop-blur-md hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/40 transition-all duration-300",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("p-5 pb-3 border-b border-blue-500/10", props.className)}
    {...props}
  />
);

export const CardTitle = (props: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-lg font-bold tracking-tight bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent",
      props.className
    )}
    {...props}
  />
);

export const CardDescription = (
  props: React.HTMLAttributes<HTMLParagraphElement>
) => <p className={cn("text-sm text-white/70", props.className)} {...props} />;

export const CardContent = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-0", props.className)} {...props} />
);

export const CardFooter = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-0", props.className)} {...props} />
);

// ✅ default export so "import Card from ..." works
export default Card;
