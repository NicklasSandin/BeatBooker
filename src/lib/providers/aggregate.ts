/**
 * Shared aggregation helpers used by every AccommodationProvider so the
 * "cheapest week" / "price range" / "best neighborhoods" summaries are
 * computed identically regardless of where the raw listings came from.
 */
import type { HotelAnalysis, HotelOption, RentalAnalysis, RentalListing } from "@/types";

export function buildRentalAnalysis(
  listings: RentalListing[],
  startDate: string,
  endDate: string
): RentalAnalysis {
  const sorted = [...listings].sort((a, b) => a.totalPrice - b.totalPrice);

  const cheapestWeek = {
    startDate,
    endDate,
    totalPrice: sorted[0]?.totalPrice ?? 0,
    avgPricePerNight: sorted[0]?.pricePerNight ?? 0,
    listings: sorted.slice(0, 3),
  };

  const prices = sorted.map((l) => l.pricePerNight);
  const priceRange = {
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 0,
    avg: prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
  };

  const neighborhoodMap = new Map<string, { total: number; count: number }>();
  sorted.forEach((l) => {
    const existing = neighborhoodMap.get(l.neighborhood) || { total: 0, count: 0 };
    existing.total += l.pricePerNight;
    existing.count += 1;
    neighborhoodMap.set(l.neighborhood, existing);
  });
  const bestNeighborhoods = Array.from(neighborhoodMap.entries())
    .map(([name, data]) => ({ name, avgPrice: Math.round(data.total / data.count), listingCount: data.count }))
    .sort((a, b) => a.avgPrice - b.avgPrice)
    .slice(0, 5);

  return { cheapestWeek, priceRange, bestNeighborhoods, allListings: sorted };
}

export function buildHotelAnalysis(hotels: HotelOption[]): HotelAnalysis {
  const totalSavings = hotels.reduce((sum, h) => sum + h.savings, 0);
  const platformSavings = new Map<string, number>();
  hotels.forEach((h) => {
    platformSavings.set(h.cheapestPlatform, (platformSavings.get(h.cheapestPlatform) || 0) + h.savings);
  });
  const bestPlatform = Array.from(platformSavings.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

  return { hotels, summary: { totalSavings, bestPlatform } };
}
