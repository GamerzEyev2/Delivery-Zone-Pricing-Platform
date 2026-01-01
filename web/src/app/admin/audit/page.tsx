"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AuditLog } from "@/lib/types";

export default function AdminAuditPage() {
  const r = useRouter();
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);


    useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          const data = await api.auditLogs(220, filter || undefined);
          if (cancelled) return;
          setErr(null);
          setRows(data ?? []);
        } catch (e) {
          if (cancelled) return;
          setErr(e instanceof Error ? e.message : String(e));
          setRows([]);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [filter]);

  return (
    <div className="container-page pt-10">
      <div className="flex items-center gap-2">
        <Badge>Admin</Badge>
        <Badge>Audit Trail</Badge>
        <Badge>Traceability</Badge>
      </div>

      <h1 className="h2 font-[var(--font-sora)] mt-3">Admin · Audit Trail</h1>
      <p className="p mt-2 max-w-3xl">
        Tracks who changed zones/pricing and when. This is a strong “enterprise”
        signal for recruiters.
      </p>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <div className="text-sm text-gray-500">Filter by entity type</div>
          <select
            className="mt-2 w-full max-w-sm rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="ZONE">ZONE</option>
            <option value="PRICING">PRICING</option>
          </select>
        </div>

        <a className="text-sm underline text-gray-700" href="/admin/zones">
          Back to zones →
        </a>
      </div>

      {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

      <Card className="mt-6 p-6 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">Action</th>
              <th className="text-left py-2">Entity</th>
              <th className="text-left py-2">Entity ID</th>
              <th className="text-left py-2">Actor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className="border-t border-gray-100">
                <td className="py-2">
                  {String(x.created_at).slice(0, 19).replace("T", " ")}
                </td>
                <td className="py-2 font-medium">{x.action}</td>
                <td className="py-2">{x.entity_type}</td>
                <td className="py-2">{x.entity_id ?? "—"}</td>
                <td className="py-2">{x.actor_user_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="text-sm text-gray-600 mt-3">
            No audit entries yet. Create/disable zones or slabs to generate
            logs.
          </div>
        )}
      </Card>

      <Card className="mt-4 p-6">
        <div className="font-semibold">Upgrade option (optional)</div>
        <div className="text-sm text-gray-600 mt-1">
          If you want, I can add an expandable row that shows JSON before/after
          snapshots with a clean diff UI.
        </div>
      </Card>

      <div className="h-20" />
    </div>
  );
}
