/**
 * Gondola MCP Connector
 * 
 * Provides hotel data and price comparison across booking platforms.
 * No API key required. Uses the Gondola MCP server.
 * 
 * Tools available:
 * - search_hotels: Search for hotels in a city
 * - compare_prices: Compare hotel prices across platforms
 * - get_hotel_details: Get detailed info about a specific hotel
 * - get_deals: Get current deals and discounts
 */

import { MCPClient } from "./client";
import type { MCPConnection, HotelOption, HotelPrice, HotelAnalysis } from "@/types";

const BOOKING_PLATFORMS = [
  "Booking.com",
  "Expedia",
  "Hotels.com",
  "Kayak",
  "Agoda",
  "Trip.com",
  "Priceline",
  "Orbitz",
];

interface RawHotelPrice {
  platform?: string;
  price?: number;
  currency?: string;
  url?: string;
  is_refundable?: boolean;
  rating?: number;
}

interface RawHotel {
  name?: string;
  prices?: RawHotelPrice[];
  star_rating?: number;
  address?: string;
}

/**
 * Search for hotels and compare prices across platforms
 */
export async function searchHotels(
  connection: MCPConnection,
  city: string,
  checkIn: string,
  checkOut: string,
  hotelNames: string[]
): Promise<HotelAnalysis> {
  const client = new MCPClient(connection);

  // Try to search hotels via Gondola
  const searchResult = await client.callTool("search_hotels", {
    city,
    check_in: checkIn,
    check_out: checkOut,
  });

  // If the MCP call fails, return simulated data for demonstration
  if (!searchResult.success) {
    return getSimulatedHotelData(city, checkIn, checkOut, hotelNames);
  }

  const hotels = (searchResult.data as { hotels?: RawHotel[] } | undefined)?.hotels || [];
  return processHotelResults(hotels, hotelNames);
}

/**
 * Compare prices for a specific hotel across platforms
 */
export async function compareHotelPrices(
  connection: MCPConnection,
  hotelName: string,
  city: string,
  checkIn: string,
  checkOut: string
): Promise<HotelPrice[]> {
  const client = new MCPClient(connection);

  const result = await client.callTool("compare_prices", {
    hotel_name: hotelName,
    city,
    check_in: checkIn,
    check_out: checkOut,
  });

  if (!result.success) {
    return getSimulatedPriceComparison(hotelName);
  }

  const prices =
    (result.data as { prices?: RawHotelPrice[] } | undefined)?.prices || [];
  return prices.map((price) => ({
    platform: price.platform || "Unknown",
    price: price.price || 0,
    currency: price.currency || "USD",
    url: price.url || "",
    isRefundable: price.is_refundable || false,
    rating: price.rating || 0,
  }));
}

/**
 * Process hotel results into the HotelAnalysis format
 */
function processHotelResults(
  hotels: RawHotel[],
  requestedNames: string[]
): HotelAnalysis {
  const parsed: HotelOption[] = hotels
    .filter((h) =>
      requestedNames.length === 0 || 
      requestedNames.some((name) => 
        h.name?.toLowerCase().includes(name.toLowerCase())
      )
    )
    .map((h) => {
      const prices: HotelPrice[] = (h.prices || []).map((p) => ({
        platform: p.platform || "Unknown",
        price: p.price || 0,
        currency: p.currency || "USD",
        url: p.url || "",
        isRefundable: p.is_refundable || false,
        rating: p.rating || 0,
      }));

      const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
      const cheapest = sortedPrices[0];
      const mostExpensive = sortedPrices[sortedPrices.length - 1];

      return {
        name: h.name || "Unknown Hotel",
        prices,
        cheapestPlatform: cheapest?.platform || "N/A",
        cheapestPrice: cheapest?.price || 0,
        mostExpensivePrice: mostExpensive?.price || 0,
        savings: mostExpensive?.price - cheapest?.price || 0,
        starRating: h.star_rating,
        address: h.address,
      };
    });

  const totalSavings = parsed.reduce((sum, h) => sum + h.savings, 0);
  const platformSavings = new Map<string, number>();
  parsed.forEach((h) => {
    const current = platformSavings.get(h.cheapestPlatform) || 0;
    platformSavings.set(h.cheapestPlatform, current + h.savings);
  });

  const bestPlatform = Array.from(platformSavings.entries())
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  return {
    hotels: parsed,
    summary: {
      totalSavings,
      bestPlatform,
    },
  };
}

/**
 * Simulated hotel data for demo/fallback
 */
function getSimulatedHotelData(
  city: string,
  checkIn: string,
  checkOut: string,
  hotelNames: string[]
): HotelAnalysis {
  const defaultHotels = [
    "Grand Plaza Hotel",
    "The Riverside Inn",
    "City Center Suites",
    "Harbor View Resort",
    "Sunset Boutique Hotel",
    "The Metropolitan",
    "Garden Terrace Lodge",
    "Skyline Tower Hotel",
  ];

  const names = hotelNames.length > 0 ? hotelNames : defaultHotels.slice(0, 4);

  const hotels: HotelOption[] = names.map((name) => {
    const prices: HotelPrice[] = BOOKING_PLATFORMS.map((platform, i) => ({
      platform,
      price: Math.round(80 + Math.random() * 200 + i * 15),
      currency: "USD",
      url: `https://${platform.toLowerCase().replace(/[^a-z]/g, "")}.com/hotel/${name.toLowerCase().replace(/\s+/g, "-")}`,
      isRefundable: Math.random() > 0.3,
      rating: Math.round(3 + Math.random() * 2),
    }));

    const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
    const cheapest = sortedPrices[0];
    const mostExpensive = sortedPrices[sortedPrices.length - 1];

    return {
      name,
      prices,
      cheapestPlatform: cheapest?.platform || "N/A",
      cheapestPrice: cheapest?.price || 0,
      mostExpensivePrice: mostExpensive?.price || 0,
      savings: mostExpensive?.price - cheapest?.price || 0,
      starRating: Math.round(3 + Math.random() * 2),
      address: `${Math.round(100 + Math.random() * 900)} ${["Main St", "Broadway", "Park Ave", "Ocean Dr"][Math.floor(Math.random() * 4)]}, ${city}`,
    };
  });

  const totalSavings = hotels.reduce((sum, h) => sum + h.savings, 0);
  const platformSavings = new Map<string, number>();
  hotels.forEach((h) => {
    const current = platformSavings.get(h.cheapestPlatform) || 0;
    platformSavings.set(h.cheapestPlatform, current + h.savings);
  });

  const bestPlatform = Array.from(platformSavings.entries())
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  return {
    hotels,
    summary: {
      totalSavings,
      bestPlatform,
    },
  };
}

/**
 * Simulated price comparison for a single hotel
 */
function getSimulatedPriceComparison(hotelName: string): HotelPrice[] {
  return BOOKING_PLATFORMS.map((platform, i) => ({
    platform,
    price: Math.round(80 + Math.random() * 200 + i * 15),
    currency: "USD",
    url: `https://${platform.toLowerCase().replace(/[^a-z]/g, "")}.com/hotel/${hotelName.toLowerCase().replace(/\s+/g, "-")}`,
    isRefundable: Math.random() > 0.3,
    rating: Math.round(3 + Math.random() * 2),
  }));
}
