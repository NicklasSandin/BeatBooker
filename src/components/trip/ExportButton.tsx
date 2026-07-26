"use client";

import { useState } from "react";
import { FileDown, FileJson, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateTripJSON } from "@/lib/export/json";
import { generateTripMarkdown } from "@/lib/export/markdown";
import type { Trip } from "@/types";

interface ExportButtonProps {
  trip: Trip;
}

export function ExportButton({ trip }: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: "json" | "markdown") => {
    setExporting(format);
    try {
      if (format === "json") {
        const data = generateTripJSON(trip);
        const blob = new Blob([data], { type: "application/json" });
        downloadBlob(blob, `beatbooker-trip-${trip.id}.json`);
      } else {
        const data = generateTripMarkdown(trip);
        const blob = new Blob([data], { type: "text/markdown" });
        downloadBlob(blob, `beatbooker-trip-${trip.id}.md`);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(null);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={exporting !== null}>
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="mr-2 h-4 w-4" />
          <span>Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("markdown")}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Export as Markdown</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
