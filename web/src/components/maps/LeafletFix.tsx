"use client";

import { useEffect } from "react";

type IconDefaultWithProto = typeof L.Icon.Default & {
  prototype: { _getIconUrl?: unknown };
};

export default function LeafletFix() {
  useEffect(() => {
    // Only import Leaflet on client side
    import("leaflet").then((L) => {
      const IconDefault = L.Icon.Default as unknown as IconDefaultWithProto;

      // remove private getter so Leaflet uses our URLs
      if (IconDefault.prototype._getIconUrl) {
        delete IconDefault.prototype._getIconUrl;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  return null;
}
