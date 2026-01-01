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
import type { Warehouse, Zone, ZoneVersion } from "@/lib/types";

function parseCoords(text: string): number[][] {
  // Accept lines: "lat,lng" OR "lat lng"
  const lines = text
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const pts: number[][] = [];
  for (const ln of lines) {
    const parts = ln.includes(",") ? ln.split(",") : ln.split(/\s+/);
    if (parts.length < 2) continue;
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    pts.push([lat, lng]);
  }
  return pts;
}

function ensureClosed(poly: number[][]): number[][] {
  if (poly.length < 3) return poly;
  const first = poly[0];
  const last = poly[poly.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return poly;
  return [...poly, first];
}

export default function AdminZonesPage() {
  const r = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);

  // create form
  const [name, setName] = useState("New Zone");
  const [color, setColor] = useState("#7C3AED");
  const [coordsText, setCoordsText] = useState(
    `28.7041,77.1025\n28.7041,77.2800\n28.5200,77.2800\n28.5200,77.1025\n28.7041,77.1025`
  );

  // geojson import/export
  const [overwrite, setOverwrite] = useState(true);
  const [importInfo, setImportInfo] = useState<string | null>(null);

  // versions modal
  const [openVersions, setOpenVersions] = useState(false);
  const [versions, setVersions] = useState<ZoneVersion[]>([]);
  const [selectedZoneName, setSelectedZoneName] = useState<string>("");

  useEffect(() => {
    if (!getToken()) r.push("/login");
  }, [r]);

  useEffect(() => {
    api.warehouses().then((w: any) => {
      setWarehouses(w || []);
      if (w?.[0]?.id) setWarehouseId(w[0].id);
    });
  }, []);

  async function refreshZones(id: number) {
    const z: any = await api.zones(id);
    setZones(z || []);
  }

  useEffect(() => {
    if (!warehouseId) return;
    refreshZones(warehouseId).catch(() => setZones([]));
  }, [warehouseId]);

  const activeZones = useMemo(() => zones.filter((z) => z.is_active), [zones]);

  async function onCreate() {
    if (!warehouseId) return;
    try {
      setLoading(true);
      setImportInfo(null);

      let coords = parseCoords(coordsText);
      coords = ensureClosed(coords);

      await api.createZone({
        warehouse_id: warehouseId,
        name,
        color,
        coords,
      });

      await refreshZones(warehouseId);
    } catch (e: any) {
      alert(
        "Create failed. Ensure polygon is CLOSED and has at least 4 points.\nExample: first point equals last point."
      );
    } finally {
      setLoading(false);
    }
  }

  async function onDisable(zoneId: number) {
    if (!warehouseId) return;
    if (!confirm("Disable this zone?")) return;
    try {
      await api.deleteZone(zoneId);
      await refreshZones(warehouseId);
    } catch {
      alert("Disable failed (are you logged in as admin?)");
    }
  }

  return (
    <div className="container-page pt-10">
      <div className="flex items-center gap-2">
        <Badge>Admin</Badge>
        <Badge>Zones</Badge>
        <Badge>GeoJSON</Badge>
        <Badge>Versions</Badge>
      </div>

      <h1 className="h2 font-[var(--font-sora)] mt-3">
        Admin · Delivery Zones
      </h1>
      <p className="p mt-2 max-w-3xl">
        Create polygon zones, import/export GeoJSON, and view version snapshots
        for every change. This page is intentionally “real-world admin” style.
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

          <div className="mt-6 font-semibold">Create Zone</div>

          <div className="mt-3 text-sm text-gray-500">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} />

          <div className="mt-3 text-sm text-gray-500">Color</div>
          <Input value={color} onChange={(e) => setColor(e.target.value)} />

          <div className="mt-3 text-sm text-gray-500">
            Polygon coords (lat,lng per line)
          </div>
          <textarea
            className="mt-2 w-full min-h-[160px] rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/15"
            value={coordsText}
            onChange={(e) => setCoordsText(e.target.value)}
            spellCheck={false}
          />

          <div className="mt-4 flex flex-col gap-2">
            <MagneticButton className="w-full" onClick={onCreate}>
              {loading ? "Creating..." : "Create Zone"}
            </MagneticButton>

            <MagneticButton
              className="w-full bg-white text-gray-900 border border-gray-200"
              onClick={() => {
                setCoordsText(
                  `28.6500,77.1500\n28.6500,77.2600\n28.5600,77.2600\n28.5600,77.1500\n28.6500,77.1500`
                );
                setName("Sample Zone (Delhi)");
              }}
            >
              Use Sample Polygon
            </MagneticButton>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 p-4">
            <div className="font-medium">GeoJSON Import / Export</div>
            <p className="text-sm text-gray-600 mt-1">
              Export active zones as GeoJSON, import FeatureCollection Polygon
              later.
            </p>

            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <MagneticButton
                className="w-full sm:w-auto"
                onClick={async () => {
                  try {
                    if (!warehouseId) return;
                    const g: any = await api.exportZonesGeoJSON(warehouseId);
                    const blob = new Blob([JSON.stringify(g, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `zones_warehouse_${warehouseId}.geojson`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setImportInfo("Exported GeoJSON file.");
                  } catch {
                    setImportInfo("Export failed (admin token required).");
                  }
                }}
              >
                Export GeoJSON
              </MagneticButton>

              <label className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-gray-200 text-sm cursor-pointer hover:bg-gray-50 text-center">
                Import GeoJSON
                <input
                  type="file"
                  accept="application/json,.geojson"
                  className="hidden"
                  onChange={async (e) => {
                    try {
                      if (!warehouseId) return;
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const txt = await f.text();
                      const geojson = JSON.parse(txt);

                      const res: any = await api.importZonesGeoJSON({
                        warehouse_id: warehouseId,
                        overwrite,
                        geojson,
                      });

                      setImportInfo(
                        `Imported ${res.imported} zones (overwrite=${overwrite}).`
                      );
                      await refreshZones(warehouseId);
                    } catch {
                      setImportInfo(
                        "Import failed. Ensure valid FeatureCollection with Polygon features."
                      );
                    }
                  }}
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <input
                id="overwrite"
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
              />
              <label htmlFor="overwrite" className="text-gray-700">
                Overwrite existing zones
              </label>
            </div>

            {importInfo && (
              <div className="mt-2 text-sm text-gray-600">{importInfo}</div>
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">Zones</div>
              <div className="text-sm text-gray-500 mt-1">
                Active: {activeZones.length} • Total: {zones.length}
              </div>
            </div>
            <a className="text-sm underline text-gray-700" href="/admin/audit">
              View audit trail →
            </a>
          </div>

          <div className="mt-4 grid gap-3">
            {zones.map((z) => (
              <div
                key={z.id}
                className="rounded-2xl border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 h-3 w-3 rounded-full"
                    style={{ background: z.color }}
                  />
                  <div>
                    <div className="font-medium">
                      #{z.id} — {z.name}{" "}
                      {!z.is_active && (
                        <span className="text-xs text-gray-500">
                          (disabled)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Points: {z.coords?.length ?? 0} • Warehouse:{" "}
                      {z.warehouse_id}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="text-sm text-gray-700 underline"
                    onClick={async () => {
                      try {
                        const v: any = await api.zoneVersions(z.id);
                        setVersions(v || []);
                        setSelectedZoneName(z.name);
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
                    onClick={() => onDisable(z.id)}
                  >
                    Disable
                  </button>
                </div>
              </div>
            ))}

            {zones.length === 0 && (
              <div className="text-sm text-gray-600">
                No zones found. Create one from left panel.
              </div>
            )}
          </div>

          <div className="mt-5 text-xs text-gray-500">
            Format for coords input:
            <code className="ml-2 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
              lat,lng
            </code>{" "}
            per line. Polygon must be closed (first point equals last point).
          </div>
        </Card>
      </div>

      {/* Versions Modal */}
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
                  <div className="font-semibold text-lg">Zone Versions</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedZoneName}
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
                Every create/update/disable/import generates a snapshot version
                + audit entry.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </div>
  );
}
