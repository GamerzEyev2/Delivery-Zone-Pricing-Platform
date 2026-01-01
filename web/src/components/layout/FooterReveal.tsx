"use client";
import { motion } from "framer-motion";

export default function FooterReveal() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className="mt-20 border-t border-gray-100"
    >
      <div className="container-page py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-semibold">ZonePilot</div>
          <div className="text-sm text-gray-500 mt-1">
            Delivery zones + distance pricing engine (FastAPI + Postgres +
            Next.js).
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Leaflet + OpenStreetMap • Free for portfolio • No Google billing
        </div>
      </div>
    </motion.footer>
  );
}
