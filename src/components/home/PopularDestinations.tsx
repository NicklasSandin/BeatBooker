"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LANDMARKS, wikimediaOriginal } from "@/lib/landmarks";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function PopularDestinations() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Popular Destinations</h2>
        <p className="mt-2 text-muted-foreground">
          Pick a place to start your search, or type your own above.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {LANDMARKS.map((landmark) => (
          <motion.div key={landmark.place} variants={item}>
            <Link
              href={`/trip/new?location=${encodeURIComponent(landmark.place)}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent shadow-sm transition-shadow hover:shadow-xl"
            >
              <Image
                src={wikimediaOriginal(landmark.imageUrl)}
                alt={landmark.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-sm font-semibold text-white drop-shadow">{landmark.title}</p>
                <p className="text-xs text-white/75">{landmark.place.split(",")[0]}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
