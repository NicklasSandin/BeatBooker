/**
 * JSON Export Utility
 * 
 * Exports trip data as a formatted JSON file.
 */

import type { Trip, ExportData } from "@/types";

/**
 * Export trip data as a downloadable JSON file
 */
export function exportTripAsJSON(trip: Trip): void {
  const exportData: ExportData = {
    trip,
    generatedAt: new Date().toISOString(),
    appVersion: "1.0.0",
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `beatbooker-trip-${trip.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate JSON string for a trip
 */
export function generateTripJSON(trip: Trip): string {
  const exportData: ExportData = {
    trip,
    generatedAt: new Date().toISOString(),
    appVersion: "1.0.0",
  };
  return JSON.stringify(exportData, null, 2);
}
