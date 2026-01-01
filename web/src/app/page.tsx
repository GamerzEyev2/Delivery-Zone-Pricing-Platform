"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            ZonePilot Delivery
          </h1>
          <p className="text-xl text-slate-300 mb-12">
            Fast, reliable delivery across Delhi
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8"
        >
          {/* Customer Booking */}
          <Link href="/booking">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/50 rounded-lg cursor-pointer hover:border-blue-400 transition-all"
            >
              <div className="text-4xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Book a Delivery
              </h2>
              <p className="text-slate-300 mb-4">
                Fast quotes, easy booking, trackable deliveries
              </p>
              <div className="text-blue-400 font-semibold">Get Started →</div>
            </motion.div>
          </Link>

          {/* Admin Dashboard */}
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/50 rounded-lg cursor-pointer hover:border-purple-400 transition-all"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Admin Panel
              </h2>
              <p className="text-slate-300 mb-4">
                Manage pricing, zones, and orders
              </p>
              <div className="text-purple-400 font-semibold">Login →</div>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-slate-400 text-sm"
        >
          <p>Admin: admin@zonepilot.local / Admin@123</p>
        </motion.div>
      </div>
    </div>
  );
}
