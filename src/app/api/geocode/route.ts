import { NextRequest, NextResponse } from "next/server";
import { currencyForCountryCode } from "@/lib/destinations";

export interface GeocodeResult {
  city: string;
  admin1?: string;
  country: string;
  countryCode: string;
  currency: string;
  coordinates: { lat: number; lng: number };
}

interface OpenMeteoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

/**
 * GET /api/geocode?q=<place name>
 *
 * Proxies the free, keyless Open-Meteo Geocoding API so the browser doesn't
 * need to talk to a third-party host directly and so we can normalize the
 * response shape (and attach a currency guess) for the trip search form.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] satisfies GeocodeResult[] });
  }

  try {
    const upstream = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        q
      )}&count=8&language=en&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!upstream.ok) {
      return NextResponse.json({ results: [] satisfies GeocodeResult[] });
    }

    const data = (await upstream.json()) as { results?: OpenMeteoResult[] };
    const results: GeocodeResult[] = (data.results ?? []).map((r) => ({
      city: r.name,
      admin1: r.admin1,
      country: r.country ?? "Unknown",
      countryCode: r.country_code ?? "",
      currency: currencyForCountryCode(r.country_code),
      coordinates: { lat: r.latitude, lng: r.longitude },
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json({ results: [] satisfies GeocodeResult[] });
  }
}
