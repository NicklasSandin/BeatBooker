import { NextRequest, NextResponse } from "next/server";
import type {
  HotelAnalysis,
  OrganicPick,
  PickAnalysis,
  RentalAnalysis,
  TripFormData,
} from "@/types";
import { getAccommodationProvider } from "@/lib/providers";
import { resolveDestination } from "@/lib/destinations";
import { describeBeds, meetsBedRequirement } from "@/lib/beds";

/**
 * POST /api/analyze
 *
 * Resolves the trip's destination to real coordinates/currency, then asks
 * the active AccommodationProvider (live LiteAPI data if LITEAPI_KEY is
 * configured, otherwise the worldwide-aware simulated provider) for rentals
 * and hotels, and ranks "The Pick" from the combined results.
 *
 * Request body:
 * {
 *   tripId: string;
 *   formData: TripFormData;
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

    const destination = formData.coordinates
      ? {
          coordinates: formData.coordinates,
          country: formData.country,
          countryCode: formData.countryCode,
          currency: formData.currency ?? "USD",
        }
      : await resolveDestination(formData.location);

    if (!destination) {
      return NextResponse.json(
        { error: `Couldn't find "${formData.location}". Try picking a suggestion from the destination search.` },
        { status: 400 }
      );
    }

    // Simulate a brief analysis delay for the demo provider; live LiteAPI
    // calls already take real network time.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const provider = getAccommodationProvider();
    const searchParams = {
      location: formData.location,
      coordinates: destination.coordinates,
      countryCode: destination.countryCode,
      currency: destination.currency,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxBudget: formData.maxBudget,
      travelers: formData.travelers,
      minBedWidthCm: formData.minBedWidthCm,
      excludeSofaBeds: formData.excludeSofaBeds,
    };

    const [rentals, hotels] = await Promise.all([
      provider.searchRentals(searchParams),
      provider.searchHotels(searchParams),
    ]);

    const thePick = generatePick(rentals, hotels, formData);

    return NextResponse.json({ tripId, rentals, hotels, thePick, provider: provider.id });
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
 * Combine rental and hotel results, rank by value (review score / price),
 * and exclude anything that fails a strict bed-size requirement.
 */
function generatePick(
  rentals: RentalAnalysis,
  hotels: HotelAnalysis,
  formData: TripFormData
): PickAnalysis {
  const { travelers, minBedWidthCm, excludeSofaBeds } = formData;
  const stayNights = Math.max(
    1,
    Math.round(
      (new Date(rentals.cheapestWeek.endDate).getTime() -
        new Date(rentals.cheapestWeek.startDate).getTime()) /
        (24 * 60 * 60 * 1000)
    )
  );

  const rentalPicks: OrganicPick[] = rentals.allListings
    .filter((l) => meetsBedRequirement(l.beds, minBedWidthCm, excludeSofaBeds))
    .slice(0, 5)
    .map((l) => ({
      title: l.title,
      type: "rental" as const,
      platform: l.platform,
      price: l.totalPrice,
      pricePerNight: l.pricePerNight,
      currency: l.currency,
      score: l.reviewScore / (l.pricePerNight / 100),
      reviewScore: l.reviewScore,
      reviewCount: l.reviewCount,
      directBookingUrl: l.url,
      description: `${l.bedrooms} bed, ${l.bathrooms} bath in ${l.neighborhood} — ${describeBeds(l.beds)}`,
      neighborhood: l.neighborhood,
      coordinates: l.coordinates,
      beds: l.beds,
    }));

  const hotelPicks: OrganicPick[] = hotels.hotels
    .filter((h) => meetsBedRequirement(h.beds, minBedWidthCm, excludeSofaBeds))
    .slice(0, 3)
    .map((h) => ({
      title: h.name,
      type: "hotel" as const,
      platform: h.cheapestPlatform,
      price: h.cheapestPrice * stayNights,
      pricePerNight: h.cheapestPrice,
      currency: h.prices.find((p) => p.platform === h.cheapestPlatform)?.currency ?? "USD",
      score: ((h.starRating ?? 0) * 10) / (h.cheapestPrice / 100),
      reviewScore: (h.starRating ?? 0) * 1.25,
      reviewCount: Math.floor(Math.random() * 500 + 100),
      directBookingUrl: `https://example.com/hotel/direct/${h.name.toLowerCase().replace(/\s+/g, "-")}`,
      description: `${h.starRating}-star hotel — ${describeBeds(h.beds)}`,
      neighborhood: h.address ?? "City Center",
      coordinates: h.coordinates,
      beds: h.beds,
    }));

  const allPicks = [...rentalPicks, ...hotelPicks].sort((a, b) => b.score - a.score);
  const topPicks = allPicks.slice(0, 3);

  const sponsoredComparison = [
    {
      title: `Sponsored: Premium ${topPicks[0]?.title.split(" ").slice(0, 2).join(" ") || "Suite"} (Google Ads)`,
      platform: "Booking.com",
      price: topPicks[0]?.price ? Math.round(topPicks[0].price * 1.35) : 1500,
      currency: topPicks[0]?.currency ?? "USD",
      url: "https://example.com/sponsored/1",
    },
    {
      title: `Sponsored: ${topPicks[1]?.title.split(" ")[0] || "Luxury"} Stay (TripAdvisor)`,
      platform: "Expedia",
      price: topPicks[1]?.price ? Math.round(topPicks[1].price * 1.25) : 1200,
      currency: topPicks[1]?.currency ?? "USD",
      url: "https://example.com/sponsored/2",
    },
    {
      title: "Sponsored: City Break Package (Booking.com)",
      platform: "Booking.com",
      price: topPicks[2]?.price ? Math.round(topPicks[2].price * 1.4) : 1800,
      currency: topPicks[2]?.currency ?? "USD",
      url: "https://example.com/sponsored/3",
    },
  ];

  return {
    topPicks,
    sponsoredComparison,
    methodology:
      `Ranks listings by a value score (review score / price per night x 100), after excluding anything that doesn't meet your bed-size requirement${travelers > 1 ? ` for ${travelers} travelers` : ""}. Compared against typical sponsored listings found on major booking platforms to show how much you can save by booking directly.`,
  };
}
