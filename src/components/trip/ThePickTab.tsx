"use client";

import { Star, Trophy, ExternalLink, TrendingUp, Home, Building, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { PickAnalysis } from "@/types";

interface ThePickTabProps {
  thePick: PickAnalysis;
}

export function ThePickTab({ thePick }: ThePickTabProps) {
  const { topPicks, sponsoredComparison, methodology } = thePick;
  const maximumSavings = Math.max(
    0,
    ...sponsoredComparison.map((sponsored, index) => {
      const pick = topPicks[index];
      if (!pick || sponsored.price <= 0) return 0;
      return ((sponsored.price - pick.price) / sponsored.price) * 100;
    })
  );

  return (
    <div className="space-y-6">
      {/* Methodology Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">
                How {"The Pick"} Works
              </p>
              <p className="text-muted-foreground">
                {methodology}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Picks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Organic Picks
          </CardTitle>
          <CardDescription>
            Best value listings ranked by review score relative to price
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPicks.map((pick, index) => (
              <div
                key={index}
                className={`relative p-4 rounded-lg border-2 transition-colors ${
                  index === 0
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Rank Badge */}
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? "bg-yellow-400 text-yellow-950"
                    : index === 1
                    ? "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                    : "bg-amber-600 text-white"
                }`}>
                  {index + 1}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{pick.title}</p>
                      <Badge
                        variant={pick.type === "rental" ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {pick.type === "rental" ? (
                          <Home className="h-3 w-3 mr-1" />
                        ) : (
                          <Building className="h-3 w-3 mr-1" />
                        )}
                        {pick.type === "rental" ? "Rental" : "Hotel"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {pick.platform}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{pick.neighborhood}</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {pick.reviewScore.toFixed(1)} ({pick.reviewCount} reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        Score: {pick.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(pick.price)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(pick.pricePerNight)}/night
                      </p>
                    </div>
                    <a
                      href={pick.directBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Direct Link
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sponsored Comparison */}
      {sponsoredComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              vs Sponsored Listings
            </CardTitle>
            <CardDescription>
              Compare our top picks against typical sponsored results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Listing</th>
                    <th className="text-left py-2 font-medium">Platform</th>
                    <th className="text-right py-2 font-medium">Price</th>
                    <th className="text-right py-2 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsoredComparison.map((sponsored, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{sponsored.title}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs">
                          {sponsored.platform}
                        </Badge>
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {formatCurrency(sponsored.price)}
                      </td>
                      <td className="py-2 text-right">
                        <Badge variant="warning" className="text-xs">
                          Sponsored
                        </Badge>
                      </td>
                    </tr>
            ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Callout */}
      {topPicks.length > 0 && sponsoredComparison.length > 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold">
                  You save up to{" "}
                  <span className="text-primary">
                    {maximumSavings.toFixed(0)}%
                  </span>
                  {" "}by booking direct with our organic picks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
