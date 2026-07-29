"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building, TrendingDown, ExternalLink, Star, BedDouble } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { BED_SIZE_FILTER_TIERS, bedWarnings, describeBeds, meetsBedRequirement } from "@/lib/beds";
import type { HotelAnalysis } from "@/types";

interface HotelsTabProps {
  hotels: HotelAnalysis;
  travelers: number;
}

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const listItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function HotelsTab({ hotels, travelers }: HotelsTabProps) {
  const { hotels: hotelList, summary } = hotels;
  const [minBedFilter, setMinBedFilter] = useState(0);
  const currency = hotelList[0]?.prices[0]?.currency ?? "USD";

  const filteredHotels = useMemo(
    () => hotelList.filter((h) => meetsBedRequirement(h.beds, minBedFilter, false)),
    [hotelList, minBedFilter]
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            Savings Summary
          </CardTitle>
          <CardDescription>
            Total potential savings by choosing the cheapest platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Potential Savings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.totalSavings, currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Platform Overall</p>
              <p className="text-lg font-semibold">{summary.bestPlatform}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-primary" />
                Hotel Price Comparison
              </CardTitle>
              <CardDescription>
                {filteredHotels.length} of {hotelList.length} hotels match your bed-size filter
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hotel</TableHead>
                  <TableHead>Cheapest Platform</TableHead>
                  <TableHead className="text-right">Cheapest Price</TableHead>
                  <TableHead className="text-right">Most Expensive</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHotels.map((hotel) => (
                  <TableRow key={hotel.name}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <p>{hotel.name}</p>
                        {hotel.starRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {hotel.starRating} Star
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BedDouble className="h-3 w-3" />
                          {describeBeds(hotel.beds)}
                          {hotel.bedsEstimated ? " (estimated)" : ""}
                        </div>
                        {bedWarnings(hotel.beds, travelers).map((warning) => (
                          <Badge key={warning} variant="warning" className="text-xs font-normal block w-fit">
                            {warning}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-xs">
                        {hotel.cheapestPlatform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(hotel.cheapestPrice, currency)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(hotel.mostExpensivePrice, currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(hotel.savings, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{hotel.prices[0]?.rating.toFixed(1) || "N/A"}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredHotels.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No hotels match this bed-size filter. Try a lower minimum.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Price Breakdown by Platform</CardTitle>
          <CardDescription>
            See all prices across different booking platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-6">
            {filteredHotels.map((hotel) => (
              <motion.div key={hotel.name} variants={listItem} className="space-y-3">
                <div className="flex items-center gap-3">
                  {hotel.imageUrl && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image src={hotel.imageUrl} alt={hotel.name} fill sizes="48px" className="object-cover" />
                    </div>
                  )}
                  <h4 className="font-medium flex items-center gap-2">
                    {hotel.name}
                    {hotel.starRating && (
                      <span className="text-xs text-muted-foreground">
                        ({hotel.starRating}★)
                      </span>
                    )}
                  </h4>
                </div>
                <div className="grid gap-2">
                  {hotel.prices.map((price, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        price.price === hotel.cheapestPrice
                          ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{price.platform}</span>
                        {price.price === hotel.cheapestPrice && (
                          <Badge variant="success" className="text-xs">
                            Best Price
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold ${
                            price.price === hotel.cheapestPrice
                              ? "text-green-600 dark:text-green-400"
                              : ""
                          }`}
                        >
                          {formatCurrency(price.price, price.currency)}
                        </span>
                        {price.url && (
                          <a
                            href={price.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
