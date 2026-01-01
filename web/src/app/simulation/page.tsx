"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import MagneticButton from "@/components/animations/MagneticButton";
import PointPickerMap from "@/components/maps/PointPickerMap";
import { api } from "@/lib/api";
import type { Quote, Warehouse } from "@/lib/types";

export default function SimulationPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);

  const [lat, setLat] = useState<number>(28.6139);
  const [lng, setLng] = useState<number>(77.209);

  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .warehouses()
      .then((w: any) => {
        setWarehouses(w || []);
        if (w?.[0]?.id) {
          setWarehouseId(w[0].id);
          setLat(w[0].lat);
          setLng(w[0].lng);
        }
      })
      .catch(() => setWarehouses([]));
  }, []);

  const wh = useMemo(
    () => warehouses.find((x) => x.id === warehouseId) || null,
    [warehouses, warehouseId]
  );

  async function getQuote() {
    if (!warehouseId) return;
    try {
      setErr(null);
      setLoading(true);
      const res: any = await api.quote({
        warehouse_id: warehouseId,
        dest_lat: Number(lat),
        dest_lng: Number(lng),
      });
      setQuote(res);
    } catch {
      setErr("Quote failed. Check backend running + valid coordinates.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page pt-10">
      <div className="flex items-center gap-2">
        <Badge>Simulation</Badge>
        <Badge>OpenStreetMap</Badge>
        <Badge>Real pricing engine</Badge>
      </div>

      <h1 className="h2 font-[var(--font-sora)] mt-3">
        Delivery Quote Simulator
      </h1>
      <p className="p mt-2 max-w-3xl">
        Click on the map to choose destination coordinates. Backend will check
        zone polygon serviceability, calculate distance, apply pricing slab, and
        store quote logs (for analytics).
      </p>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-1">
          <div className="font-semibold">Inputs</div>

          <div className="mt-4 text-sm text-gray-500">Warehouse</div>
          <select
            className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={warehouseId ?? ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              setWarehouseId(id);
              const w = warehouses.find((x) => x.id === id);
              if (w) {
                setLat(w.lat);
                setLng(w.lng);
              }
            }}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                #{w.id} — {w.name} ({w.city})
              </option>
            ))}
          </select>

          <div className="mt-4 text-sm text-gray-500">Destination Lat</div>
          <Input
            value={String(lat)}
            onChange={(e) => setLat(Number(e.target.value))}
          />

          <div className="mt-4 text-sm text-gray-500">Destination Lng</div>
          <Input
            value={String(lng)}
            onChange={(e) => setLng(Number(e.target.value))}
          />

          <div className="mt-5">
            <MagneticButton className="w-full" onClick={getQuote}>
              {loading ? "Calculating..." : "Get Quote"}
            </MagneticButton>
          </div>

          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

          <div className="mt-5 text-xs text-gray-500">
            Tip: The engine caches results for 10 minutes (TTL). When
            zones/pricing change, cache is cleared automatically.
          </div>
        </Card>

        <Card className="p-3 lg:col-span-2">
          <div className="px-3 pt-3 pb-2">
            <div className="font-semibold">Map (click to pick)</div>
            <div className="text-sm text-gray-500 mt-1">
              Current: {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
          </div>

          <div className="px-3 pb-3">
            <PointPickerMap
              lat={lat}
              lng={lng}
              onPick={(a, b) => {
                setLat(a);
                setLng(b);
              }}
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="font-semibold">Result</div>
          {!quote ? (
            <div className="mt-3 text-sm text-gray-600">
              Run a quote to see serviceability and pricing breakdown.
            </div>
          ) : (
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="text-gray-500">Serviceable</div>
                <div className="mt-1 font-semibold">
                  {quote.serviceable ? "Yes ✅" : "No ❌"}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="text-gray-500">Matched Zone</div>
                <div className="mt-1 font-semibold">
                  {quote.matched_zone ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="text-gray-500">Distance</div>
                <div className="mt-1 font-semibold">{quote.distance_km} km</div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="text-gray-500">Price</div>
                <div className="mt-1 font-semibold">
                  {quote.currency} {quote.price}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-4 sm:col-span-2">
                <div className="text-gray-500">Pricing Slab</div>
                <div className="mt-1 font-semibold">
                  {quote.slab_name ?? "—"}
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="font-semibold">Warehouse context</div>
          <p className="text-sm text-gray-600 mt-2">
            Warehouse is the origin point for distance calculation. You can
            create multiple warehouses and maintain different zones/pricing per
            warehouse.
          </p>

          <div className="mt-4 rounded-2xl border border-gray-100 p-4 text-sm">
            <div className="text-gray-500">Selected warehouse</div>
            <div className="mt-1 font-semibold">
              {wh ? `#${wh.id} — ${wh.name} (${wh.city})` : "—"}
            </div>
            {wh && (
              <div className="mt-1 text-gray-600">
                Origin: {wh.lat.toFixed(4)}, {wh.lng.toFixed(4)}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Want “Google Maps”? You can integrate later, but for lifetime free
            portfolio, OpenStreetMap via Leaflet is perfect.
          </div>
        </Card>
      </div>

      <div className="h-20" />
    </div>
  );
}
