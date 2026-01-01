"use client";

import { motion } from "framer-motion";

export default function Preloader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="h-10 w-10 rounded-full border border-white/30 border-t-white"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
        <div className="text-sm text-white/70">{label}</div>
      </div>
    </div>
  );
}
