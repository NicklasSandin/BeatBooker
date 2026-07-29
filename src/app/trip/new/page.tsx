"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, Users, DollarSign, MapPin, Loader2, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTripStore } from "@/store/tripStore";
import type { TripFormData } from "@/types";
import { BED_SIZE_FILTER_TIERS } from "@/lib/beds";
import type { GeocodeResult } from "@/app/api/geocode/route";

function NewTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createTrip, setTripStatus, setRentals, setHotels, setThePick } = useTripStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<TripFormData>({
    location: searchParams.get("location") || "",
    startDate: "",
    endDate: "",
    maxBudget: 200,
    travelers: 1,
    minBedWidthCm: 0,
    excludeSofaBeds: false,
  });

  // --- Destination autocomplete (worldwide, via /api/geocode) ---
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const skipNextFetch = useRef(false);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    const query = formData.location.trim();
    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsGeocoding(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setShowSuggestions(true);
      } catch {
        // ignore — likely aborted by a newer keystroke
      } finally {
        setIsGeocoding(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [formData.location]);

  const selectDestination = (result: GeocodeResult) => {
    skipNextFetch.current = true;
    setFormData({
      ...formData,
      location: `${result.city}, ${result.country}`,
      coordinates: result.coordinates,
      country: result.country,
      countryCode: result.countryCode,
      currency: result.currency,
    });
    setShowSuggestions(false);
  };

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
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, formData: normalizedFormData }),
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
            Search anywhere in the world and let BeatBooker find the best deals — filtered by
            real bed sizes, not just &ldquo;sleeps N&rdquo;.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Fill in your destination, travel dates, budget, and bed-size preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Destination (anywhere in the world)</Label>
                <Popover
                  open={showSuggestions && suggestions.length > 0}
                  onOpenChange={setShowSuggestions}
                >
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        id="location"
                        placeholder="e.g., Paris, Oslo, Tokyo"
                        className="pl-10"
                        value={formData.location}
                        autoComplete="off"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: e.target.value,
                            coordinates: undefined,
                            countryCode: undefined,
                            currency: undefined,
                          })
                        }
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        required
                      />
                      {isGeocoding && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] p-1 max-h-72 overflow-auto"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={() => setShowSuggestions(false)}
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s.city}-${s.countryCode}-${i}`}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-accent-foreground"
                        onClick={() => selectDestination(s)}
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {s.city}
                          {s.admin1 ? `, ${s.admin1}` : ""}, {s.country}
                        </span>
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
                {formData.coordinates && (
                  <p className="text-xs text-muted-foreground">
                    Resolved to {formData.coordinates.lat.toFixed(2)}, {formData.coordinates.lng.toFixed(2)}
                    {formData.currency ? ` · ${formData.currency}` : ""}
                  </p>
                )}
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

              {/* Bed size preferences */}
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Bed size preferences</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  &ldquo;Sleeps 2&rdquo; doesn&apos;t mean two adults actually fit — filter by real bed
                  width instead.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="minBedWidth">Minimum bed size</Label>
                  <Select
                    value={String(formData.minBedWidthCm ?? 0)}
                    onValueChange={(value) => setFormData({ ...formData, minBedWidthCm: Number(value) })}
                  >
                    <SelectTrigger id="minBedWidth">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="excludeSofaBeds" className="cursor-pointer">
                    Exclude listings relying on a sofa bed
                  </Label>
                  <Switch
                    id="excludeSofaBeds"
                    checked={Boolean(formData.excludeSofaBeds)}
                    onCheckedChange={(checked) => setFormData({ ...formData, excludeSofaBeds: checked })}
                  />
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
