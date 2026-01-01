// C:\BILAL Important\zonepilot-fullstack\web\src\lib\types.ts

export type ID = number;

export type LoginResponse = {
  access_token: string;
  token_type?: string;
  email?: string;
  role?: string;
};

export type Warehouse = {
  id: ID;
  name: string;
  city?: string;
  lat: number;
  lng: number;
  is_active: boolean;
};

export type PricingSlab = {
  id: ID;
  warehouse_id: ID;
  name: string;
  min_km: number;
  max_km: number;
  flat_fee: number;
  per_km_fee: number;
  currency: string;
  is_active: boolean;
};

export type PricingVersion = {
  id: ID;
  warehouse_id: ID;
  created_at: string;

  // ✅ FIX: UI pages expect these sometimes
  version?: number | string;
  actor_user_id?: ID;
  slab?: string;

  // existing fields
  action?: string;
  snapshot?: PricingSlab[]; // keep optional so older data doesn’t break TS

  // allow backend extra fields without breaking strict mode
  [key: string]: unknown;
};

export type ZoneCoord = [number, number];

export type Zone = {
  id: ID;
  warehouse_id: ID;
  name: string;
  color: string; // IMPORTANT: not null (fixes your background/null TS error)
  coords: ZoneCoord[];
  is_active: boolean;

  [key: string]: unknown;
};

export type ZoneVersion = {
  id: ID;
  warehouse_id: ID;
  created_at: string;

  // ✅ FIX: UI pages expect these sometimes
  version?: number | string;
  actor_user_id?: ID;

  // existing fields
  action?: string;
  snapshot?: Zone[];

  [key: string]: unknown;
};

export type AnalyticsSummary = {
  total_quotes_24h?: number;
  serviceable_quotes_24h?: number;
  avg_distance_km_24h?: number;
  avg_price_24h?: number;

  // if your backend uses different keys, pages can still compile
  total_quotes?: number;
  serviceable_quotes?: number;
  avg_distance_km?: number;
  avg_price?: number;

  [key: string]: unknown;
};

export type QuoteRequest = {
  warehouse_id: ID;
  dest_lat: number;
  dest_lng: number;

  [key: string]: unknown;
};

export type Quote = {
  serviceable: boolean;
  matched_zone: string | null;
  distance_km: number;
  price: number;
  currency: string;
  slab_name: string | null;

  [key: string]: unknown;
};

export type AuditLog = {
  id: ID;
  created_at: string;

  // ✅ FIX: UI expects these
  entity_type?: string;
  actor_user_id?: ID;

  // existing fields (keep backward compatibility)
  actor_email?: string;
  action?: string;
  entity?: string;
  entity_id?: number | string;
  snapshot?: unknown;
  meta?: unknown;

  [key: string]: unknown;
};

// ✅ Used by api.createZone(payload)
export type CreateZonePayload = {
  warehouse_id: ID;
  geojson: unknown;
  overwrite?: boolean;
};
// ✅ Delivery App Types
export type Vehicle = {
  id: ID;
  name: string; // "Two Wheeler", "Auto", "Mini Truck"
  icon: string;
  max_weight_kg: number;
  base_fare: number;
  per_km_rate: number;
  per_kg_rate: number;
  is_active: boolean;
  display_order: number;
};

export type OrderCreate = {
  vehicle_id: ID;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;
  item_category: string;
  item_name: string;
  item_weight_kg: number;
  item_notes?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  special_requests?: string;
};

export type Order = {
  id: ID;
  vehicle_id: ID;
  vehicle_name: string;

  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;

  delivery_address: string;
  delivery_lat: number;
  delivery_lng: number;

  item_category: string;
  item_name: string;
  item_weight_kg: number;
  item_notes?: string;

  distance_km: number;
  zone: string;

  base_fare: number;
  distance_charge: number;
  weight_charge: number;
  zone_multiplier: number;
  total_price: number;

  status: "QUOTE" | "CONFIRMED" | "PICKED_UP" | "DELIVERED" | "CANCELLED";

  customer_name: string;
  customer_phone: string;
  customer_email: string;
  special_requests?: string;

  created_at: string;
  updated_at: string;
};
