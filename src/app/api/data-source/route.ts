import { NextResponse } from "next/server";
import { getAccommodationProvider } from "@/lib/providers";

/** GET /api/data-source — reports which accommodation data provider is currently active. */
export async function GET() {
  const provider = getAccommodationProvider();
  return NextResponse.json({ provider: provider.id });
}
