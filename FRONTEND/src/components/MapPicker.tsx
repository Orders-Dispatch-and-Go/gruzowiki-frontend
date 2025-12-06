import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Coordinate, MapLocation } from "../types/cargo";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  onLocationSelect: (location: MapLocation) => void;
  initialLocation?: Coordinate;
  initialAddress?: string;
  height?: number;
}

const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelect,
  initialLocation,
  initialAddress = "",
  height = 350,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      attributionControl: false,
    }).setView(
      initialLocation
        ? [initialLocation.lat, initialLocation.lon]
        : [55.7558, 37.6173],
      14
    );

    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    L.control
      .attribution({ prefix: "" })
      .addAttribution("© OpenStreetMap")
      .addTo(map);

    if (initialLocation) {
      const marker = L.marker(
        [initialLocation.lat, initialLocation.lon],
        { draggable: true }
      ).addTo(map);

      markerRef.current = marker;

      marker.on("dragend", async (e) => {
        const pos = e.target.getLatLng();
        handleSelect({ lat: pos.lat, lon: pos.lng });
      });
    }

    map.on("click", (e) => {
      const coords = { lat: e.latlng.lat, lon: e.latlng.lng };
      handleSelect(coords);
    });

    return () => {map.remove();
  };  }, []);

  async function handleSelect(coords: Coordinate) {
    const addr = await geocodeCoords(coords);
    setAddress(addr);

    markerRef.current?.setLatLng([coords.lat, coords.lon]);

    onLocationSelect({ coords, address: addr });
  }

  async function geocodeCoords(c: Coordinate): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lon}&accept-language=ru`;
      const res = await fetch(url);
      const data = await res.json();
      return data.display_name || "Адрес не найден";
    } catch {
      return "Адрес не найден";
    }
  }

  return (
    <div style={{ width: "100%", height }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      />
    </div>
  );
};

export default MapPicker;
