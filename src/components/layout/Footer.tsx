import { Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          <span className="font-bold">BeatBooker</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          Built to beat Booking.com & Airbnb fees. Find the best deals on
          short-term rentals and hotels with AI-powered analysis.
        </p>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BeatBooker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
