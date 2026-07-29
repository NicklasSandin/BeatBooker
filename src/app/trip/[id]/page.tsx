"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, Home, Building, Star, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTripStore } from "@/store/tripStore";
import { RentalsTab } from "@/components/trip/RentalsTab";
import { HotelsTab } from "@/components/trip/HotelsTab";
import { ThePickTab } from "@/components/trip/ThePickTab";
import { ExportButton } from "@/components/trip/ExportButton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { matchLandmark, wikimediaOriginal } from "@/lib/landmarks";
import { getHotellookSearchUrl } from "@/lib/affiliates";

const statsContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const statItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const fadeIn = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Leaflet touches `window` at module-eval time, so the map must never render on the server.
const TripMap = dynamic(() => import("@/components/map/TripMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-lg" />,
});

function TripSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function ErrorState({
  message,
  title = "Analysis Failed",
}: {
  message: string;
  title?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">{message}</p>
        <Link href="/trip/new">
          <Button>Try Again</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function TripResultsPage() {
  const params = useParams<{ id: string }>();
  const [bannerImageFailed, setBannerImageFailed] = useState(false);
  const trips = useTripStore((state) => state.trips);
  const hasHydrated = useSyncExternalStore(
    (onStoreChange) =>
      useTripStore.persist.onFinishHydration(() => onStoreChange()),
    () => useTripStore.persist.hasHydrated(),
    () => false
  );

  if (!hasHydrated) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <TripSkeleton />
        </div>
      </div>
    );
  }

  const trip = trips.find((candidate) => candidate.id === params.id);

  if (!trip) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Trip Not Found"
            message="This trip is not available in this browser. It may have been deleted or created on another device."
          />
        </div>
      </div>
    );
  }

  if (trip.status === "pending") {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Analysis Not Started"
            message="This saved trip does not contain an analysis yet. Start a new search to generate results."
          />
        </div>
      </div>
    );
  }

  if (trip.status === "error") {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/trip/new">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{trip.formData.location}</h1>
              <p className="text-muted-foreground">
                {formatDate(trip.formData.startDate)} - {formatDate(trip.formData.endDate)}
              </p>
            </div>
          </div>
          <ErrorState message={trip.error || "An unexpected error occurred during analysis."} />
        </div>
      </div>
    );
  }

  if (trip.status === "analyzing") {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/trip/new">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{trip.formData.location}</h1>
              <p className="text-muted-foreground">
                {formatDate(trip.formData.startDate)} - {formatDate(trip.formData.endDate)}
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Your Trip</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Searching for the best rental and hotel deals in {trip.formData.location}...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const landmark = matchLandmark(trip.formData.location);
  const hotellookUrl = getHotellookSearchUrl({
    location: trip.formData.location,
    startDate: trip.formData.startDate,
    endDate: trip.formData.endDate,
    travelers: trip.formData.travelers,
    currency: trip.formData.currency,
  });

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Destination banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 overflow-hidden rounded-2xl"
        >
          <div className="relative h-48 w-full sm:h-56 bg-gradient-to-br from-primary to-accent">
            {landmark && !bannerImageFailed && (
              <Image
                src={wikimediaOriginal(landmark.imageUrl)}
                alt={landmark.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                onError={() => setBannerImageFailed(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
            <Link href="/trip/new">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow sm:text-3xl">
                {trip.formData.location}
              </h1>
              <p className="text-sm text-white/85 sm:text-base">
                {formatDate(trip.formData.startDate)} - {formatDate(trip.formData.endDate)} &middot;{" "}
                {trip.formData.travelers} traveler{trip.formData.travelers > 1 ? "s" : ""} &middot;{" "}
                Budget: {formatCurrency(trip.formData.maxBudget)}/night
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
          {hotellookUrl ? (
            <a href={hotellookUrl} target="_blank" rel="noopener noreferrer sponsored">
              <Button variant="outline" className="gap-2">
                Compare Live Deals on Hotellook
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <span />
          )}
          <ExportButton trip={trip} />
        </div>

        {/* Quick Stats */}
        <motion.div
          variants={statsContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <motion.div variants={statItem}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Best Rental
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trip.rentals ? (
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(trip.rentals.cheapestWeek.totalPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">Lowest stay total</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No rental data</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={statItem}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  Best Hotel Deal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trip.hotels && trip.hotels.hotels.length > 0 ? (
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(trip.hotels.summary.totalSavings)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total potential savings</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No hotel data</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={statItem}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Top Pick Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trip.thePick && trip.thePick.topPicks.length > 0 ? (
                  <div>
                    <p className="text-2xl font-bold">
                      {trip.thePick.topPicks[0].score.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Best value score</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Results Tabs */}
        <Tabs defaultValue="rentals" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rentals" className="gap-2">
              <Home className="h-4 w-4" />
              Rentals
            </TabsTrigger>
            <TabsTrigger value="hotels" className="gap-2">
              <Building className="h-4 w-4" />
              Hotels
            </TabsTrigger>
            <TabsTrigger value="thepick" className="gap-2">
              <Star className="h-4 w-4" />
              The Pick
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rentals" className="mt-6">
            <motion.div variants={fadeIn} initial="hidden" animate="show">
              {trip.rentals ? (
                <RentalsTab rentals={trip.rentals} travelers={trip.formData.travelers} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Home className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No rental data available</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="hotels" className="mt-6">
            <motion.div variants={fadeIn} initial="hidden" animate="show">
              {trip.hotels ? (
                <HotelsTab hotels={trip.hotels} travelers={trip.formData.travelers} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Building className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No hotel data available</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="thepick" className="mt-6">
            <motion.div variants={fadeIn} initial="hidden" animate="show">
              {trip.thePick ? (
                <ThePickTab thePick={trip.thePick} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Star className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No pick data available</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="map" className="mt-6">
            <motion.div variants={fadeIn} initial="hidden" animate="show">
              {(() => {
                const rentalListings = trip.rentals?.allListings ?? [];
                const hotelOptions = trip.hotels?.hotels ?? [];
                const mapCenter =
                  trip.formData.coordinates ??
                  rentalListings[0]?.coordinates ??
                  hotelOptions[0]?.coordinates;

                if (!mapCenter || (rentalListings.length === 0 && hotelOptions.length === 0)) {
                  return (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No map data available</p>
                      </CardContent>
                    </Card>
                  );
                }

                return <TripMap center={mapCenter} rentals={rentalListings} hotels={hotelOptions} />;
              })()}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
