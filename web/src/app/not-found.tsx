"use client";

import MagneticButton from "@/components/animations/MagneticButton";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page pt-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-sm text-gray-500">404</div>
        <h1 className="h1 font-[var(--font-sora)] mt-2">Page not found</h1>
        <p className="p mt-3 max-w-2xl">
          This route doesn’t exist. Use the menu to navigate to Simulation,
          Admin, or Analytics.
        </p>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="font-semibold">Try these pages</div>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/simulation">
                <MagneticButton className="w-full">Simulation</MagneticButton>
              </Link>
              <Link href="/admin/zones">
                <MagneticButton className="w-full bg-white text-gray-900 border border-gray-200">
                  Admin Zones
                </MagneticButton>
              </Link>
              <Link href="/analytics">
                <MagneticButton className="w-full bg-white text-gray-900 border border-gray-200">
                  Analytics
                </MagneticButton>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <div className="font-semibold">Why this page looks “premium”</div>
            <p className="text-sm text-gray-600 mt-2">
              Smooth page transitions (Framer Motion), consistent typography
              (Sora + Inter), and card-based layouts with clean spacing.
            </p>

            <motion.div
              className="mt-5 rounded-2xl border border-gray-100 p-6"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-sm text-gray-500">Micro-interaction</div>
              <div className="mt-2 text-lg font-semibold">
                Hover the buttons 👇
              </div>
              <div className="mt-3">
                <MagneticButton>Magnetic button</MagneticButton>
              </div>
            </motion.div>
          </Card>
        </div>
      </motion.div>

      <div className="h-20" />
    </div>
  );
}
