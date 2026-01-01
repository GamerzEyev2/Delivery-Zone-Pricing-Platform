"use client";

import MagneticButton from "@/components/animations/MagneticButton";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import type { Order, OrderCreate, Vehicle } from "@/lib/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BookingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [quote, setQuote] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    pickup_address: "",
    pickup_lat: 28.6139,
    pickup_lng: 77.209,
    delivery_address: "",
    delivery_lat: 28.5,
    delivery_lng: 77.25,
    item_category: "Documents",
    item_name: "Package",
    item_weight_kg: 1,
    item_notes: "",
    special_requests: "",
  });

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await api.vehicles();
        setVehicles(data);
      } catch (err) {
        setError(`Failed to load vehicles: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name.includes("lat") || name.includes("lng") || name.includes("weight")
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleGetQuote = async () => {
    if (!selectedVehicle) {
      setError("Please select a vehicle");
      return;
    }

    if (!form.customer_name || !form.customer_phone) {
      setError("Please fill in customer details");
      return;
    }

    if (!form.pickup_address || !form.delivery_address) {
      setError("Please fill in both addresses");
      return;
    }

    setError("");
    setQuote(null);

    try {
      const payload: OrderCreate = {
        vehicle_id: selectedVehicle.id,
        ...form,
      };

      const result = await api.createOrder(payload);
      setQuote(result);
      setSuccess(`Quote generated! Total: ₹${result.total_price.toFixed(2)}`);
    } catch (err) {
      setError(`Failed to generate quote: ${err}`);
    }
  };

  const handleConfirmOrder = async () => {
    if (!quote) return;

    try {
      await api.updateOrderStatus(quote.id, "CONFIRMED");
      setSuccess("Order confirmed! Check your email for details.");
      setTimeout(() => {
        setForm({
          customer_name: "",
          customer_phone: "",
          customer_email: "",
          pickup_address: "",
          pickup_lat: 28.6139,
          pickup_lng: 77.209,
          delivery_address: "",
          delivery_lat: 28.5,
          delivery_lng: 77.25,
          item_category: "Documents",
          item_name: "Package",
          item_weight_kg: 1,
          item_notes: "",
          special_requests: "",
        });
        setSelectedVehicle(null);
        setQuote(null);
      }, 2000);
    } catch (err) {
      setError(`Failed to confirm order: ${err}`);
    }
  };

  const itemCategories = [
    "Documents",
    "Electronics",
    "Clothing",
    "Food",
    "Books",
    "Furniture",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Book Your Delivery
          </h1>
          <p className="text-slate-300 text-lg">
            Fast, reliable delivery across Delhi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Selection */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">
                1. Select Vehicle Type
              </h2>

              {loading ? (
                <p className="text-slate-400">Loading vehicles...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <motion.button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedVehicle?.id === vehicle.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 hover:border-slate-600 bg-slate-800"
                      }`}
                    >
                      <div className="text-2xl mb-2">🚗</div>
                      <div className="font-semibold text-white">
                        {vehicle.name}
                      </div>
                      <div className="text-sm text-slate-400 mt-2">
                        Base: ₹{vehicle.base_fare}
                      </div>
                      <div className="text-sm text-slate-400">
                        Max: {vehicle.max_weight_kg}kg
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </Card>

            {/* Customer Details */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">
                2. Customer Details
              </h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="customer_name"
                  placeholder="Full Name"
                  value={form.customer_name}
                  onChange={handleInputChange}
                />
                <Input
                  type="tel"
                  name="customer_phone"
                  placeholder="Phone Number"
                  value={form.customer_phone}
                  onChange={handleInputChange}
                />
                <Input
                  type="email"
                  name="customer_email"
                  placeholder="Email Address"
                  value={form.customer_email}
                  onChange={handleInputChange}
                />
              </div>
            </Card>

            {/* Pickup & Delivery */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">
                3. Locations
              </h2>
              <div className="space-y-6">
                {/* Pickup */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    📍 Pickup Address
                  </label>
                  <Input
                    type="text"
                    name="pickup_address"
                    placeholder="e.g., 123 Connaught Place, Delhi"
                    value={form.pickup_address}
                    onChange={handleInputChange}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="number"
                      name="pickup_lat"
                      placeholder="Latitude"
                      value={form.pickup_lat}
                      onChange={handleInputChange}
                      step="0.0001"
                    />
                    <Input
                      type="number"
                      name="pickup_lng"
                      placeholder="Longitude"
                      value={form.pickup_lng}
                      onChange={handleInputChange}
                      step="0.0001"
                    />
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    📦 Delivery Address
                  </label>
                  <Input
                    type="text"
                    name="delivery_address"
                    placeholder="e.g., 456 Rajiv Chowk, Delhi"
                    value={form.delivery_address}
                    onChange={handleInputChange}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      type="number"
                      name="delivery_lat"
                      placeholder="Latitude"
                      value={form.delivery_lat}
                      onChange={handleInputChange}
                      step="0.0001"
                    />
                    <Input
                      type="number"
                      name="delivery_lng"
                      placeholder="Longitude"
                      value={form.delivery_lng}
                      onChange={handleInputChange}
                      step="0.0001"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Item Details */}
            <Card>
              <h2 className="text-xl font-semibold text-white mb-4">
                4. Package Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      name="item_category"
                      value={form.item_category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    >
                      {itemCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    type="text"
                    name="item_name"
                    placeholder="Item Name"
                    value={form.item_name}
                    onChange={handleInputChange}
                  />
                </div>
                <Input
                  type="number"
                  name="item_weight_kg"
                  placeholder="Weight (kg)"
                  value={form.item_weight_kg}
                  onChange={handleInputChange}
                  step="0.1"
                />
                <textarea
                  name="item_notes"
                  placeholder="Special instructions..."
                  value={form.item_notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none h-24"
                />
              </div>
            </Card>
          </div>

          {/* Quote Section */}
          <div className="lg:col-span-1">
            {error && (
              <Card className="mb-4 border-red-500/50 bg-red-500/10">
                <p className="text-red-400 text-sm">{error}</p>
              </Card>
            )}

            {success && (
              <Card className="mb-4 border-green-500/50 bg-green-500/10">
                <p className="text-green-400 text-sm">{success}</p>
              </Card>
            )}

            {!quote ? (
              <Card className="sticky top-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Quote Summary
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Select vehicle and fill details to get a quote
                  </p>
                  <MagneticButton
                    onClick={handleGetQuote}
                    disabled={!selectedVehicle}
                    className={`w-full ${
                      !selectedVehicle ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Get Quote →
                  </MagneticButton>
                </div>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Quote Accepted!
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-300">
                      <span>Base Fare:</span>
                      <span className="text-white font-medium">
                        ₹{quote.base_fare.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Distance ({quote.distance_km.toFixed(1)}km):</span>
                      <span className="text-white font-medium">
                        ₹{quote.distance_charge.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Weight ({quote.item_weight_kg}kg):</span>
                      <span className="text-white font-medium">
                        ₹{quote.weight_charge.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Zone Multiplier ({quote.zone}):</span>
                      <span className="text-white font-medium">
                        {quote.zone_multiplier.toFixed(1)}x
                      </span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        ₹{quote.total_price.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <Badge variant="default">{quote.vehicle_name}</Badge>
                    <Badge variant="secondary">{quote.zone}</Badge>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                  >
                    Confirm Order
                  </button>

                  <button
                    onClick={() => {
                      setQuote(null);
                      setSelectedVehicle(null);
                    }}
                    className="w-full py-2 mt-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all"
                  >
                    Reset
                  </button>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
