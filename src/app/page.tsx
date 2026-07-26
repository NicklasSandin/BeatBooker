"use client";

import React from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [location, setLocation] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    
    router.push(`/trip/new?location=${encodeURIComponent(location.trim())}`);
  };

  return (
    <div className="container py-8 md:py-24 flex flex-col items-center justify-center min-h-[80vh] text-center">
      <section className="flex flex-col items-center space-y-8 w-full max-w-4xl">
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-primary/5 text-primary mb-2">
          <Search className="mr-2 h-4 w-4" />
          Beat the Booking Sites with AI
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-3xl">
          Find the Best Deals on{" "}
          <span className="text-primary">Anywhere</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Enter a city, country, or region. We&apos;ll scan rentals and hotels to find you the cheapest rooms and the best value picks.
        </p>
        
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl group">
          <div className="relative flex items-center">
            <MapPin className="absolute left-4 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where do you want to go? (e.g. Tokyo, Italy, Bali)"
              className="h-16 pl-12 pr-32 text-lg rounded-full border-2 focus:border-primary transition-all shadow-lg"
              required
            />
            <Button 
              type="submit" 
              size="lg" 
              className="absolute right-2 h-12 px-6 rounded-full gap-2"
            >
              Search
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
          {[ 
            { label: "Mode", value: "Demo" },
            { label: "Platforms", value: "8" },
            { label: "Top Picks", value: "3" },
            { label: "Cost", value: "Free" }
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-card border text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
