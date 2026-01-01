"use client";
import MagneticButton from "@/components/animations/MagneticButton";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function TopNav() {
  const [open, setOpen] = useState(false);

  const items = [
    { href: "/", label: "Home" },
    { href: "/booking", label: "📦 Book Delivery" },
    { href: "/simulation", label: "Simulation" },
    { href: "/analytics", label: "Analytics" },
    { href: "/admin/zones", label: "Admin · Zones" },
    { href: "/admin/pricing", label: "Admin · Pricing" },
    { href: "/admin/audit", label: "Admin · Audit" },
    { href: "/login", label: "Login" },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border-b border-blue-500/20 shadow-lg">
      <div className="container-page py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold tracking-tight text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          ZonePilot
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link
            href="/booking"
            className="hover:text-blue-400 transition-colors font-medium text-blue-400"
          >
            📦 Book Delivery
          </Link>
          <Link
            href="/simulation"
            className="hover:text-blue-400 transition-colors"
          >
            Simulation
          </Link>
          <Link
            href="/analytics"
            className="hover:text-blue-400 transition-colors"
          >
            Analytics
          </Link>
          <Link
            href="/admin/zones"
            className="hover:text-blue-400 transition-colors"
          >
            Admin
          </Link>
          <Link href="/login" className="hover:text-blue-400 transition-colors">
            Login
          </Link>
          <MagneticButton
            className="px-4 py-2 rounded-xl"
            onClick={() => setOpen(true)}
          >
            Menu
          </MagneticButton>
        </div>

        <button
          className="md:hidden px-4 py-2 rounded-xl border border-blue-500/30 text-slate-200 bg-blue-500/10 hover:bg-blue-500/20 font-semibold transition-all"
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[150] bg-slate-950/50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="absolute right-4 top-20 w-[min(460px,90vw)] rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 p-6 shadow-2xl shadow-blue-500/20"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Navigation
                </div>
                <button
                  className="text-sm text-slate-400 hover:text-slate-200 font-semibold transition-colors px-3 py-2 rounded-lg hover:bg-slate-700/50"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-3 text-base">
                {items.map((x, i) => (
                  <motion.div
                    key={x.href}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={x.href}
                      className="block rounded-2xl border border-blue-500/20 bg-slate-800/40 hover:bg-slate-800/80 px-4 py-3 text-slate-200 hover:text-blue-300 font-semibold transition-all hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10"
                      onClick={() => setOpen(false)}
                    >
                      {x.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <p className="mt-5 text-sm text-gray-500">
                Polygons + slabs + caching + analytics + audit trail —
                portfolio-ready.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
