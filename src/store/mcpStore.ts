import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MCPConnection } from "@/types";
import { generateId } from "@/lib/utils";

interface MCPState {
  connections: MCPConnection[];
  addConnection: (connection: Omit<MCPConnection, "id" | "status">) => void;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<MCPConnection>) => void;
  setConnectionStatus: (id: string, status: MCPConnection["status"]) => void;
  getConnection: (id: string) => MCPConnection | undefined;
  resetDefaults: () => void;
}

const DEFAULT_CONNECTIONS: MCPConnection[] = [
  {
    id: "openbnb",
    name: "OpenBnB",
    url: "https://mcp.openbnb.ai/mcp",
    type: "rentals",
    status: "disconnected",
    requiresKey: false,
    description: "Free Airbnb-style rental data. No API key required.",
  },
  {
    id: "gondola",
    name: "Gondola",
    url: "https://mcp.gondola.ai/mcp",
    type: "hotels",
    status: "disconnected",
    requiresKey: false,
    description: "Free hotel data and price comparison. No API key required.",
  },
];

export const useMCPStore = create<MCPState>()(
  persist(
    (set, get) => ({
      connections: DEFAULT_CONNECTIONS,

      addConnection: (connection) => {
        const newConn: MCPConnection = {
          ...connection,
          id: generateId(),
          status: "disconnected",
        };
        set((state) => ({
          connections: [...state.connections, newConn],
        }));
      },

      removeConnection: (id) => {
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        }));
      },

      updateConnection: (id, updates) => {
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      setConnectionStatus: (id, status) => {
        set((state) => ({
          connections: state.connections.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        }));
      },

      getConnection: (id) => {
        return get().connections.find((c) => c.id === id);
      },

      resetDefaults: () => {
        set({ connections: DEFAULT_CONNECTIONS });
      },
    }),
    {
      name: "beatbooker-mcp-connections",
    }
  )
);
