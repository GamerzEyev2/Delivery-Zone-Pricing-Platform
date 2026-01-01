"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { AnalyticsSummary, Warehouse } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AnalyticsPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .warehouses()
      .then((w: any) => {
        setWarehouses(w || []);
        if (w?.[0]?.id) setWarehouseId(w[0].id);
      })
      .catch(() => setErr("Backend not reachable. Start FastAPI first."));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await api.analyticsSummary(warehouseId);
        if (cancelled) return;
        setErr(null);
        setSummary(data);
      } catch (e) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : String(e));
        setSummary(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [warehouseId]);


  const chartData = useMemo(() => {
    return rows.map((x, i) => ({
      idx: i + 1,
      price: x.price,
      distance: x.distance_km,
      at: x.created_at,
    }));
  }, [rows]);

  return (
    <div className="container-page pt-10">
      <div className="flex items-center gap-2">
        <Badge>Analytics</Badge>
        <Badge>Charts</Badge>
        <Badge>Real DB data</Badge>
      </div>

      <h1 className="h2 font-[var(--font-sora)] mt-3">Analytics Dashboard</h1>
      <p className="p mt-2 max-w-3xl">
        These numbers come from the quote logs table. Use the simulator to
        generate more records.
      </p>

      {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

      <div className="mt-6">
        <div className="text-sm text-gray-500">Warehouse</div>
        <select
          className="mt-2 w-full max-w-xl rounded-xl border border-gray-200 px-3 py-2 text-sm"
          value={warehouseId ?? ""}
          onChange={(e) => setWarehouseId(Number(e.target.value))}
        >
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              #{w.id} — {w.name} ({w.city})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-gray-500">Total Quotes</div>
          <div className="text-2xl font-semibold mt-1">
            {summary?.total_quotes ?? "—"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500">Serviceable</div>
          <div className="text-2xl font-semibold mt-1">
            {summary?.serviceable_quotes ?? "—"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500">Avg Distance (km)</div>
          <div className="text-2xl font-semibold mt-1">
            {summary?.avg_distance_km ?? "—"}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-gray-500">Avg Price</div>
          <div className="text-2xl font-semibold mt-1">
            {summary?.avg_price ?? "—"}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="font-semibold">Price Trend (recent quotes)</div>
          <div className="text-sm text-gray-500 mt-1">
            X = quote index, Y = price
          </div>
          <div className="mt-4 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="idx" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold">Recent Quotes (table)</div>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Distance</th>
                  <th className="text-left py-2">Price</th>
                  <th className="text-left py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .slice(-20)
                  .reverse()
                  .map((x) => (
                    <tr key={x.id} className="border-t border-gray-100">
                      <td className="py-2">{x.id}</td>
                      <td className="py-2">{x.distance_km} km</td>
                      <td className="py-2">
                        {x.currency} {x.price}
                      </td>
                      <td className="py-2">
                        {String(x.created_at).slice(0, 19).replace("T", " ")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Use Simulation page to generate more quotes for better charts.
          </div>
        </Card>
      </div>

      <div className="h-20" />
    </div>
  );
}
