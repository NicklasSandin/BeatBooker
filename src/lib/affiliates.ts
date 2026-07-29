/**
 * Affiliate link building.
 *
 * Travelpayouts (https://www.travelpayouts.com) is a single-signup affiliate
 * network covering many travel suppliers, including Hotellook's hotel
 * search. It's the realistic starting point for a low/no-traffic site — no
 * meaningful traffic minimum, free to join. A direct Booking.com Affiliate
 * Partner Program integration is a planned follow-up, not yet implemented.
 *
 * We only link out to a real *search results* page (not a specific fake
 * listing) — BeatBooker's own listings are simulated demo data, so
 * affiliate-tagging their fake URLs would misrepresent them as bookable.
 */

interface HotellookSearchParams {
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  travelers: number;
  currency?: string;
}

export function isTravelpayoutsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER);
}

/**
 * Builds a Hotellook (via Travelpayouts) affiliate search URL for the given
 * trip, or null if no marker is configured.
 */
export function getHotellookSearchUrl(params: HotellookSearchParams): string | null {
  const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER;
  if (!marker) return null;

  const query = new URLSearchParams({
    marker,
    locale: "en",
    currency: (params.currency ?? "USD").toLowerCase(),
    destination: params.location,
    checkIn: params.startDate,
    checkOut: params.endDate,
    adults: String(Math.max(1, params.travelers)),
  });

  return `https://search.hotellook.com/?${query.toString()}`;
}
