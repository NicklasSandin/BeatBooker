"use client";

import { useState } from "react";
import { Plug, Plus, Trash2, RefreshCw, Check, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMCPStore } from "@/store/mcpStore";
import { MCPClient } from "@/lib/mcp/client";
import type { MCPConnection } from "@/types";

function ConnectionStatus({ status }: { status: MCPConnection["status"] }) {
  if (status === "connected") {
    return (
      <Badge variant="success" className="gap-1">
        <Check className="h-3 w-3" /> Connected
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge variant="warning" className="gap-1">
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

function ConnectorCard({ connection }: { connection: MCPConnection }) {
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
            <Badge variant="warning" className="text-xs">
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

export default function ConnectionsPage() {
  const { connections, addConnection } = useMCPStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConn, setNewConn] = useState({
    name: "",
    url: "",
    type: "custom" as MCPConnection["type"],
    requiresKey: false,
    description: "",
  });

  const handleAdd = () => {
    if (!newConn.name || !newConn.url) return;
    addConnection({
      name: newConn.name,
      url: newConn.url,
      type: newConn.type,
      requiresKey: newConn.requiresKey,
      description: newConn.description || `Custom ${newConn.type} connector`,
    });
    setNewConn({ name: "", url: "", type: "custom", requiresKey: false, description: "" });
    setShowAddForm(false);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Connections</h1>
            <p className="text-muted-foreground mt-1">
              Preview and test MCP connector settings for a future live-data integration.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Connector
          </Button>
        </div>

        {/* Add Connector Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Custom MCP Connector</CardTitle>
              <CardDescription>
                Enter the URL of any MCP-compatible server. Optionally provide an API key if required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="conn-name">Connector Name</Label>
                  <Input
                    id="conn-name"
                    placeholder="e.g., AirROI, SerpApi"
                    value={newConn.name}
                    onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conn-url">MCP URL</Label>
                  <Input
                    id="conn-url"
                    placeholder="https://mcp.example.com/mcp"
                    value={newConn.url}
                    onChange={(e) => setNewConn({ ...newConn, url: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conn-type">Type</Label>
                  <select
                    id="conn-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newConn.type}
                    onChange={(e) =>
                      setNewConn({ ...newConn, type: e.target.value as MCPConnection["type"] })
                    }
                  >
                    <option value="rentals">Rentals</option>
                    <option value="hotels">Hotels</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conn-desc">Description (optional)</Label>
                  <Input
                    id="conn-desc"
                    placeholder="What does this connector provide?"
                    value={newConn.description}
                    onChange={(e) => setNewConn({ ...newConn, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Add Connector</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Keys Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">API Key Information</p>
                <p className="text-muted-foreground">
                  The default OpenBnB and Gondola entries do not include API keys. Availability
                  depends on the configured server endpoint.
                </p>
                <p className="text-muted-foreground mt-1">
                  <strong>Optional Paid Upgrades:</strong> AirROI (demand data), SerpApi or
                  Makcorps (hotel cross-site pricing). Get API keys from their respective websites.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Connectors List */}
        <div className="grid gap-4">
          {connections.map((conn) => (
            <ConnectorCard key={conn.id} connection={conn} />
          ))}
        </div>

        {connections.length === 0 && (
          <div className="text-center py-12">
            <Plug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Connectors Configured</h3>
            <p className="text-muted-foreground mt-1">
              Add the default OpenBnB and Gondola connectors to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
