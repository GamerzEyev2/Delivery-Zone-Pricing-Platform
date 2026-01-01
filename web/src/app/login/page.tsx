"use client";

import MagneticButton from "@/components/animations/MagneticButton";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("admin@zonepilot.local");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (t) {
      // already logged in
    }
  }, []);

  async function onLogin() {
    try {
      setErr(null);
      setLoading(true);
      const res: any = await api.login(email, password);
      setToken(res.access_token);
      setCleared(false);
      r.push("/admin/zones");
    } catch {
      setErr("Login failed. Check email/password.");
    } finally {
      setLoading(false);
    }
  }

  function handleClearToken() {
    clearToken();
    setErr(null);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  return (
    <div className="container-page pt-10">
      <div className="flex items-center gap-2">
        <Badge>Admin</Badge>
        <Badge>JWT</Badge>
        <Badge>FastAPI</Badge>
      </div>

      <h1 className="h2 font-[var(--font-sora)] mt-3">Login</h1>
      <p className="p mt-2 max-w-2xl">
        This project seeds a demo admin automatically. Use the default
        credentials to explore Zones / Pricing / Audit and GeoJSON
        import-export.
      </p>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="font-semibold">Admin Login</div>

          <div className="mt-4 text-sm text-gray-500">Email</div>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zonepilot.local"
          />

          <div className="mt-4 text-sm text-gray-500">Password</div>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
          />

          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <MagneticButton className="w-full sm:w-auto" onClick={onLogin}>
              {loading ? "Signing in..." : "Sign In"}
            </MagneticButton>

            <MagneticButton
              className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200"
              onClick={handleClearToken}
            >
              {cleared ? "✓ Token Cleared" : "Clear Token"}
            </MagneticButton>
          </div>

          {cleared && (
            <div className="mt-4 text-sm text-green-600">
              Token cleared successfully. You can login again.
            </div>
          )}

          <div className="mt-5 text-xs text-gray-500">
            Tip: If you get 401/403 on admin pages, login again.
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-semibold">Default demo credentials</div>
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex items-center justify-between border-b border-gray-100 py-2">
              <span>Email</span>
              <code className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                admin@zonepilot.local
              </code>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 py-2">
              <span>Password</span>
              <code className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                Admin@123
              </code>
            </div>
          </div>

          <div className="mt-5 text-sm text-gray-600">
            After login, go to:
            <ul className="list-disc pl-5 mt-2">
              <li>/admin/zones — create zones, import/export GeoJSON</li>
              <li>/admin/pricing — manage slabs</li>
              <li>/admin/audit — view audit trail</li>
              <li>/analytics — KPI + charts</li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="h-20" />
    </div>
  );
}
