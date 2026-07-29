/**
 * Bed size reference data and comfort helpers.
 *
 * The point of this module: a listing saying "sleeps 2" tells you nothing about
 * whether two actual adults fit on the bed. A US "Queen" (152cm wide) and a
 * European "double" often marketed at the same tier can be as narrow as 140cm,
 * while a Scandinavian double is typically 180cm. This table makes those real
 * dimensions filterable and surfaces a plain-language comfort rating instead of
 * relying on the "sleeps N" marketing number.
 *
 * Dimensions sourced from regional bed-size standards (Wikipedia: Bed size),
 * rounded to the nearest cm.
 */
import type { BedConfiguration, BedType } from "@/types";

export interface BedSizeInfo {
  type: BedType;
  label: string;
  widthCm: number;
  lengthCm: number;
  region: string;
  isSofaBed?: boolean;
  isBunk?: boolean;
}

export const BED_SIZES: Record<BedType, BedSizeInfo> = {
  twin: { type: "twin", label: "Twin/Single", widthCm: 98, lengthCm: 189, region: "US" },
  full_double: { type: "full_double", label: "Full/Double", widthCm: 137, lengthCm: 191, region: "US" },
  queen: { type: "queen", label: "Queen", widthCm: 152, lengthCm: 203, region: "US" },
  king: { type: "king", label: "King", widthCm: 193, lengthCm: 203, region: "US" },
  cal_king: { type: "cal_king", label: "California King", widthCm: 183, lengthCm: 212, region: "US" },
  eu_single: { type: "eu_single", label: "European Single", widthCm: 90, lengthCm: 200, region: "EU" },
  eu_double_140: { type: "eu_double_140", label: "European Double (140)", widthCm: 140, lengthCm: 200, region: "EU" },
  scandinavian_180: { type: "scandinavian_180", label: "Scandinavian Double (180)", widthCm: 180, lengthCm: 200, region: "Nordic" },
  eu_king_200: { type: "eu_king_200", label: "European King (200)", widthCm: 200, lengthCm: 200, region: "EU" },
  sofa_bed: { type: "sofa_bed", label: "Sofa Bed", widthCm: 130, lengthCm: 190, region: "N/A", isSofaBed: true },
  bunk_bed: { type: "bunk_bed", label: "Bunk Bed", widthCm: 90, lengthCm: 190, region: "N/A", isBunk: true },
};

export const ALL_BED_TYPES = Object.keys(BED_SIZES) as BedType[];

export type ComfortRating = "spacious" | "standard" | "snug" | "single-only";

/**
 * Rates how comfortably two adults fit on a bed of the given width.
 * The 180cm threshold is deliberate: that's the point at which two larger
 * adults (not just two average-sized people) genuinely both fit.
 */
export function comfortRating(widthCm: number): ComfortRating {
  if (widthCm >= 180) return "spacious";
  if (widthCm >= 152) return "standard";
  if (widthCm >= 120) return "snug";
  return "single-only";
}

export function widestBedCm(beds: BedConfiguration[]): number {
  if (beds.length === 0) return 0;
  return Math.max(...beds.map((b) => BED_SIZES[b.type].widthCm));
}

/**
 * Total number of adults the bed configuration can sleep, using a
 * per-bed comfort-based capacity rather than the marketing "sleeps N" figure.
 */
export function bedSleepingCapacity(beds: BedConfiguration[]): number {
  return beds.reduce((total, b) => {
    const info = BED_SIZES[b.type];
    const perBed = info.widthCm >= 152 ? 2 : 1;
    return total + perBed * b.count;
  }, 0);
}

export function describeBeds(beds: BedConfiguration[]): string {
  if (beds.length === 0) return "No bed info";
  return beds
    .map((b) => {
      const info = BED_SIZES[b.type];
      const count = b.count > 1 ? `${b.count}x ` : "";
      return `${count}${info.label} (${info.widthCm}×${info.lengthCm}cm)`;
    })
    .join(", ");
}

/**
 * Human-readable warnings when a listing's real bed sizes may not suit the
 * number of travelers — e.g. two travelers but only a single snug double.
 */
export function bedWarnings(beds: BedConfiguration[], travelers: number): string[] {
  if (beds.length === 0) {
    return ["No bed size data available for this listing — confirm bed sizes before booking."];
  }

  const warnings: string[] = [];
  const widest = widestBedCm(beds);
  const capacity = bedSleepingCapacity(beds);
  const hasSofaBed = beds.some((b) => BED_SIZES[b.type].isSofaBed);
  const hasBunkBed = beds.some((b) => BED_SIZES[b.type].isBunk);

  if (travelers >= 2) {
    const rating = comfortRating(widest);
    if (rating === "single-only") {
      warnings.push(
        `Widest bed is only ${widest}cm — comfortably fits one adult, not two.`
      );
    } else if (rating === "snug") {
      warnings.push(
        `Snug for 2 — widest bed is ${widest}cm, fine for one adult plus a smaller adult/child, tight for two larger adults.`
      );
    } else if (rating === "standard") {
      warnings.push(
        `Standard double (${widest}cm) — comfortable for two average-sized adults, but two larger adults may find it tight.`
      );
    }
  }

  if (capacity < travelers) {
    warnings.push(
      `Beds sleep ${capacity} comfortably, but the trip is for ${travelers} travelers.`
    );
  }

  if (hasSofaBed) {
    warnings.push("Includes a sofa bed — check its listed size before counting on it for adult sleepers.");
  }
  if (hasBunkBed) {
    warnings.push("Includes bunk beds — each bunk is single-width, not suited to two adults sharing.");
  }

  return warnings;
}

/** UI-facing bed-size filter tiers for the trip search form. */
export const BED_SIZE_FILTER_TIERS: { label: string; minBedWidthCm: number }[] = [
  { label: "Any bed size", minBedWidthCm: 0 },
  { label: "Full/Double & up (137cm+)", minBedWidthCm: 137 },
  { label: "Queen & up (152cm+)", minBedWidthCm: 152 },
  { label: "Scandinavian double & up (180cm+)", minBedWidthCm: 180 },
  { label: "King & up (193cm+)", minBedWidthCm: 193 },
];

export function meetsBedRequirement(
  beds: BedConfiguration[],
  minBedWidthCm: number | undefined,
  excludeSofaBeds: boolean | undefined
): boolean {
  if (excludeSofaBeds && beds.every((b) => BED_SIZES[b.type].isSofaBed)) {
    return false;
  }
  if (!minBedWidthCm) return true;
  return widestBedCm(beds) >= minBedWidthCm;
}
