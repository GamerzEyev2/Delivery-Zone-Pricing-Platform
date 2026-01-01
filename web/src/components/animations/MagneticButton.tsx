"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";

type Props = HTMLMotionProps<"button">;

export default function MagneticButton({
  children,
  className,
  ...props
}: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.18);
    y.set(dy * 0.18);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      {...props}
      style={{ ...(props.style || {}), x: sx, y: sy }}
      onMouseMove={(e) => {
        onMove(e);
        props.onMouseMove?.(e);
      }}
      onMouseLeave={(e) => {
        onLeave();
        props.onMouseLeave?.(e);
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3 text-sm relative overflow-hidden",
        "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white",
        "border border-blue-400/50 shadow-lg shadow-blue-500/30",
        "hover:shadow-xl hover:shadow-purple-500/40 hover:border-purple-400/70",
        "active:shadow-md active:scale-95",
        "transition-all duration-200",
        className
      )}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ opacity: 0.2 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
