"use client";

import dynamic from "next/dynamic";
import LeafletFix from "./LeafletFix";

type MapProps = {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
};

const Map = dynamic<MapProps>(() => import("./_MapInner"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse bg-white/5" />,
});

export default function PointPickerMap(props: MapProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <LeafletFix />
      <Map {...props} />
    </div>
  );
}
