/**
 * Simulated accommodation provider.
 *
 * This is the zero-setup default: no API key required. It generates
 * plausible listings clustered around the trip's real destination
 * coordinates, in the destination's real currency, with realistic
 * regionally-biased bed configurations — so the bed-size filter and map
 * view work meaningfully even without a live data provider configured.
 * Swap in a real provider (see src/lib/providers/liteapi.ts) once you have
 * a data source key; see src/app/api/analyze/route.ts for the switch.
 */
import type {
  BedConfiguration,
  BedType,
  Coordinates,
  HotelAnalysis,
  HotelOption,
  RentalAnalysis,
  RentalListing,
} from "@/types";
import { ALL_BED_TYPES, BED_SIZES, bedSleepingCapacity, meetsBedRequirement } from "@/lib/beds";
import { buildHotelAnalysis, buildRentalAnalysis } from "./aggregate";
import type { AccommodationProvider, AccommodationSearchParams } from "./types";

const NORDIC_CODES = new Set(["NO", "SE", "DK", "FI", "IS"]);
const EU_CODES = new Set([
  "GB", "IE", "FR", "DE", "NL", "ES", "IT", "PT", "AT", "CH", "BE",
  "GR", "PL", "CZ", "HU", "RO", "BG", "HR", "SI", "SK", "EE", "LV", "LT",
]);

function regionBedPool(countryCode: string | undefined): BedType[] {
  if (countryCode && NORDIC_CODES.has(countryCode.toUpperCase())) {
    return ["scandinavian_180", "eu_single", "eu_king_200", "sofa_bed", "twin"];
  }
  if (countryCode && EU_CODES.has(countryCode.toUpperCase())) {
    return ["eu_double_140", "eu_single", "eu_king_200", "sofa_bed", "twin"];
  }
  return ["queen", "king", "full_double", "twin", "cal_king", "sofa_bed"];
}

function pickQualifyingBedType(
  pool: BedType[],
  minBedWidthCm: number | undefined,
  excludeSofaBeds: boolean | undefined
): BedType {
  const qualifies = (t: BedType) => {
    const info = BED_SIZES[t];
    if (excludeSofaBeds && info.isSofaBed) return false;
    if (minBedWidthCm && info.widthCm < minBedWidthCm) return false;
    return true;
  };
  const inPool = pool.filter(qualifies);
  if (inPool.length > 0) return inPool[Math.floor(Math.random() * inPool.length)];
  const anywhere = ALL_BED_TYPES.filter(qualifies);
  return anywhere[0] ?? pool[0];
}

function pickBedType(
  pool: BedType[],
  minBedWidthCm: number | undefined,
  excludeSofaBeds: boolean | undefined
): BedType {
  const hasFilter = Boolean(minBedWidthCm) || Boolean(excludeSofaBeds);
  // Bias toward qualifying beds when a filter is set, but leave some
  // listings unconstrained so the filter visibly excludes something.
  if (hasFilter && Math.random() < 0.7) {
    return pickQualifyingBedType(pool, minBedWidthCm, excludeSofaBeds);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateBedConfiguration(
  pool: BedType[],
  bedrooms: number,
  maxGuests: number,
  minBedWidthCm: number | undefined,
  excludeSofaBeds: boolean | undefined
): BedConfiguration[] {
  const beds: BedConfiguration[] = [
    { type: pickBedType(pool, minBedWidthCm, excludeSofaBeds), count: 1 },
  ];
  for (let i = 1; i < bedrooms; i++) {
    const type = Math.random() < 0.5 ? "twin" : pickBedType(pool, minBedWidthCm, excludeSofaBeds);
    beds.push({ type, count: 1 });
  }
  if (maxGuests > bedSleepingCapacity(beds)) {
    beds.push({ type: "sofa_bed", count: 1 });
  }
  return beds;
}

/** Offsets a coordinate by up to maxKm in a random direction. */
function jitter(center: Coordinates, maxKm: number): Coordinates {
  const kmPerDegLat = 111;
  const kmPerDegLng = 111 * Math.cos((center.lat * Math.PI) / 180) || 1;
  const dLat = (Math.random() - 0.5) * 2 * (maxKm / kmPerDegLat);
  const dLng = (Math.random() - 0.5) * 2 * (maxKm / kmPerDegLng);
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}

function generateRentalCandidate(
  index: number,
  params: AccommodationSearchParams,
  pool: BedType[],
  neighborhoods: string[],
  nights: number
): RentalListing {
  const { location, maxBudget, travelers, currency, coordinates, minBedWidthCm, excludeSofaBeds } = params;
  const minimumPrice = Math.max(20, Math.min(50, maxBudget));
  const priceSpan = Math.max(1, maxBudget - minimumPrice);
  const bedrooms = Math.floor(Math.random() * 3) + 1;
  const maxGuests = travelers + Math.floor(Math.random() * 2);
  const pricePerNight = Math.min(maxBudget, Math.round(minimumPrice + Math.random() * priceSpan));

  return {
    id: `rental-${index}`,
    title: `${["Cozy", "Spacious", "Modern", "Charming", "Luxury", "Bright"][index % 6]} ${["Apartment", "Studio", "Loft", "Villa", "Condo", "House"][index % 6]} in ${location}`,
    url: `https://example.com/rentals/${index}`,
    pricePerNight,
    totalPrice: pricePerNight * nights,
    currency,
    bedrooms,
    bathrooms: Math.floor(Math.random() * 2) + 1,
    maxGuests,
    reviewScore: Math.floor(Math.random() * 11 + 40) / 10,
    reviewCount: Math.floor(Math.random() * 100 + 10),
    neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
    platform: "Simulated Demo Data",
    imageUrl: undefined,
    coordinates: jitter(coordinates, 4),
    beds: generateBedConfiguration(pool, bedrooms, maxGuests, minBedWidthCm, excludeSofaBeds),
  };
}

async function searchRentals(params: AccommodationSearchParams): Promise<RentalAnalysis> {
  const { startDate, endDate, minBedWidthCm, excludeSofaBeds, countryCode } = params;
  const nights = Math.max(
    1,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000))
  );
  const neighborhoods = [
    "Downtown", "Midtown", "East Side", "West End", "North District",
    "Arts District", "Waterfront", "University Area",
  ];
  const pool = regionBedPool(countryCode);
  const hasFilter = Boolean(minBedWidthCm) || Boolean(excludeSofaBeds);

  let candidates = Array.from({ length: 20 }, (_, i) =>
    generateRentalCandidate(i + 1, params, pool, neighborhoods, nights)
  );
  let qualifying = hasFilter
    ? candidates.filter((l) => meetsBedRequirement(l.beds, minBedWidthCm, excludeSofaBeds))
    : candidates;

  // Top up with forced-qualifying listings if the filter left too few results.
  let attempt = candidates.length;
  while (hasFilter && qualifying.length < 6 && attempt < 60) {
    attempt += 1;
    const forced = generateRentalCandidate(attempt, params, pool, neighborhoods, nights);
    forced.beds = [
      { type: pickQualifyingBedType(pool, minBedWidthCm, excludeSofaBeds), count: 1 },
    ];
    if (meetsBedRequirement(forced.beds, minBedWidthCm, excludeSofaBeds)) {
      qualifying.push(forced);
    }
  }

  const listings = qualifying.slice(0, 12);
  return buildRentalAnalysis(listings, startDate, endDate);
}

async function searchHotels(params: AccommodationSearchParams): Promise<HotelAnalysis> {
  const { location, currency, coordinates, minBedWidthCm, excludeSofaBeds, countryCode } = params;
  const platforms = ["Booking.com", "Expedia", "Hotels.com", "Agoda", "Kayak", "Trip.com"];
  const pool = regionBedPool(countryCode).filter((t) => !BED_SIZES[t].isSofaBed);

  const hotelDefs = [
    { name: `Grand ${location} Hotel`, starRating: 4, priceFloor: 100, priceSpan: 300 },
    { name: `${location} Marriott Downtown`, starRating: 4, priceFloor: 150, priceSpan: 400 },
    { name: `The ${location} Boutique Inn`, starRating: 3, priceFloor: 80, priceSpan: 200 },
  ];

  const hotels: HotelOption[] = hotelDefs.map((def) => {
    const prices = platforms.map((platform) => ({
      platform,
      price: Math.floor(Math.random() * def.priceSpan + def.priceFloor),
      currency,
      url: `https://example.com/hotel/${platform.toLowerCase()}`,
      isRefundable: Math.random() > 0.3,
      rating: Math.floor(Math.random() * 20 + 30) / 10,
    }));
    const sorted = [...prices].sort((a, b) => a.price - b.price);
    const beds: BedConfiguration[] = [
      { type: pickBedType(pool, minBedWidthCm, excludeSofaBeds), count: 1 },
    ];

    return {
      name: def.name,
      starRating: def.starRating,
      prices,
      cheapestPlatform: sorted[0].platform,
      cheapestPrice: sorted[0].price,
      mostExpensivePrice: sorted[sorted.length - 1].price,
      savings: sorted[sorted.length - 1].price - sorted[0].price,
      address: `${Math.round(100 + Math.random() * 900)} Main St, ${location}`,
      coordinates: jitter(coordinates, 2),
      beds,
    };
  });

  const filtered = hotels.filter((h) => meetsBedRequirement(h.beds, minBedWidthCm, excludeSofaBeds));
  const hotelOptions = filtered.length > 0 ? filtered : hotels;

  return buildHotelAnalysis(hotelOptions);
}

export const simulatedProvider: AccommodationProvider = {
  id: "simulated",
  searchRentals,
  searchHotels,
};
