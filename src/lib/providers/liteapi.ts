/**
 * LiteAPI (Nuitee) real accommodation data provider.
 *
 * Activates only when process.env.LITEAPI_KEY is set — get a free sandbox
 * key (no credit card required) at https://dashboard.liteapi.travel. This
 * targets LiteAPI's public v3.0 REST API (api.liteapi.travel/v3.0).
 *
 * IMPORTANT CAVEAT: LiteAPI's rate-content response wasn't confirmed to
 * expose a structured bed-type field during research for this feature — the
 * request/response shapes below follow LiteAPI's documented v3.0 endpoints,
 * but should be verified against a real sandbox response the first time this
 * runs with a live key, since undocumented field drift is possible. Bed
 * configurations are inferred from the room name via keyword matching and
 * always flagged `bedsEstimated: true`, in contrast to the simulated
 * provider's always-exact bed data. If the actual response shape differs,
 * adjust the `LiteApi*` interfaces and `mapRoomToBeds` below.
 */
import type { BedConfiguration, BedType, HotelAnalysis, HotelOption, RentalAnalysis, RentalListing } from "@/types";
import { meetsBedRequirement } from "@/lib/beds";
import { buildHotelAnalysis, buildRentalAnalysis } from "./aggregate";
import type { AccommodationProvider, AccommodationSearchParams } from "./types";

const BASE_URL = "https://api.liteapi.travel/v3.0";

export function isLiteApiConfigured(): boolean {
  return Boolean(process.env.LITEAPI_KEY);
}

function apiKey(): string {
  const key = process.env.LITEAPI_KEY;
  if (!key) throw new Error("LITEAPI_KEY is not configured");
  return key;
}

interface LiteApiHotel {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  location?: { latitude: number; longitude: number };
  stars?: number;
  type?: string; // e.g. "hotel", "apartment", "guesthouse", "resort"
}

interface LiteApiRoomRate {
  name?: string;
  maxOccupancy?: number;
  retailRate?: { total?: { amount?: number; currency?: string } };
}

interface LiteApiHotelRates {
  hotelId: string;
  roomTypes?: LiteApiRoomRate[];
}

async function liteApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "X-API-Key": apiKey(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`LiteAPI request failed: HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

const BED_KEYWORDS: Array<[RegExp, BedType]> = [
  [/california king/i, "cal_king"],
  [/king/i, "king"],
  [/queen/i, "queen"],
  [/twin|single/i, "twin"],
  [/double|full/i, "full_double"],
  [/sofa|couch/i, "sofa_bed"],
  [/bunk/i, "bunk_bed"],
];

function mapRoomToBeds(roomName: string | undefined): BedConfiguration[] {
  for (const [pattern, type] of BED_KEYWORDS) {
    if (roomName && pattern.test(roomName)) return [{ type, count: 1 }];
  }
  // No recognizable bed keyword in the room name/description — default to a
  // mid-range guess rather than leaving beds empty.
  return [{ type: "queen", count: 1 }];
}

function classifyPropertyType(type: string | undefined): "hotel" | "rental" {
  const t = (type ?? "").toLowerCase();
  if (t.includes("apartment") || t.includes("guesthouse") || t.includes("villa")) return "rental";
  return "hotel";
}

async function fetchProperties(params: AccommodationSearchParams) {
  const { location, countryCode, startDate, endDate, travelers, currency } = params;

  const hotelsRes = await liteApiFetch<{ data: LiteApiHotel[] }>(
    `/data/hotels?${new URLSearchParams({
      cityName: location,
      countryCode: countryCode ?? "",
      limit: "30",
    })}`
  );
  const properties = hotelsRes.data ?? [];
  if (properties.length === 0) return { properties: [] as LiteApiHotel[], ratesByHotel: new Map<string, LiteApiHotelRates>() };

  const ratesRes = await liteApiFetch<{ data: LiteApiHotelRates[] }>("/hotels/rates", {
    method: "POST",
    body: JSON.stringify({
      hotelIds: properties.map((p) => p.id),
      checkin: startDate,
      checkout: endDate,
      occupancies: [{ adults: travelers }],
      currency,
    }),
  });

  return {
    properties,
    ratesByHotel: new Map(ratesRes.data?.map((r) => [r.hotelId, r] as const) ?? []),
  };
}

async function searchProperties(
  params: AccommodationSearchParams
): Promise<{ rentals: RentalListing[]; hotels: HotelOption[] }> {
  const { location, currency, minBedWidthCm, excludeSofaBeds, travelers } = params;
  const { properties, ratesByHotel } = await fetchProperties(params);

  const rentals: RentalListing[] = [];
  const hotels: HotelOption[] = [];

  for (const property of properties) {
    const rate = ratesByHotel.get(property.id);
    const room = rate?.roomTypes?.[0];
    const price = room?.retailRate?.total?.amount ?? 0;
    if (price <= 0) continue; // no live rate returned for these dates

    const beds = mapRoomToBeds(room?.name);
    if (!meetsBedRequirement(beds, minBedWidthCm, excludeSofaBeds)) continue;

    const coordinates = {
      lat: property.location?.latitude ?? params.coordinates.lat,
      lng: property.location?.longitude ?? params.coordinates.lng,
    };
    const resolvedCurrency = room?.retailRate?.total?.currency ?? currency;

    if (classifyPropertyType(property.type) === "rental") {
      rentals.push({
        id: property.id,
        title: property.name,
        url: `https://www.liteapi.travel/hotel/${property.id}`,
        pricePerNight: price,
        totalPrice: price,
        currency: resolvedCurrency,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: room?.maxOccupancy ?? travelers,
        reviewScore: property.stars ?? 0,
        reviewCount: 0,
        neighborhood: property.city ?? location,
        platform: "LiteAPI",
        coordinates,
        beds,
        bedsEstimated: true,
      });
    } else {
      hotels.push({
        name: property.name,
        prices: [
          {
            platform: "LiteAPI",
            price,
            currency: resolvedCurrency,
            url: `https://www.liteapi.travel/hotel/${property.id}`,
            isRefundable: false,
            rating: property.stars ?? 0,
          },
        ],
        cheapestPlatform: "LiteAPI",
        cheapestPrice: price,
        mostExpensivePrice: price,
        savings: 0,
        starRating: property.stars,
        address: property.address,
        coordinates,
        beds,
        bedsEstimated: true,
      });
    }
  }

  return { rentals, hotels };
}

async function searchRentals(params: AccommodationSearchParams): Promise<RentalAnalysis> {
  const { rentals } = await searchProperties(params);
  return buildRentalAnalysis(rentals, params.startDate, params.endDate);
}

async function searchHotels(params: AccommodationSearchParams): Promise<HotelAnalysis> {
  const { hotels } = await searchProperties(params);
  return buildHotelAnalysis(hotels);
}

export const liteApiProvider: AccommodationProvider = {
  id: "liteapi",
  searchRentals,
  searchHotels,
};
