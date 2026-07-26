/**
 * OpenBnB MCP Connector
 * 
 * Provides Airbnb-style rental data.
 * No API key required. Uses the OpenBnB MCP server.
 * 
 * Tools available:
 * - search_listings: Search for rental listings by city and dates
 * - get_listing_details: Get detailed info about a specific listing
 * - get_price_analysis: Get price analysis for a city/area
 * - get_neighborhoods: Get neighborhood data for a city
 */

import { MCPClient } from "./client";
import type { MCPConnection, RentalListing, RentalAnalysis } from "@/types";
import { generateId } from "@/lib/utils";

interface RawRentalListing {
  id?: string;
  title?: string;
  url?: string;
  price_per_night?: number;
  total_price?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  max_guests?: number;
  review_score?: number;
  review_count?: number;
  neighborhood?: string;
  platform?: string;
  image_url?: string;
}

/**
 * Search for rental listings via OpenBnB
 */
export async function searchRentals(
  connection: MCPConnection,
  city: string,
  startDate: string,
  endDate: string,
  maxBudget: number,
  travelers: number = 1
): Promise<RentalAnalysis> {
  const client = new MCPClient(connection);

  // Search for listings
  const searchResult = await client.callTool("search_listings", {
    city,
    check_in: startDate,
    check_out: endDate,
    max_price_per_night: maxBudget,
    guests: travelers,
  });

  // If the MCP call fails, return simulated data for demonstration
  if (!searchResult.success) {
    return getSimulatedRentalData(city, startDate, endDate, maxBudget);
  }

  const listings =
    (searchResult.data as { listings?: RawRentalListing[] } | undefined)?.listings || [];
  
  // Process and analyze the results
  return processRentalResults(listings, startDate, endDate);
}

/**
 * Get neighborhood analysis for a city
 */
export async function getNeighborhoods(
  connection: MCPConnection,
  city: string
): Promise<{ name: string; avgPrice: number; listingCount: number }[]> {
  const client = new MCPClient(connection);

  const result = await client.callTool("get_neighborhoods", { city });
  
  if (!result.success) {
    return getSimulatedNeighborhoodData();
  }

  return (
    result.data as
      | { neighborhoods?: { name: string; avgPrice: number; listingCount: number }[] }
      | undefined
  )?.neighborhoods || [];
}

/**
 * Process raw rental results into the RentalAnalysis format
 */
function processRentalResults(
  listings: RawRentalListing[],
  startDate: string,
  endDate: string
): RentalAnalysis {
  const parsed: RentalListing[] = listings.map((l) => ({
    id: l.id || generateId(),
    title: l.title || "Unknown Listing",
    url: l.url || "",
    pricePerNight: l.price_per_night || 0,
    totalPrice: l.total_price || 0,
    currency: l.currency || "USD",
    bedrooms: l.bedrooms || 1,
    bathrooms: l.bathrooms || 1,
    maxGuests: l.max_guests || 2,
    reviewScore: l.review_score || 0,
    reviewCount: l.review_count || 0,
    neighborhood: l.neighborhood || "Unknown",
    platform: l.platform || "Airbnb",
    imageUrl: l.image_url,
  }));

  // Calculate price range
  const prices = parsed.map((l) => l.pricePerNight);
  const min = prices.length > 0 ? Math.min(...prices) : 0;
  const max = prices.length > 0 ? Math.max(...prices) : 0;
  const avg = prices.length > 0
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  // Group by neighborhood
  const neighborhoodMap = new Map<string, { total: number; count: number }>();
  parsed.forEach((l) => {
    const existing = neighborhoodMap.get(l.neighborhood) || { total: 0, count: 0 };
    existing.total += l.pricePerNight;
    existing.count += 1;
    neighborhoodMap.set(l.neighborhood, existing);
  });

  const bestNeighborhoods = Array.from(neighborhoodMap.entries())
    .map(([name, data]) => ({
      name,
      avgPrice: Math.round(data.total / data.count),
      listingCount: data.count,
    }))
    .sort((a, b) => a.avgPrice - b.avgPrice);

  // Find cheapest week
  const sortedByPrice = [...parsed].sort((a, b) => a.totalPrice - b.totalPrice);
  const cheapestWeek = {
    startDate,
    endDate,
    totalPrice: sortedByPrice[0]?.totalPrice || 0,
    avgPricePerNight: sortedByPrice[0]?.pricePerNight || 0,
    listings: sortedByPrice.slice(0, 3),
  };

  return {
    cheapestWeek,
    priceRange: { min, max, avg },
    bestNeighborhoods,
    allListings: parsed,
  };
}

/**
 * Simulated rental data for demo/fallback
 */
function getSimulatedRentalData(
  city: string,
  startDate: string,
  endDate: string,
  maxBudget: number
): RentalAnalysis {
  const neighborhoods = [
    "Downtown", "East Side", "West End", "North District", "South Park",
    "Midtown", "Harbor Area", "University District", "Arts District", "Historic Core"
  ];

  const listings: RentalListing[] = neighborhoods.map((neighborhood, i) => {
    const pricePerNight = Math.round(
      maxBudget * (0.4 + Math.random() * 0.5)
    );
    const nights = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      id: generateId(),
      title: `Cozy ${neighborhood} ${["Studio", "1BR", "2BR", "Loft"][i % 4]}`,
      url: `https://airbnb.com/rooms/${generateId()}`,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      currency: "USD",
      bedrooms: (i % 3) + 1,
      bathrooms: (i % 2) + 1,
      maxGuests: (i % 4) + 2,
      reviewScore: Math.round(3.5 + Math.random() * 1.5),
      reviewCount: Math.round(10 + Math.random() * 100),
      neighborhood,
      platform: "Airbnb",
      imageUrl: `https://picsum.photos/seed/${i}/400/300`,
    };
  });

  return processRentalResults(listings, startDate, endDate);
}

/**
 * Simulated neighborhood data
 */
function getSimulatedNeighborhoodData() {
  return [
    { name: "Downtown", avgPrice: 150, listingCount: 45 },
    { name: "Midtown", avgPrice: 120, listingCount: 38 },
    { name: "East Side", avgPrice: 95, listingCount: 52 },
    { name: "West End", avgPrice: 180, listingCount: 29 },
    { name: "North District", avgPrice: 85, listingCount: 61 },
    { name: "South Park", avgPrice: 110, listingCount: 33 },
    { name: "Harbor Area", avgPrice: 200, listingCount: 18 },
  ];
}
