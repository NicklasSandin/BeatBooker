// ============================================================
// BeatBooker - Core Type Definitions
// ============================================================

// --- Bed Size Types ---
// See src/lib/beds.ts for the reference dimension table and helpers.
export type BedType =
  | "twin"
  | "full_double"
  | "queen"
  | "king"
  | "cal_king"
  | "eu_single"
  | "eu_double_140"
  | "scandinavian_180"
  | "eu_king_200"
  | "sofa_bed"
  | "bunk_bed";

export interface BedConfiguration {
  type: BedType;
  count: number;
}

// --- Geo Types ---
export interface Coordinates {
  lat: number;
  lng: number;
}

// --- Trip Types ---
export interface TripFormData {
  location: string; // City, Country, or Region
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  maxBudget: number;
  travelers: number;
  coordinates?: Coordinates; // resolved via /api/geocode when the user picks a place
  country?: string;
  countryCode?: string;
  currency?: string;
  // Minimum bed width in cm required by the traveler (e.g. 152 = "Queen & up").
  // Undefined/0 means no bed-size requirement.
  minBedWidthCm?: number;
  excludeSofaBeds?: boolean;
}

export interface Trip {
  id: string;
  createdAt: string;
  updatedAt: string;
  formData: TripFormData;
  rentals?: RentalAnalysis;
  hotels?: HotelAnalysis;
  thePick?: PickAnalysis;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

// --- Rental Types ---
export interface RentalListing {
  id: string;
  title: string;
  url: string;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  reviewScore: number;
  reviewCount: number;
  neighborhood: string;
  platform: string;
  imageUrl?: string;
  coordinates: Coordinates;
  beds: BedConfiguration[];
  /** True when beds were inferred from a room name/description rather than confirmed by the data source. */
  bedsEstimated?: boolean;
}

export interface RentalAnalysis {
  cheapestWeek: {
    startDate: string;
    endDate: string;
    totalPrice: number;
    avgPricePerNight: number;
    listings: RentalListing[];
  };
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  bestNeighborhoods: {
    name: string;
    avgPrice: number;
    listingCount: number;
  }[];
  allListings: RentalListing[];
}

// --- Hotel Types ---
export interface HotelPrice {
  platform: string;
  price: number;
  currency: string;
  url: string;
  isRefundable: boolean;
  rating: number;
}

export interface HotelOption {
  name: string;
  prices: HotelPrice[];
  cheapestPlatform: string;
  cheapestPrice: number;
  mostExpensivePrice: number;
  savings: number; // difference between most expensive and cheapest
  starRating?: number;
  address?: string;
  coordinates: Coordinates;
  beds: BedConfiguration[];
  /** True when beds were inferred from a room name/description rather than confirmed by the data source. */
  bedsEstimated?: boolean;
}

export interface HotelAnalysis {
  hotels: HotelOption[];
  summary: {
    totalSavings: number;
    bestPlatform: string; // platform with most savings overall
  };
}

// --- "The Pick" Types ---
export interface OrganicPick {
  title: string;
  type: 'rental' | 'hotel';
  platform: string;
  price: number;
  pricePerNight: number;
  currency: string;
  score: number; // reviewScore / price ratio
  reviewScore: number;
  reviewCount: number;
  directBookingUrl: string;
  description: string;
  neighborhood: string;
  imageUrl?: string;
  coordinates: Coordinates;
  beds: BedConfiguration[];
}

export interface SponsoredListing {
  title: string;
  platform: string;
  price: number;
  currency: string;
  url: string;
}

export interface PickAnalysis {
  topPicks: OrganicPick[];
  sponsoredComparison: SponsoredListing[];
  methodology: string;
}

// --- Export Types ---
export type ExportFormat = 'json' | 'markdown';

export interface ExportData {
  trip: Trip;
  generatedAt: string;
  appVersion: string;
}
