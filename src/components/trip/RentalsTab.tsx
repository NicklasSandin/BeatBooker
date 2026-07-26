"use client";

import { Calendar, DollarSign, MapPin, Home, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { RentalAnalysis } from "@/types";

interface RentalsTabProps {
  rentals: RentalAnalysis;
}

export function RentalsTab({ rentals }: RentalsTabProps) {
  const { cheapestWeek, priceRange, bestNeighborhoods, allListings } = rentals;

  return (
    <div className="space-y-6">
      {/* Cheapest Week Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Lowest-Cost Stay
          </CardTitle>
          <CardDescription>
            The lowest-priced option for your requested dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Dates</p>
              <p className="font-semibold">
                {formatDate(cheapestWeek.startDate)} - {formatDate(cheapestWeek.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(cheapestWeek.totalPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg per Night</p>
              <p className="font-semibold">
                {formatCurrency(cheapestWeek.avgPricePerNight)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Minimum</p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(priceRange.min)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="font-semibold">{formatCurrency(priceRange.avg)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Maximum</p>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(priceRange.max)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Neighborhoods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Best Neighborhoods
          </CardTitle>
          <CardDescription>
            Most affordable areas based on average listing prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bestNeighborhoods.map((neighborhood, index) => (
              <div
                key={neighborhood.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{neighborhood.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {neighborhood.listingCount} listing{neighborhood.listingCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(neighborhood.avgPrice)}</p>
                  <p className="text-xs text-muted-foreground">avg/night</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Listings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Rentals</CardTitle>
          <CardDescription>
            {allListings.length} listing{allListings.length > 1 ? "s" : ""} found within your budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allListings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <div className="space-y-1 mb-2 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{listing.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {listing.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}</span>
                    <span>{listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}</span>
                    <span>Up to {listing.maxGuests} guests</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.neighborhood}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span>{listing.reviewScore.toFixed(1)}</span>
                    <span className="text-muted-foreground">({listing.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatCurrency(listing.totalPrice)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(listing.pricePerNight)}/night
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
