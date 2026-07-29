import { isLiteApiConfigured, liteApiProvider } from "./liteapi";
import { simulatedProvider } from "./simulated";
import type { AccommodationProvider } from "./types";

export type { AccommodationProvider, AccommodationSearchParams } from "./types";

/** Picks the live LiteAPI provider when a key is configured, simulated data otherwise. */
export function getAccommodationProvider(): AccommodationProvider {
  return isLiteApiConfigured() ? liteApiProvider : simulatedProvider;
}

export { isLiteApiConfigured };
