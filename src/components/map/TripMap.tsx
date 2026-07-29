"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import useSupercluster from "use-supercluster";
import type { BBox } from "geojson";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/utils";
import { describeBeds } from "@/lib/beds";
import type { Coordinates, HotelOption, RentalListing } from "@/types";

interface MapPointProps {
  id: string;
  title: string;
  markerType: "rental" | "hotel";
  price: number;
  currency: string;
  bedsLabel: string;
  url?: string;
}

interface TripMapProps {
  center: Coordinates;
  rentals: RentalListing[];
  hotels: HotelOption[];
}

const MARKER_COLOR: Record<MapPointProps["markerType"], string> = {
  rental: "#2563eb",
  hotel: "#d97706",
};

function markerIcon(type: MapPointProps["markerType"]) {
  const color = MARKER_COLOR[type];
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:9999px;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function clusterIcon(count: number) {
  const size = count < 10 ? 32 : count < 50 ? 40 : 48;
  return L.divIcon({
    className: "",
    html: `<div style="background:#4f46e5;color:white;width:${size}px;height:${size}px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function BoundsWatcher({ onChange }: { onChange: (bounds: BBox, zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const b = map.getBounds();
    onChange([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], map.getZoom());
    // Only on mount — moveend below keeps it in sync after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onChange([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], map.getZoom());
    },
  });

  return null;
}

function ClusteredMarkers({
  points,
  bounds,
  zoom,
}: {
  points: Array<{
    type: "Feature";
    properties: MapPointProps;
    geometry: { type: "Point"; coordinates: [number, number] };
  }>;
  bounds?: BBox;
  zoom: number;
}) {
  const map = useMap();
  const { clusters, supercluster } = useSupercluster<MapPointProps>({
    points,
    bounds,
    zoom,
    options: { radius: 60, maxZoom: 17 },
  });

  return (
    <>
      {clusters.map((point) => {
        const [lng, lat] = point.geometry.coordinates;
        const props = point.properties;

        if ("cluster" in props && props.cluster) {
          return (
            <Marker
              key={`cluster-${props.cluster_id}`}
              position={[lat, lng]}
              icon={clusterIcon(props.point_count)}
              eventHandlers={{
                click: () => {
                  if (!supercluster) return;
                  const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(props.cluster_id), 17);
                  map.flyTo([lat, lng], expansionZoom, { duration: 0.5 });
                },
              }}
            />
          );
        }

        return (
          <Marker key={props.id} position={[lat, lng]} icon={markerIcon(props.markerType)}>
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{props.title}</p>
                <p className="text-muted-foreground">{props.bedsLabel}</p>
                <p className="font-semibold">{formatCurrency(props.price, props.currency)}/night</p>
                {props.url && (
                  <a href={props.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    View listing
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function TripMap({ center, rentals, hotels }: TripMapProps) {
  const [bounds, setBounds] = useState<BBox | undefined>();
  const [zoom, setZoom] = useState(12);

  const points = useMemo(() => {
    const rentalPoints = rentals.map((l) => ({
      type: "Feature" as const,
      properties: {
        id: l.id,
        title: l.title,
        markerType: "rental" as const,
        price: l.pricePerNight,
        currency: l.currency,
        bedsLabel: describeBeds(l.beds),
        url: l.url,
      },
      geometry: { type: "Point" as const, coordinates: [l.coordinates.lng, l.coordinates.lat] as [number, number] },
    }));
    const hotelPoints = hotels.map((h, i) => ({
      type: "Feature" as const,
      properties: {
        id: `hotel-${i}`,
        title: h.name,
        markerType: "hotel" as const,
        price: h.cheapestPrice,
        currency: h.prices[0]?.currency ?? "USD",
        bedsLabel: describeBeds(h.beds),
        url: h.prices.find((p) => p.platform === h.cheapestPlatform)?.url,
      },
      geometry: { type: "Point" as const, coordinates: [h.coordinates.lng, h.coordinates.lat] as [number, number] },
    }));
    return [...rentalPoints, ...hotelPoints];
  }, [rentals, hotels]);

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border">
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher onChange={(b, z) => { setBounds(b); setZoom(z); }} />
        <ClusteredMarkers points={points} bounds={bounds} zoom={zoom} />
      </MapContainer>
      <div className="flex items-center gap-4 text-xs text-muted-foreground p-2 border-t bg-muted/30">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: MARKER_COLOR.rental }} />
          Rentals
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: MARKER_COLOR.hotel }} />
          Hotels
        </span>
      </div>
    </div>
  );
}
