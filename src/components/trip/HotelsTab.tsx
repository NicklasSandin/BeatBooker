"use client";

import { Building, TrendingDown, ExternalLink, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { HotelAnalysis } from "@/types";

interface HotelsTabProps {
  hotels: HotelAnalysis;
}

export function HotelsTab({ hotels }: HotelsTabProps) {
  const { hotels: hotelList, summary } = hotels;

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
                {formatCurrency(summary.totalSavings)}
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5 text-primary" />
            Hotel Price Comparison
          </CardTitle>
          <CardDescription>
            Compare prices across booking platforms for each hotel
          </CardDescription>
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
                {hotelList.map((hotel) => (
                  <TableRow key={hotel.name}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{hotel.name}</p>
                        {hotel.starRating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {hotel.starRating} Star
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-xs">
                        {hotel.cheapestPlatform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(hotel.cheapestPrice)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(hotel.mostExpensivePrice)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(hotel.savings)}
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
          <div className="space-y-6">
            {hotelList.map((hotel) => (
              <div key={hotel.name} className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  {hotel.name}
                  {hotel.starRating && (
                    <span className="text-xs text-muted-foreground">
                      ({hotel.starRating}★)
                    </span>
                  )}
                </h4>
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
                          {formatCurrency(price.price)}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
