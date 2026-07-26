import { NextRequest, NextResponse } from "next/server";
import { generateTripJSON } from "@/lib/export/json";
import { generateTripMarkdown } from "@/lib/export/markdown";
import type { ExportFormat, Trip } from "@/types";

/**
 * POST /api/export
 * 
 * Exports trip data in requested format (json or markdown).
 * Used for server-side export when needed (e.g., PDF generation in future).
 */

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isExportRequest(body)) {
      return NextResponse.json(
        { error: "Provide valid trip data and a supported export format." },
        { status: 400 }
      );
    }

    const { trip, format } = body;

    if (format === "markdown") {
      const markdown = generateTripMarkdown(trip);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="beatbooker-trip-${trip.id}.md"`,
        },
      });
    }

    // Default: JSON
    const json = generateTripJSON(trip);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="beatbooker-trip-${trip.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export trip data" },
      { status: 500 }
    );
  }
}

function isExportRequest(
  value: unknown
): value is { trip: Trip; format: ExportFormat } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const trip = candidate.trip;
  if (!trip || typeof trip !== "object") return false;

  const tripRecord = trip as Record<string, unknown>;
  return (
    typeof tripRecord.id === "string" &&
    typeof tripRecord.formData === "object" &&
    (candidate.format === "json" || candidate.format === "markdown")
  );
}
