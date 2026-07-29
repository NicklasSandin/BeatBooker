import type { ComponentProps } from "react";
import Script from "next/script";

/**
 * Travelpayouts "Drive" — their AI-powered on-site monetization widget,
 * separate from the plain affiliate-link approach in src/lib/affiliates.ts.
 * Loads only when a project script URL is configured; renders nothing
 * otherwise. The extra attributes are Travelpayouts' own documented
 * boilerplate (their install snippet adds them so the script survives
 * WordPress cache plugins like WP Rocket/Fastest Cache) — harmless no-ops
 * here, kept for parity with their official snippet.
 */
export function TravelpayoutsDrive() {
  const src = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_DRIVE_SRC;
  if (!src) return null;

  // next/script's typed props don't include Travelpayouts' non-`data-*`
  // custom attributes (`nowprocket`, `seraph-accel-crit`); Script forwards
  // unknown props straight onto the rendered <script> element at runtime,
  // so this cast just bypasses the overly-narrow prop type, not runtime behavior.
  const scriptProps = {
    src,
    strategy: "afterInteractive",
    async: true,
    nowprocket: "",
    "data-noptimize": "1",
    "data-cfasync": "false",
    "data-wpfc-render": "false",
    "seraph-accel-crit": "1",
    "data-no-defer": "1",
  } as unknown as ComponentProps<typeof Script>;

  return <Script {...scriptProps} />;
}
