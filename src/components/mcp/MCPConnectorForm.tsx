"use client";

import { useState } from "react";
import React from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMCPStore } from "@/store/mcpStore";
import type { MCPConnection } from "@/types";

export function MCPConnectorForm() {
  const { addConnection } = useMCPStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    type: "custom" as MCPConnection["type"],
    requiresKey: false,
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    addConnection({
      name: formData.name,
      url: formData.url,
      type: formData.type,
      requiresKey: formData.requiresKey,
      description: formData.description || `Custom ${formData.type} connector`,
    });

    setFormData({
      name: "",
      url: "",
      type: "custom",
      requiresKey: false,
      description: "",
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Connector
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Custom MCP Connector</CardTitle>
        <CardDescription>
          Enter the URL of any MCP-compatible server. Optionally provide an API key if required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="conn-name">Connector Name</Label>
            <Input
              id="conn-name"
              placeholder="e.g., AirROI, SerpApi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="conn-url">MCP URL</Label>
            <Input
              id="conn-url"
              placeholder="https://mcp.example.com/mcp"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="conn-type">Type</Label>
            <select
              id="conn-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as MCPConnection["type"] })
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Connector</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
