/**
 * MCP (Model Context Protocol) Client
 * 
 * This client connects to MCP servers to fetch rental and hotel data.
 * MCP is a protocol that allows AI agents to interact with external tools and data sources.
 * 
 * Supported connectors:
 * - OpenBnB: Free Airbnb-style rental data (no key required)
 * - Gondola: Free hotel data & price comparison (no key required)
 * - Custom: Any MCP-compatible server
 */

import type { MCPConnection, MCPResponse, MCPTool } from "@/types";

export class MCPClient {
  private connection: MCPConnection;
  private baseUrl: string;

  constructor(connection: MCPConnection) {
    this.connection = connection;
    this.baseUrl = connection.url;
  }

  /**
   * Test the connection to the MCP server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List available tools from the MCP server
   */
  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tools`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.tools || [];
    } catch {
      return [];
    }
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/call`, {
        method: "POST",
        headers: {
          ...this.getHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: toolName,
          args,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.result || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "User-Agent": "BeatBooker/1.0",
    };
    if (this.connection.apiKey) {
      headers["Authorization"] = `Bearer ${this.connection.apiKey}`;
    }
    return headers;
  }
}

/**
 * Create an MCP client from a connection object
 */
export function createMCPClient(connection: MCPConnection): MCPClient {
  return new MCPClient(connection);
}
