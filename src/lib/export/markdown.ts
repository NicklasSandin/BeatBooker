/**
 * Markdown Export Utility
 * 
 * Exports trip data as a formatted Markdown file.
 * The markdown is structured for readability and easy sharing.
 */

import type { Trip, RentalListing, HotelOption, OrganicPick } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { describeBeds } from "@/lib/beds";

/**
 * Export trip data as a downloadable Markdown file
 */
export function exportTripAsMarkdown(trip: Trip): void {
  const markdown = generateTripMarkdown(trip);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `beatbooker-trip-${trip.id}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate Markdown string for a trip
 */
export function generateTripMarkdown(trip: Trip): string {
  const { formData } = trip;
  const lines: string[] = [];

  // Header
  lines.push(`# BeatBooker Trip Report`);
  lines.push(``);
  lines.push(`**Destination:** ${formData.location}`);
  lines.push(`**Dates:** ${formData.startDate} to ${formData.endDate}`);
  lines.push(`**Max Budget:** ${formatCurrency(formData.maxBudget)} per night`);
  lines.push(`**Travelers:** ${formData.travelers}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // Rentals Section
  if (trip.rentals) {
    lines.push(`## 🏠 Rentals Analysis`);
    lines.push(``);

    const { cheapestWeek, priceRange, bestNeighborhoods } = trip.rentals;
    const rentalCurrency = trip.rentals.allListings[0]?.currency ?? "USD";

    lines.push(`### Lowest-Cost Stay`);
    lines.push(`- **Total:** ${formatCurrency(cheapestWeek.totalPrice, rentalCurrency)}`);
    lines.push(`- **Avg/Night:** ${formatCurrency(cheapestWeek.avgPricePerNight, rentalCurrency)}`);
    lines.push(`- **Dates:** ${cheapestWeek.startDate} to ${cheapestWeek.endDate}`);
    lines.push(``);

    lines.push(`### Price Range`);
    lines.push(`- **Min/Night:** ${formatCurrency(priceRange.min, rentalCurrency)}`);
    lines.push(`- **Max/Night:** ${formatCurrency(priceRange.max, rentalCurrency)}`);
    lines.push(`- **Avg/Night:** ${formatCurrency(priceRange.avg, rentalCurrency)}`);
    lines.push(``);

    lines.push(`### Best Neighborhoods`);
    lines.push(`| Neighborhood | Avg Price/Night | Listings |`);
    lines.push(`|---|---|---|`);
    bestNeighborhoods.forEach((n) => {
      lines.push(`| ${n.name} | ${formatCurrency(n.avgPrice, rentalCurrency)} | ${n.listingCount} |`);
    });
    lines.push(``);

    lines.push(`### Top Listings`);
    lines.push(`| Title | Neighborhood | Price/Night | Beds | Score |`);
    lines.push(`|---|---|---|---|---|`);
    cheapestWeek.listings.forEach((l: RentalListing) => {
      lines.push(
        `| ${l.title} | ${l.neighborhood} | ${formatCurrency(l.pricePerNight, l.currency)} | ${describeBeds(l.beds)} | ${l.reviewScore}/5 |`
      );
    });
    lines.push(``);
  }

  // Hotels Section
  if (trip.hotels) {
    lines.push(`## 🏨 Hotels Analysis`);
    lines.push(``);

    const hotelCurrency = trip.hotels.hotels[0]?.prices[0]?.currency ?? "USD";

    lines.push(`### Price Comparison`);
    lines.push(`| Hotel | Cheapest Platform | Price | Beds | Savings |`);
    lines.push(`|---|---|---|---|---|`);
    trip.hotels.hotels.forEach((h: HotelOption) => {
      lines.push(
        `| ${h.name} | ${h.cheapestPlatform} | ${formatCurrency(h.cheapestPrice, hotelCurrency)} | ${describeBeds(h.beds)} | ${formatCurrency(h.savings, hotelCurrency)} |`
      );
    });
    lines.push(``);

    lines.push(`### Summary`);
    lines.push(`- **Total Potential Savings:** ${formatCurrency(trip.hotels.summary.totalSavings, hotelCurrency)}`);
    lines.push(`- **Best Platform Overall:** ${trip.hotels.summary.bestPlatform}`);
    lines.push(``);
  }

  // The Pick Section
  if (trip.thePick) {
    lines.push(`## ⭐ The Pick - Best Organic Listings`);
    lines.push(``);

    lines.push(`### Top 3 Picks`);
    trip.thePick.topPicks.forEach((pick: OrganicPick, i: number) => {
      lines.push(`**${i + 1}. ${pick.title}**`);
      lines.push(`- **Type:** ${pick.type === "rental" ? "🏠 Rental" : "🏨 Hotel"}`);
      lines.push(`- **Platform:** ${pick.platform}`);
      lines.push(`- **Total Price:** ${formatCurrency(pick.price, pick.currency)}`);
      lines.push(`- **Price/Night:** ${formatCurrency(pick.pricePerNight, pick.currency)}`);
      lines.push(`- **Score:** ${pick.score.toFixed(2)} (review/price ratio)`);
      lines.push(`- **Review Score:** ${pick.reviewScore}/5 (${pick.reviewCount} reviews)`);
      lines.push(`- **Direct Booking:** ${pick.directBookingUrl}`);
      lines.push(``);
    });

    lines.push(`### Comparison with Sponsored`);
    lines.push(`| Type | Title | Platform | Price |`);
    lines.push(`|---|---|---|---|`);
    trip.thePick.sponsoredComparison.forEach((s) => {
      lines.push(`| Sponsored | ${s.title} | ${s.platform} | ${formatCurrency(s.price, s.currency)} |`);
    });
    lines.push(``);
  }

  // Footer
  lines.push(`---`);
  lines.push(`*Generated by BeatBooker on ${new Date().toLocaleDateString()}*`);
  lines.push(`*Built to beat Booking.com & Airbnb fees*`);

  return lines.join("\n");
}
