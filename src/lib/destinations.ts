/**
 * Curated worldwide destination list.
 *
 * Used to seed the simulated data generator with real coordinates/currency for
 * well-known cities without a network round trip, and as a fallback when the
 * live geocoding API (see src/app/api/geocode/route.ts) is unreachable.
 * Anything not in this list still works via live geocoding.
 */
import type { Coordinates } from "@/types";

export interface Destination {
  city: string;
  country: string;
  countryCode: string;
  currency: string;
  coordinates: Coordinates;
}

export const DESTINATIONS: Destination[] = [
  { city: "New York", country: "United States", countryCode: "US", currency: "USD", coordinates: { lat: 40.7128, lng: -74.006 } },
  { city: "Los Angeles", country: "United States", countryCode: "US", currency: "USD", coordinates: { lat: 34.0522, lng: -118.2437 } },
  { city: "Chicago", country: "United States", countryCode: "US", currency: "USD", coordinates: { lat: 41.8781, lng: -87.6298 } },
  { city: "Toronto", country: "Canada", countryCode: "CA", currency: "CAD", coordinates: { lat: 43.6532, lng: -79.3832 } },
  { city: "Vancouver", country: "Canada", countryCode: "CA", currency: "CAD", coordinates: { lat: 49.2827, lng: -123.1207 } },
  { city: "Mexico City", country: "Mexico", countryCode: "MX", currency: "MXN", coordinates: { lat: 19.4326, lng: -99.1332 } },
  { city: "London", country: "United Kingdom", countryCode: "GB", currency: "GBP", coordinates: { lat: 51.5072, lng: -0.1276 } },
  { city: "Paris", country: "France", countryCode: "FR", currency: "EUR", coordinates: { lat: 48.8566, lng: 2.3522 } },
  { city: "Berlin", country: "Germany", countryCode: "DE", currency: "EUR", coordinates: { lat: 52.52, lng: 13.405 } },
  { city: "Amsterdam", country: "Netherlands", countryCode: "NL", currency: "EUR", coordinates: { lat: 52.3676, lng: 4.9041 } },
  { city: "Barcelona", country: "Spain", countryCode: "ES", currency: "EUR", coordinates: { lat: 41.3874, lng: 2.1686 } },
  { city: "Madrid", country: "Spain", countryCode: "ES", currency: "EUR", coordinates: { lat: 40.4168, lng: -3.7038 } },
  { city: "Rome", country: "Italy", countryCode: "IT", currency: "EUR", coordinates: { lat: 41.9028, lng: 12.4964 } },
  { city: "Lisbon", country: "Portugal", countryCode: "PT", currency: "EUR", coordinates: { lat: 38.7223, lng: -9.1393 } },
  { city: "Vienna", country: "Austria", countryCode: "AT", currency: "EUR", coordinates: { lat: 48.2082, lng: 16.3738 } },
  { city: "Zurich", country: "Switzerland", countryCode: "CH", currency: "CHF", coordinates: { lat: 47.3769, lng: 8.5417 } },
  { city: "Oslo", country: "Norway", countryCode: "NO", currency: "NOK", coordinates: { lat: 59.9139, lng: 10.7522 } },
  { city: "Stockholm", country: "Sweden", countryCode: "SE", currency: "SEK", coordinates: { lat: 59.3293, lng: 18.0686 } },
  { city: "Copenhagen", country: "Denmark", countryCode: "DK", currency: "DKK", coordinates: { lat: 55.6761, lng: 12.5683 } },
  { city: "Helsinki", country: "Finland", countryCode: "FI", currency: "EUR", coordinates: { lat: 60.1699, lng: 24.9384 } },
  { city: "Reykjavik", country: "Iceland", countryCode: "IS", currency: "ISK", coordinates: { lat: 64.1466, lng: -21.9426 } },
  { city: "Dublin", country: "Ireland", countryCode: "IE", currency: "EUR", coordinates: { lat: 53.3498, lng: -6.2603 } },
  { city: "Warsaw", country: "Poland", countryCode: "PL", currency: "PLN", coordinates: { lat: 52.2297, lng: 21.0122 } },
  { city: "Prague", country: "Czech Republic", countryCode: "CZ", currency: "CZK", coordinates: { lat: 50.0755, lng: 14.4378 } },
  { city: "Athens", country: "Greece", countryCode: "GR", currency: "EUR", coordinates: { lat: 37.9838, lng: 23.7275 } },
  { city: "Istanbul", country: "Turkey", countryCode: "TR", currency: "TRY", coordinates: { lat: 41.0082, lng: 28.9784 } },
  { city: "Moscow", country: "Russia", countryCode: "RU", currency: "RUB", coordinates: { lat: 55.7558, lng: 37.6173 } },
  { city: "Dubai", country: "United Arab Emirates", countryCode: "AE", currency: "AED", coordinates: { lat: 25.2048, lng: 55.2708 } },
  { city: "Doha", country: "Qatar", countryCode: "QA", currency: "QAR", coordinates: { lat: 25.2854, lng: 51.531 } },
  { city: "Tel Aviv", country: "Israel", countryCode: "IL", currency: "ILS", coordinates: { lat: 32.0853, lng: 34.7818 } },
  { city: "Cairo", country: "Egypt", countryCode: "EG", currency: "EGP", coordinates: { lat: 30.0444, lng: 31.2357 } },
  { city: "Cape Town", country: "South Africa", countryCode: "ZA", currency: "ZAR", coordinates: { lat: -33.9249, lng: 18.4241 } },
  { city: "Nairobi", country: "Kenya", countryCode: "KE", currency: "KES", coordinates: { lat: -1.2921, lng: 36.8219 } },
  { city: "Lagos", country: "Nigeria", countryCode: "NG", currency: "NGN", coordinates: { lat: 6.5244, lng: 3.3792 } },
  { city: "Marrakesh", country: "Morocco", countryCode: "MA", currency: "MAD", coordinates: { lat: 31.6295, lng: -7.9811 } },
  { city: "Tokyo", country: "Japan", countryCode: "JP", currency: "JPY", coordinates: { lat: 35.6762, lng: 139.6503 } },
  { city: "Osaka", country: "Japan", countryCode: "JP", currency: "JPY", coordinates: { lat: 34.6937, lng: 135.5023 } },
  { city: "Seoul", country: "South Korea", countryCode: "KR", currency: "KRW", coordinates: { lat: 37.5665, lng: 126.978 } },
  { city: "Beijing", country: "China", countryCode: "CN", currency: "CNY", coordinates: { lat: 39.9042, lng: 116.4074 } },
  { city: "Shanghai", country: "China", countryCode: "CN", currency: "CNY", coordinates: { lat: 31.2304, lng: 121.4737 } },
  { city: "Hong Kong", country: "Hong Kong", countryCode: "HK", currency: "HKD", coordinates: { lat: 22.3193, lng: 114.1694 } },
  { city: "Singapore", country: "Singapore", countryCode: "SG", currency: "SGD", coordinates: { lat: 1.3521, lng: 103.8198 } },
  { city: "Bangkok", country: "Thailand", countryCode: "TH", currency: "THB", coordinates: { lat: 13.7563, lng: 100.5018 } },
  { city: "Bali", country: "Indonesia", countryCode: "ID", currency: "IDR", coordinates: { lat: -8.3405, lng: 115.092 } },
  { city: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", currency: "MYR", coordinates: { lat: 3.139, lng: 101.6869 } },
  { city: "Mumbai", country: "India", countryCode: "IN", currency: "INR", coordinates: { lat: 19.076, lng: 72.8777 } },
  { city: "Delhi", country: "India", countryCode: "IN", currency: "INR", coordinates: { lat: 28.7041, lng: 77.1025 } },
  { city: "Sydney", country: "Australia", countryCode: "AU", currency: "AUD", coordinates: { lat: -33.8688, lng: 151.2093 } },
  { city: "Melbourne", country: "Australia", countryCode: "AU", currency: "AUD", coordinates: { lat: -37.8136, lng: 144.9631 } },
  { city: "Auckland", country: "New Zealand", countryCode: "NZ", currency: "NZD", coordinates: { lat: -36.8485, lng: 174.7633 } },
  { city: "Sao Paulo", country: "Brazil", countryCode: "BR", currency: "BRL", coordinates: { lat: -23.5505, lng: -46.6333 } },
  { city: "Rio de Janeiro", country: "Brazil", countryCode: "BR", currency: "BRL", coordinates: { lat: -22.9068, lng: -43.1729 } },
  { city: "Buenos Aires", country: "Argentina", countryCode: "AR", currency: "ARS", coordinates: { lat: -34.6037, lng: -58.3816 } },
  { city: "Santiago", country: "Chile", countryCode: "CL", currency: "CLP", coordinates: { lat: -33.4489, lng: -70.6693 } },
  { city: "Lima", country: "Peru", countryCode: "PE", currency: "PEN", coordinates: { lat: -12.0464, lng: -77.0428 } },
  { city: "Bogota", country: "Colombia", countryCode: "CO", currency: "COP", coordinates: { lat: 4.711, lng: -74.0721 } },
];

const norm = (s: string) => s.trim().toLowerCase();

/** Fuzzy lookup by city name (and optionally "City, Country" free text). */
export function findDestination(query: string): Destination | undefined {
  const q = norm(query.split(",")[0]);
  return (
    DESTINATIONS.find((d) => norm(d.city) === q) ||
    DESTINATIONS.find((d) => norm(d.city).startsWith(q) || q.startsWith(norm(d.city)))
  );
}

export function searchDestinations(query: string, limit = 8): Destination[] {
  const q = norm(query);
  if (!q) return [];
  return DESTINATIONS.filter(
    (d) => norm(d.city).includes(q) || norm(d.country).includes(q)
  ).slice(0, limit);
}

/** ISO 3166-1 alpha-2 country code -> currency code, for destinations outside the curated list above. */
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", CA: "CAD", MX: "MXN", GB: "GBP", IE: "EUR",
  FR: "EUR", DE: "EUR", NL: "EUR", ES: "EUR", IT: "EUR", PT: "EUR",
  AT: "EUR", BE: "EUR", GR: "EUR", FI: "EUR", LU: "EUR", SI: "EUR", SK: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", HR: "EUR", CY: "EUR", MT: "EUR",
  CH: "CHF", NO: "NOK", SE: "SEK", DK: "DKK", IS: "ISK",
  PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", BG: "BGN",
  TR: "TRY", RU: "RUB", UA: "UAH",
  AE: "AED", QA: "QAR", SA: "SAR", KW: "KWD", IL: "ILS", JO: "JOD",
  EG: "EGP", ZA: "ZAR", KE: "KES", NG: "NGN", MA: "MAD", TN: "TND", GH: "GHS",
  JP: "JPY", KR: "KRW", CN: "CNY", HK: "HKD", TW: "TWD", SG: "SGD",
  TH: "THB", ID: "IDR", MY: "MYR", VN: "VND", PH: "PHP",
  IN: "INR", PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR",
  AU: "AUD", NZ: "NZD",
  BR: "BRL", AR: "ARS", CL: "CLP", PE: "PEN", CO: "COP", UY: "UYU", EC: "USD",
};

export function currencyForCountryCode(countryCode: string | undefined): string {
  if (!countryCode) return "USD";
  const code = countryCode.toUpperCase();
  return COUNTRY_CURRENCY[code] ?? DESTINATIONS.find((d) => d.countryCode === code)?.currency ?? "USD";
}

export interface ResolvedDestination {
  coordinates: Coordinates;
  country?: string;
  countryCode?: string;
  currency: string;
}

interface OpenMeteoResult {
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
}

/**
 * Resolves free-text destination input to coordinates/currency server-side.
 * Checks the curated list first (instant, no network), then falls back to
 * the free, keyless Open-Meteo Geocoding API for anywhere else in the world.
 */
export async function resolveDestination(location: string): Promise<ResolvedDestination | null> {
  const curated = findDestination(location);
  if (curated) {
    return {
      coordinates: curated.coordinates,
      country: curated.country,
      countryCode: curated.countryCode,
      currency: curated.currency,
    };
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location
      )}&count=1&language=en&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { results?: OpenMeteoResult[] };
    const result = data.results?.[0];
    if (!result) return null;

    return {
      coordinates: { lat: result.latitude, lng: result.longitude },
      country: result.country,
      countryCode: result.country_code,
      currency: currencyForCountryCode(result.country_code),
    };
  } catch (error) {
    console.error("Destination resolution error:", error);
    return null;
  }
}
