// ============================================================
// BeatBooker - Core Type Definitions
// ============================================================

// --- MCP Connection Types ---
export interface MCPConnection {
  id: string;
  name: string;
  url: string;
  type: 'rentals' | 'hotels' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  requiresKey: boolean;
  apiKey?: string;
  description: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

// --- Trip Types ---
export interface TripFormData {
  location: string; // City, Country, or Region
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  maxBudget: number;
  travelers: number;
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
  score: number; // reviewScore / price ratio
  reviewScore: number;
  reviewCount: number;
  directBookingUrl: string;
  description: string;
  neighborhood: string;
  imageUrl?: string;
}

export interface SponsoredListing {
  title: string;
  platform: string;
  price: number;
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
