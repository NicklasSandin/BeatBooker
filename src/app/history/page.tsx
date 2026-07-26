"use client";

import Link from "next/link";
import { History as HistoryIcon, MapPin, Calendar, DollarSign, Users, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTripStore } from "@/store/tripStore";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function HistoryPage() {
  const { trips, deleteTrip } = useTripStore();

  const sortedTrips = [...trips].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Trip History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your saved trip analyses.
          </p>
        </div>

        {sortedTrips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Trips Yet</h3>
              <p className="text-muted-foreground text-center max-w-md mt-1 mb-6">
                Start by analyzing a new trip. Your trip history will appear here.
              </p>
              <Link href="/trip/new">
                <Button>Analyze Your First Trip</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedTrips.map((trip) => (
              <Card key={trip.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-4 w-4 text-primary" />
                        {trip.formData.location}
                      </CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(trip.formData.startDate)} - {formatDate(trip.formData.endDate)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/trip/${trip.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`Delete the saved trip to ${trip.formData.location}?`)) {
                            deleteTrip(trip.id);
                          }
                        }}
                        aria-label={`Delete trip to ${trip.formData.location}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{trip.formData.travelers} traveler{trip.formData.travelers > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span>{formatCurrency(trip.formData.maxBudget)}/night max</span>
                    </div>
                    <Badge
                      variant={
                        trip.status === "completed"
                          ? "success"
                          : trip.status === "error"
                          ? "warning"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {trip.status === "completed"
                        ? "Completed"
                        : trip.status === "analyzing"
                        ? "Analyzing..."
                        : trip.status === "error"
                        ? "Error"
                        : "Pending"}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
