import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import React from "react";

export const metadata: Metadata = {
  title: "BeatBooker - Beat the Booking Sites with AI",
  description:
    "Find the best deals on short-term rentals and hotels. Beat Booking.com & Airbnb fees with AI-powered analysis.",
  keywords: [
    "travel",
    "hotels",
    "rentals",
    "Airbnb",
    "Booking.com",
    "price comparison",
    "AI travel",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
