"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LANDMARKS, wikimediaOriginal } from "@/lib/landmarks";

const HERO_LANDMARKS = LANDMARKS.slice(0, 8);
const ROTATE_MS = 6000;

const STATS = [
  { label: "Mode", value: "Demo" },
  { label: "Platforms", value: "8" },
  { label: "Top Picks", value: "3" },
  { label: "Cost", value: "Free" },
];

export function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_LANDMARKS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    router.push(`/trip/new?location=${encodeURIComponent(location.trim())}`);
  };

  const current = HERO_LANDMARKS[index];

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent">
        <AnimatePresence>
          <motion.div
            key={current.imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={wikimediaOriginal(current.imageUrl)}
              alt={current.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
              onError={() => setIndex((i) => (i + 1) % HERO_LANDMARKS.length)}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
      </div>

      <div className="container relative z-10 flex flex-col items-center gap-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur"
        >
          <Search className="mr-2 h-4 w-4" />
          Beat the Booking Sites with AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-7xl"
        >
          Find the Best Deals on <span className="text-accent">Anywhere</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-lg text-white/90 md:text-xl"
        >
          We scan rentals and hotels by real bed size and real price — not just &ldquo;sleeps 2&rdquo;.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSearch}
          className="w-full max-w-2xl"
        >
          <div className="relative flex items-center rounded-full border border-white/30 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
            <MapPin className="absolute left-6 h-6 w-6 text-white/70" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where do you want to go? (e.g. Tokyo, Italy, Bali)"
              className="h-14 rounded-full border-0 bg-transparent pl-14 pr-32 text-lg text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-0"
              required
            />
            <Button type="submit" size="lg" className="absolute right-2 h-11 gap-2 rounded-full px-6">
              Search
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid w-full max-w-2xl grid-cols-2 gap-4 pt-6 md:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur"
            >
              <div className="text-2xl font-bold text-accent">{stat.value}</div>
              <div className="text-xs uppercase tracking-wider text-white/80">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
