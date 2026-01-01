import type {
  AnalyticsSummary,
  AuditLog,
  CreateZonePayload,
  LoginResponse,
  Order,
  OrderCreate,
  PricingSlab,
  PricingVersion,
  Quote,
  QuoteRequest,
  Vehicle,
  Warehouse,
  Zone,
  ZoneVersion,
} from "./types";

// ✅ Change this to your backend URL if needed
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export const API_BASE = baseUrl;

function getTokenSafe(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("access_token");
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, ...init } = options;

  const headers = new Headers(init.headers);
  // only set JSON content-type when body is present and not already set
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getTokenSafe();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  // Add /api/v1 prefix to path
  const fullPath = path.startsWith("/api/v1") ? path : `/api/v1${path}`;

  const res = await fetch(`${API_BASE}${fullPath}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText} :: ${text}`);
  }

  // handle empty responses
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as unknown as T;
  return (await res.json()) as T;
}

/**
 * ✅ Supports BOTH calling styles so you don't have to change all pages:
 *   createZone({ warehouse_id, geojson, overwrite })
 *   createZone(warehouse_id, geojson, overwrite?)
 */
function createZone(payload: CreateZonePayload): Promise<Zone>;
function createZone(
  warehouse_id: number,
  geojson: unknown,
  overwrite?: boolean
): Promise<Zone>;
function createZone(
  a: CreateZonePayload | number,
  b?: unknown,
  c?: boolean
): Promise<Zone> {
  const payload: CreateZonePayload =
    typeof a === "number" ? { warehouse_id: a, geojson: b, overwrite: c } : a;

  return request<Zone>("/zones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * ✅ Supports BOTH:
 *   slabVersions(page)
 *   slabVersions(page, slab)
 */
function slabVersions(page: number, slab?: string): Promise<PricingVersion[]> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (slab) qs.set("slab", slab);

  return request<PricingVersion[]>(`/pricing/slab-versions?${qs.toString()}`, {
    method: "GET",
  });
}

export const api = {
  // -------------------------
  // Auth
  // -------------------------
  login(email: string, password: string) {
    // Backend uses OAuth2PasswordRequestForm which expects form-encoded data
    const formData = new URLSearchParams();
    formData.append("username", email); // Note: backend expects "username" not "email"
    formData.append("password", password);

    return request<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: formData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  // -------------------------
  // Warehouses / Zones
  // -------------------------
  warehouses() {
    return request<Warehouse[]>("/warehouses", { method: "GET" });
  },

  zones(warehouse_id: number) {
    return request<Zone[]>(`/zones?warehouse_id=${warehouse_id}`, {
      method: "GET",
    });
  },

  createZone,

  zoneVersions(zone_id: number) {
    return request<ZoneVersion[]>(`/zones/${zone_id}/versions`, {
      method: "GET",
    });
  },

  // -------------------------
  // Pricing / Slabs
  // -------------------------
  slabVersions,

  // OPTIONAL: if any page calls api.pricing(...)
  // ✅ If your backend path differs, change ONLY this endpoint string.
  pricing(warehouse_id: number) {
    return request<PricingSlab[]>(`/pricing?warehouse_id=${warehouse_id}`, {
      method: "GET",
    });
  },

  // -------------------------
  // Analytics (optional; signature allows 1 or 2 args)
  // -------------------------
  analyticsSummary(warehouse_id: number, days?: number) {
    const qs = new URLSearchParams();
    qs.set("warehouse_id", String(warehouse_id));
    if (days != null) qs.set("days", String(days));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<AnalyticsSummary>(`/analytics/summary${suffix}`, {
      method: "GET",
    });
  },

  // -------------------------
  // Quote / Simulation (optional)
  // -------------------------
  quote(payload: QuoteRequest) {
    return request<Quote>("/quote", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // -------------------------
  // Audit
  // -------------------------
  auditLogs(limit = 200, filter?: string) {
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    if (filter) qs.set("filter", filter);

    return request<AuditLog[]>(`/audit/logs?${qs.toString()}`, {
      method: "GET",
    });
  },

  // -------------------------
  // Vehicles (Delivery App)
  // -------------------------
  vehicles() {
    return request<Vehicle[]>("/vehicles", { method: "GET" });
  },

  getVehicle(vehicleId: number) {
    return request<Vehicle>(`/vehicles/${vehicleId}`, { method: "GET" });
  },

  // -------------------------
  // Orders (Delivery App)
  // -------------------------
  createOrder(payload: OrderCreate) {
    return request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getOrders(status?: string) {
    const qs = status ? `?status=${status}` : "";
    return request<Order[]>(`/orders${qs}`, { method: "GET" });
  },

  getOrder(orderId: number) {
    return request<Order>(`/orders/${orderId}`, { method: "GET" });
  },

  updateOrderStatus(orderId: number, status: string) {
    return request<Order>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ new_status: status }),
    });
  },
};

export default api;
