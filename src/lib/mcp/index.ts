/**
 * MCP Connectors Index
 * 
 * Central export point for all MCP data connectors.
 * To add a new connector:
 * 1. Create a new file in this directory (e.g., airroi.ts)
 * 2. Export the functions from this index
 * 3. Add the connector to the MCP store defaults
 */

export { MCPClient, createMCPClient } from "./client";
export { searchRentals, getNeighborhoods } from "./openbnb";
export { searchHotels, compareHotelPrices } from "./gondola";

// Future connectors can be added here:
// export { getDemandData } from "./airroi";
// export { searchFlights } from "./flights-connector";
// export { getCarRentals } from "./rental-cars";
