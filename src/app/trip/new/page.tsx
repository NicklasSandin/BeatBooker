"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, Users, DollarSign, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTripStore } from "@/store/tripStore";
import { useMCPStore } from "@/store/mcpStore";
import type { TripFormData } from "@/types";

function NewTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createTrip, setTripStatus, setRentals, setHotels, setThePick } = useTripStore();
  const { connections } = useMCPStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<TripFormData>({
    location: searchParams.get("location") || "",
    startDate: "",
    endDate: "",
    maxBudget: 200,
    travelers: 1,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedFormData = {
      ...formData,
      location: formData.location.trim(),
    };

    if (!normalizedFormData.location) {
      setFormError("Enter a destination.");
      return;
    }
    if (
      !normalizedFormData.startDate ||
      !normalizedFormData.endDate ||
      normalizedFormData.endDate <= normalizedFormData.startDate
    ) {
      setFormError("Check-out must be after check-in.");
      return;
    }

    setFormError("");
    setIsAnalyzing(true);
    const tripId = createTrip(normalizedFormData);
    setTripStatus(tripId, "analyzing");

    try {
      // Call the analyze API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          formData: normalizedFormData,
          connections,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Analysis failed. Please try again.");
      }

      if (result.rentals) setRentals(tripId, result.rentals);
      if (result.hotels) setHotels(tripId, result.hotels);
      if (result.thePick) setThePick(tripId, result.thePick);

      setTripStatus(tripId, "completed");
      router.push(`/trip/${tripId}`);
    } catch (error) {
      setTripStatus(tripId, "error", error instanceof Error ? error.message : "Analysis failed");
      // Still navigate to results page to show error state
      router.push(`/trip/${tripId}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">New Trip Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Enter your trip details and let BeatBooker find the best deals.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Fill in your destination, travel dates, and budget preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Destination (City, Country, or Region)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Paris, Tokyo, New York"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Check-in Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                      className="pl-10"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Check-out Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                    type="date"
                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                      className="pl-10"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">Max Budget per Night ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="maxBudget"
                      type="number"
                      min={1}
                      className="pl-10"
                      value={formData.maxBudget}
                      onChange={(e) => setFormData({ ...formData, maxBudget: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travelers">Number of Travelers</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="travelers"
                      type="number"
                      min={1}
                      max={20}
                      className="pl-10"
                      value={formData.travelers}
                      onChange={(e) => setFormData({ ...formData, travelers: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Trip...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Analyze Trip
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Analysis mode */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Demo Analysis</CardTitle>
            <CardDescription>
              Results use generated sample listings so you can evaluate the complete workflow
              without external accounts. Configured connectors are available for connection
              testing but are not queried by this demo analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
              Configured connectors
            </p>
            <div className="space-y-2">
              {connections.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between text-sm">
                  <span>{conn.name}</span>
                  <span
                    className={`text-xs ${
                      conn.status === "connected"
                        ? "text-green-600 dark:text-green-400"
                        : conn.status === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conn.status === "connected"
                      ? "Connected"
                      : conn.status === "error"
                      ? "Error"
                      : "Not tested"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewTripPage() {
  return (
    <Suspense fallback={<div className="container py-8" aria-busy="true" />}>
      <NewTripForm />
    </Suspense>
  );
}
