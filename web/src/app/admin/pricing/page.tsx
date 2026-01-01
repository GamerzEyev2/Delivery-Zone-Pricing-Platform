"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import MagneticButton from "@/components/animations/MagneticButton";

import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { PricingSlab, PricingVersion, Warehouse } from "@/lib/types";

export default function AdminPricingPage() {
  const r = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  const [slabs, setSlabs] = useState<PricingSlab[]>([]);
  const [loading, setLoading] = useState(false);

  // create form
  const [name, setName] = useState("0–5 km");
  const [minKm, setMinKm] = useState("0");
  const [maxKm, setMaxKm] = useState("5");
  const [flatFee, setFlatFee] = useState("30");
  const [perKmFee, setPerKmFee] = useState("8");
  const [currency, setCurrency] = useState("INR");

  // versions modal
  const [openVersions, setOpenVersions] = useState(false);
  const [versions, setVersions] = useState<PricingVersion[]>([]);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    if (!getToken()) r.push("/login");
  }, [r]);

  useEffect(() => {
    api.warehouses().then((w: any) => {
      setWarehouses(w || []);
      if (w?.[0]?.id) setWarehouseId(w[0].id);
    });
  }, []);

  async function refresh(whId: number) {
    const s: any = await api.pricing(whId);
    setSlabs(s || []);
  }

  useEffect(() => {
    if (!warehouseId) return;
    refresh(warehouseId).catch(() => setSlabs([]));
  }, [warehouseId]);

  const active = useMemo(() => slabs.filter((x) => x.is_active), [slabs]);

  async function onCreate() {
    if (!warehouseId) return;
    try {
      setLoading(true);
      await api.createSlab({
        warehouse_id: warehouseId,
        name,
        min_km: Number(minKm),
        max_km: Number(maxKm),
        flat_fee: Number(flatFee),
        per_km_fee: Number(perKmFee),
        currency,
      });
      await refresh(warehouseId);
    } catch {
      alert("Create failed. Check values: max_km must be > min_km.");
    } finally {
      setLoading(false);
    }
  }

  async function onDisable(id: number) {
    if (!warehouseId) return;
    if (!confirm("Disable this slab?")) return;
    try {
      await api.deleteSlab(id);
      await refresh(warehouseId);
    } catch {
      alert("Disable failed (admin token required).");
    }
  }

  return (
    <div className="container-page pt-10">
      <div className="flex items-center gap-2">
        <Badge>Admin</Badge>
        <Badge>Pricing</Badge>
        <Badge>Slabs</Badge>
        <Badge>Versions</Badge>
      </div>

      <h1 className="h2 font-[var(--font-sora)] mt-3">Admin · Pricing Slabs</h1>
      <p className="p mt-2 max-w-3xl">
        Manage distance slabs per warehouse. Slab changes generate version
        snapshots + audit entries.
      </p>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-1">
          <div className="font-semibold">Warehouse</div>
          <select
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={warehouseId ?? ""}
            onChange={(e) => setWarehouseId(Number(e.target.value))}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                #{w.id} — {w.name} ({w.city})
              </option>
            ))}
          </select>

          <div className="mt-6 font-semibold">Create Slab</div>

          <div className="mt-3 text-sm text-gray-500">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-500">Min km</div>
              <Input value={minKm} onChange={(e) => setMinKm(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Max km</div>
              <Input value={maxKm} onChange={(e) => setMaxKm(e.target.value)} />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-gray-500">Flat fee</div>
              <Input
                value={flatFee}
                onChange={(e) => setFlatFee(e.target.value)}
              />
            </div>
            <div>
              <div className="text-sm text-gray-500">Per km fee</div>
              <Input
                value={perKmFee}
                onChange={(e) => setPerKmFee(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-500">Currency</div>
          <Input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />

          <div className="mt-4">
            <MagneticButton className="w-full" onClick={onCreate}>
              {loading ? "Creating..." : "Create Slab"}
            </MagneticButton>
          </div>

          <div className="mt-5 text-xs text-gray-500">
            Tip: You can create 3–5 slabs (0–5, 5–12, 12–25, etc.) for realistic
            pricing.
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">Slabs</div>
              <div className="text-sm text-gray-500 mt-1">
                Active: {active.length} • Total: {slabs.length}
              </div>
            </div>
            <a className="text-sm underline text-gray-700" href="/admin/audit">
              View audit trail →
            </a>
          </div>

          <div className="mt-4 grid gap-3">
            {slabs.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="font-medium">
                    #{s.id} — {s.name}{" "}
                    {!s.is_active && (
                      <span className="text-xs text-gray-500">(disabled)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {s.min_km}–{s.max_km} km • Flat {s.flat_fee} • Per km{" "}
                    {s.per_km_fee} • {s.currency}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="text-sm text-gray-700 underline"
                    onClick={async () => {
                      try {
                        const v: any = await api.slabVersions(s.id);
                        setVersions(v || []);
                        setSelectedName(s.name);
                        setOpenVersions(true);
                      } catch {
                        alert("Versions failed (admin token required).");
                      }
                    }}
                  >
                    Versions
                  </button>

                  <button
                    className="text-sm text-red-600"
                    onClick={() => onDisable(s.id)}
                  >
                    Disable
                  </button>
                </div>
              </div>
            ))}

            {slabs.length === 0 && (
              <div className="text-sm text-gray-600">
                No slabs yet. Create one from the left panel.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Versions modal */}
      <AnimatePresence>
        {openVersions && (
          <motion.div
            className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenVersions(false)}
          >
            <motion.div
              className="w-[min(900px,95vw)] rounded-3xl bg-white p-6 shadow-xl"
              initial={{ y: 10, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-lg">Pricing Versions</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedName}
                  </div>
                </div>
                <button
                  className="text-sm text-gray-600"
                  onClick={() => setOpenVersions(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 overflow-auto max-h-[60vh] border border-gray-100 rounded-2xl">
                <table className="w-full text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th className="text-left p-3">Ver</th>
                      <th className="text-left p-3">Action</th>
                      <th className="text-left p-3">Actor</th>
                      <th className="text-left p-3">Time</th>
                      <th className="text-left p-3">Snapshot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((v) => (
                      <tr
                        key={v.id}
                        className="border-t border-gray-100 align-top"
                      >
                        <td className="p-3 font-medium">{v.version}</td>
                        <td className="p-3">{v.action}</td>
                        <td className="p-3">{v.actor_user_id ?? "—"}</td>
                        <td className="p-3">
                          {String(v.created_at).slice(0, 19).replace("T", " ")}
                        </td>
                        <td className="p-3">
                          <pre className="text-xs bg-gray-50 border border-gray-100 rounded-xl p-3 overflow-auto max-w-[420px]">
                            {JSON.stringify(v.snapshot, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                    {versions.length === 0 && (
                      <tr>
                        <td className="p-3 text-gray-500" colSpan={5}>
                          No versions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Every create/update/disable generates a version snapshot + audit
                entry.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </div>
  );
}
