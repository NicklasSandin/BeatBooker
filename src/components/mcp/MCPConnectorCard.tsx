"use client";

import { RefreshCw, Trash2, Check, AlertCircle, WifiOff, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMCPStore } from "@/store/mcpStore";
import { MCPClient } from "@/lib/mcp/client";
import type { MCPConnection } from "@/types";
import { useState } from "react";

function ConnectionStatus({ status }: { status: MCPConnection["status"] }) {
  if (status === "connected") {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 gap-1">
        <Check className="h-3 w-3" /> Connected
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 gap-1">
        <AlertCircle className="h-3 w-3" /> Error
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <WifiOff className="h-3 w-3" /> Disconnected
    </Badge>
  );
}

interface MCPConnectorCardProps {
  connection: MCPConnection;
}

export function MCPConnectorCard({ connection }: MCPConnectorCardProps) {
  const { setConnectionStatus, removeConnection } = useMCPStore();
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus(connection.id, "disconnected");
    try {
      const client = new MCPClient(connection);
      const isConnected = await client.testConnection();
      setConnectionStatus(connection.id, isConnected ? "connected" : "error");
    } catch {
      setConnectionStatus(connection.id, "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            {connection.type === "rentals" ? "🏠" : connection.type === "hotels" ? "🏨" : "🔌"}
            {connection.name}
          </CardTitle>
          <CardDescription>{connection.description}</CardDescription>
        </div>
        <ConnectionStatus status={connection.status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Wifi className="h-4 w-4 text-muted-foreground" />
            <code className="text-xs bg-muted px-2 py-1 rounded">{connection.url}</code>
          </div>
          {connection.requiresKey && (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
              API Key Required
            </Badge>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={testing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${testing ? "animate-spin" : ""}`} />
              {testing ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeConnection(connection.id)}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
