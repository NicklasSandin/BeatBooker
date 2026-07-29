"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, DollarSign, MapPin, Home, TrendingUp, TrendingDown, BedDouble } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BED_SIZE_FILTER_TIERS, bedWarnings, describeBeds, meetsBedRequirement } from "@/lib/beds";
import type { RentalAnalysis } from "@/types";

interface RentalsTabProps {
  rentals: RentalAnalysis;
  travelers: number;
}

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function RentalsTab({ rentals, travelers }: RentalsTabProps) {
  const { cheapestWeek, priceRange, bestNeighborhoods, allListings } = rentals;
  const [minBedFilter, setMinBedFilter] = useState(0);
  const currency = allListings[0]?.currency ?? "USD";

  const filteredListings = useMemo(
    () => allListings.filter((l) => meetsBedRequirement(l.beds, minBedFilter, false)),
    [allListings, minBedFilter]
  );

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
                {formatCurrency(cheapestWeek.totalPrice, currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg per Night</p>
              <p className="font-semibold">
                {formatCurrency(cheapestWeek.avgPricePerNight, currency)}
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
                  {formatCurrency(priceRange.min, currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="font-semibold">{formatCurrency(priceRange.avg, currency)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Maximum</p>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(priceRange.max, currency)}
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
                  <p className="font-semibold">{formatCurrency(neighborhood.avgPrice, currency)}</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Available Rentals</CardTitle>
              <CardDescription>
                {filteredListings.length} of {allListings.length} listing
                {allListings.length > 1 ? "s" : ""} match your bed-size filter
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Select
                value={String(minBedFilter)}
                onValueChange={(value) => setMinBedFilter(Number(value))}
              >
                <SelectTrigger>
                  <BedDouble className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BED_SIZE_FILTER_TIERS.map((tier) => (
                    <SelectItem key={tier.minBedWidthCm} value={String(tier.minBedWidthCm)}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredListings.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No listings match this bed-size filter. Try a lower minimum.
              </p>
            )}
            {filteredListings.map((listing) => {
              const warnings = bedWarnings(listing.beds, travelers);
              return (
                <motion.div
                  key={listing.id}
                  variants={listItem}
                  whileHover={{ y: -2 }}
                  className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:border-primary/50 hover:shadow-md transition-[border-color,box-shadow]"
                >
                  {listing.imageUrl && (
                    <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 128px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{listing.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {listing.platform}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span>{listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}</span>
                        <span>{listing.bathrooms} bath{listing.bathrooms > 1 ? "s" : ""}</span>
                        <span>Up to {listing.maxGuests} guests</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.neighborhood}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {describeBeds(listing.beds)}
                          {listing.bedsEstimated ? " (estimated)" : ""}
                        </span>
                      </div>
                      {warnings.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {warnings.map((warning) => (
                            <Badge key={warning} variant="warning" className="text-xs font-normal">
                              {warning}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span>{listing.reviewScore.toFixed(1)}</span>
                        <span className="text-muted-foreground">({listing.reviewCount} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold">{formatCurrency(listing.totalPrice, listing.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(listing.pricePerNight, listing.currency)}/night
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
