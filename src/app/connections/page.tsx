"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, ExternalLink, Loader2, Sparkles, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProviderId = "liteapi" | "simulated";

export default function DataSourcePage() {
  const [provider, setProvider] = useState<ProviderId | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/data-source")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProvider(data.provider ?? "simulated");
      })
      .catch(() => {
        if (!cancelled) setProvider("simulated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Source</h1>
          <p className="text-muted-foreground mt-1">
            Where BeatBooker&apos;s rental and hotel listings actually come from.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {provider === null ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : provider === "liteapi" ? (
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-muted-foreground" />
              )}
              Current provider
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {provider === null && <p className="text-sm text-muted-foreground">Checking...</p>}
            {provider === "liteapi" && (
              <>
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" /> Live data (LiteAPI)
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Search results are real hotel and apartment inventory from LiteAPI/Nuitee.
                  Bed configurations from this source are inferred from room names and marked
                  &ldquo;estimated&rdquo; where shown, since bed dimensions aren&apos;t always a
                  structured field in the underlying data.
                </p>
              </>
            )}
            {provider === "simulated" && (
              <>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" /> Simulated demo data
                </Badge>
                <p className="text-sm text-muted-foreground">
                  No <code className="text-xs bg-muted px-1 py-0.5 rounded">LITEAPI_KEY</code> is
                  configured, so BeatBooker generates realistic worldwide listings — real
                  coordinates and currency for your searched destination, with exact
                  (not estimated) bed dimensions — instead of querying a live source.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm space-y-2">
                <p className="font-medium">Switch to live data</p>
                <p className="text-muted-foreground">
                  Get a free LiteAPI sandbox key (no credit card required), add it to{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> as{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">LITEAPI_KEY=...</code>,
                  and restart the app.
                </p>
                <a
                  href="https://dashboard.liteapi.travel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  Get a free LiteAPI sandbox key
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
