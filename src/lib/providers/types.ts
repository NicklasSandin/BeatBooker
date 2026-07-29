import type { Coordinates, HotelAnalysis, RentalAnalysis } from "@/types";

export interface AccommodationSearchParams {
  location: string;
  coordinates: Coordinates;
  countryCode?: string;
  currency: string;
  startDate: string;
  endDate: string;
  maxBudget: number;
  travelers: number;
  minBedWidthCm?: number;
  excludeSofaBeds?: boolean;
}

export interface AccommodationProvider {
  /** Machine-readable id, surfaced on the Data Source status page. */
  id: string;
  searchRentals(params: AccommodationSearchParams): Promise<RentalAnalysis>;
  searchHotels(params: AccommodationSearchParams): Promise<HotelAnalysis>;
}
