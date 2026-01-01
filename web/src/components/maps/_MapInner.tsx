"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

function Picker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function _MapInner({
  lat,
  lng,
  onPick,
}: {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={12}
      style={{ height: 380, width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Picker onPick={onPick} />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}
