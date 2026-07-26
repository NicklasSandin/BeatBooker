import { NextRequest, NextResponse } from "next/server";
import type {
  HotelAnalysis,
  HotelOption,
  OrganicPick,
  PickAnalysis,
  RentalAnalysis,
  RentalListing,
  TripFormData,
} from "@/types";

/**
 * POST /api/analyze
 * 
 * Generates a self-contained demo analysis for the submitted trip.
 * 
 * Request body:
 * {
 *   tripId: string;
 *   formData: TripFormData;
 *   connections: MCPConnection[];
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!isAnalysisRequest(body)) {
      return NextResponse.json(
        { error: "Enter a valid destination, future date range, budget, and traveler count." },
        { status: 400 }
      );
    }

    const { tripId, formData } = body;

    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate demo rental data.
    const rentals = generateSimulatedRentals(formData);

    // Generate demo hotel data.
    const hotels = generateSimulatedHotels(formData);

    // Generate "The Pick" analysis
    const thePick = generateSimulatedPick(rentals, hotels);

    return NextResponse.json({
      tripId,
      rentals,
      hotels,
      thePick,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze trip. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Validate untrusted request data before using it to generate an analysis.
 */
function isAnalysisRequest(
  value: unknown
): value is { tripId: string; formData: TripFormData } {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  const formData = candidate.formData;
  if (!formData || typeof formData !== "object") return false;

  const form = formData as Record<string, unknown>;
  const start = new Date(String(form.startDate));
  const end = new Date(String(form.endDate));

  return (
    typeof candidate.tripId === "string" &&
    candidate.tripId.length > 0 &&
    typeof form.location === "string" &&
    form.location.trim().length > 0 &&
    typeof form.startDate === "string" &&
    typeof form.endDate === "string" &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    end.getTime() > start.getTime() &&
    typeof form.maxBudget === "number" &&
    Number.isFinite(form.maxBudget) &&
    form.maxBudget > 0 &&
    typeof form.travelers === "number" &&
    Number.isInteger(form.travelers) &&
    form.travelers > 0 &&
    form.travelers <= 20
  );
}

/**
 * Generate simulated rental data
 * In production, this would query OpenBnB MCP server
 */
function generateSimulatedRentals(formData: TripFormData): RentalAnalysis {
  const { location, startDate, endDate, maxBudget, travelers } = formData;
  const nights = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (24 * 60 * 60 * 1000)
    )
  );
  const minimumPrice = Math.max(20, Math.min(50, maxBudget));
  const priceSpan = Math.max(1, maxBudget - minimumPrice);
  const neighborhoods = [
    "Downtown",
    "Midtown",
    "East Side",
    "West End",
    "North District",
    "Arts District",
    "Waterfront",
    "University Area",
  ];

  const listings: RentalListing[] = Array.from({ length: 12 }, (_, i) => ({
    id: `rental-${i + 1}`,
    title: `${["Cozy", "Spacious", "Modern", "Charming", "Luxury", "Bright"][i % 6]} ${["Apartment", "Studio", "Loft", "Villa", "Condo", "House"][i % 6]} in ${location}`,
    url: `https://example.com/rentals/${i + 1}`,
    pricePerNight: Math.min(
      maxBudget,
      Math.round(minimumPrice + Math.random() * priceSpan)
    ),
    totalPrice: 0,
    currency: "USD",
    bedrooms: Math.floor(Math.random() * 3) + 1,
    bathrooms: Math.floor(Math.random() * 2) + 1,
    maxGuests: travelers + Math.floor(Math.random() * 2),
    reviewScore: Math.floor(Math.random() * 11 + 40) / 10,
    reviewCount: Math.floor(Math.random() * 100 + 10),
    neighborhood: neighborhoods[Math.floor(Math.random() * neighborhoods.length)],
    platform: "OpenBnB",
    imageUrl: undefined,
  }));

  // Calculate prices for the requested stay.
  listings.forEach((l) => {
    l.totalPrice = l.pricePerNight * nights;
  });

  // Sort by total price
  listings.sort((a, b) => a.totalPrice - b.totalPrice);

  // Cheapest week
  const cheapestWeek = {
    startDate,
    endDate,
    totalPrice: listings[0].totalPrice,
    avgPricePerNight: listings[0].pricePerNight,
    listings: listings.slice(0, 3),
  };

  // Price range
  const prices = listings.map((l) => l.pricePerNight);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
  };

  // Best neighborhoods
  const neighborhoodMap = new Map<string, { total: number; count: number }>();
  listings.forEach((l) => {
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
    .sort((a, b) => a.avgPrice - b.avgPrice)
    .slice(0, 5);

  return {
    cheapestWeek,
    priceRange,
    bestNeighborhoods,
    allListings: listings,
  };
}

/**
 * Generate simulated hotel data
 * In production, this would query Gondola MCP server
 */
function generateSimulatedHotels(formData: TripFormData): HotelAnalysis {
  const { location } = formData;
  const platforms = ["Booking.com", "Expedia", "Hotels.com", "Agoda", "Kayak", "Trip.com"];

  const hotels: Array<Pick<HotelOption, "name" | "starRating" | "prices">> = [
    {
      name: `Grand ${location} Hotel`,
      starRating: 4,
      prices: platforms.map((platform) => ({
        platform,
        price: Math.floor(Math.random() * 300 + 100),
        currency: "USD",
        url: `https://example.com/hotel/${platform.toLowerCase()}`,
        isRefundable: Math.random() > 0.3,
        rating: Math.floor(Math.random() * 20 + 30) / 10,
      })),
    },
    {
      name: `${location} Marriott Downtown`,
      starRating: 4,
      prices: platforms.map((platform) => ({
        platform,
        price: Math.floor(Math.random() * 400 + 150),
        currency: "USD",
        url: `https://example.com/hotel/${platform.toLowerCase()}`,
        isRefundable: Math.random() > 0.3,
        rating: Math.floor(Math.random() * 20 + 30) / 10,
      })),
    },
    {
      name: `The ${location} Boutique Inn`,
      starRating: 3,
      prices: platforms.map((platform) => ({
        platform,
        price: Math.floor(Math.random() * 200 + 80),
        currency: "USD",
        url: `https://example.com/hotel/${platform.toLowerCase()}`,
        isRefundable: Math.random() > 0.3,
        rating: Math.floor(Math.random() * 20 + 30) / 10,
      })),
    },
  ];

  // Calculate cheapest for each hotel
  const hotelOptions = hotels.map((hotel) => {
    const sortedPrices = [...hotel.prices].sort((a, b) => a.price - b.price);
    return {
      name: hotel.name,
      starRating: hotel.starRating,
      prices: hotel.prices,
      cheapestPlatform: sortedPrices[0].platform,
      cheapestPrice: sortedPrices[0].price,
      mostExpensivePrice: sortedPrices[sortedPrices.length - 1].price,
      savings: sortedPrices[sortedPrices.length - 1].price - sortedPrices[0].price,
    };
  });

  const totalSavings = hotelOptions.reduce((sum, h) => sum + h.savings, 0);
  const platformSavings = new Map<string, number>();
  hotelOptions.forEach((h) => {
    platformSavings.set(
      h.cheapestPlatform,
      (platformSavings.get(h.cheapestPlatform) || 0) + h.savings
    );
  });

  const bestPlatform = Array.from(platformSavings.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return {
    hotels: hotelOptions,
    summary: {
      totalSavings,
      bestPlatform,
    },
  };
}

/**
 * Generate "The Pick" analysis
 * Combines rental and hotel data, ranks by value (review score / price)
 */
function generateSimulatedPick(
  rentals: RentalAnalysis,
  hotels: HotelAnalysis
): PickAnalysis {
  const stayNights = Math.max(
    1,
    Math.round(
      (new Date(rentals.cheapestWeek.endDate).getTime() -
        new Date(rentals.cheapestWeek.startDate).getTime()) /
        (24 * 60 * 60 * 1000)
    )
  );
  const rentalPicks: OrganicPick[] = rentals.allListings.slice(0, 5).map((l) => ({
    title: l.title,
    type: "rental" as const,
    platform: l.platform,
    price: l.totalPrice,
    pricePerNight: l.pricePerNight,
    score: l.reviewScore / (l.pricePerNight / 100),
    reviewScore: l.reviewScore,
    reviewCount: l.reviewCount,
    directBookingUrl: l.url,
    description: `${l.bedrooms} bed, ${l.bathrooms} bath in ${l.neighborhood}`,
    neighborhood: l.neighborhood,
  }));

  const hotelPicks: OrganicPick[] = hotels.hotels.slice(0, 3).map((h) => ({
    title: h.name,
    type: "hotel" as const,
    platform: h.cheapestPlatform,
    price: h.cheapestPrice * stayNights,
    pricePerNight: h.cheapestPrice,
    score: ((h.starRating ?? 0) * 10) / (h.cheapestPrice / 100),
    reviewScore: (h.starRating ?? 0) * 1.25,
    reviewCount: Math.floor(Math.random() * 500 + 100),
    directBookingUrl: `https://example.com/hotel/direct/${h.name.toLowerCase().replace(/\s+/g, "-")}`,
    description: `${h.starRating}-star hotel in ${h.name.split(" ")[0]}`,
    neighborhood: "City Center",
  }));

  // Combine and sort by score
  const allPicks = [...rentalPicks, ...hotelPicks].sort(
    (a, b) => b.score - a.score
  );

  const topPicks = allPicks.slice(0, 3);

  const sponsoredComparison = [
    {
      title: `Sponsored: Premium ${topPicks[0]?.title.split(" ").slice(0, 2).join(" ") || "Suite"} (Google Ads)`,
      platform: "Booking.com",
      price: topPicks[0]?.price
        ? Math.round(topPicks[0].price * 1.35)
        : 1500,
      url: "https://example.com/sponsored/1",
    },
    {
      title: `Sponsored: ${topPicks[1]?.title.split(" ")[0] || "Luxury"} Stay (TripAdvisor)`,
      platform: "Expedia",
      price: topPicks[1]?.price
        ? Math.round(topPicks[1].price * 1.25)
        : 1200,
      url: "https://example.com/sponsored/2",
    },
    {
      title: "Sponsored: City Break Package (Booking.com)",
      platform: "Booking.com",
      price: topPicks[2]?.price
        ? Math.round(topPicks[2].price * 1.4)
        : 1800,
      url: "https://example.com/sponsored/3",
    },
  ];

  return {
    topPicks,
    sponsoredComparison,
    methodology:
      "Our algorithm ranks listings by a value score that divides review score by price per night, then multiplies by 100. This ensures the best combination of quality and affordability. We compare against typical sponsored listings found on major booking platforms to show you how much you can save by booking directly.",
  };
}
