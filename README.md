# BeatBooker 🎵

**Beat the Booking Sites with AI** — A polished travel-comparison demo for exploring
short-term rental and hotel analysis.

> BeatBooker currently generates sample listing data locally. This makes the full
> search, ranking, history, and export workflow usable without external accounts.
> The Connections screen is a configuration preview and connection tester; those
> connectors are not yet queried by the analysis route.

## Features

- **Rentals Analysis** — Compare sample rental prices for the requested stay
- **Hotel Price Comparison** — Compare sample prices across eight booking platforms
- **The Pick** — AI-powered ranking of the best organic listings vs sponsored results
- **Export** — Save trip plans as JSON or Markdown
- **Dark/Light Mode** — Beautiful, responsive UI with theme toggle
- **No API Keys Required** — The demo analysis works entirely out of the box

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Lucide icons
- **State Management:** Zustand with localStorage persistence
- **Data Integration Preview:** Configurable MCP connection definitions and health checks
- **Export:** JSON / Markdown file generation

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd BeatBooker

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

No API keys are required for demo analysis. Optional connector variables are
documented in `.env.example`.

## Connecting Data Sources

### Connector Preview

1. Navigate to **Connections** page
2. The default OpenBnB and Gondola connector definitions are pre-configured
3. Click "Test Connection" to check whether an endpoint is reachable

Connector status does not affect the current sample-data analysis.

### Custom MCP Connectors

You can add any MCP-compatible server:

1. Click "Add Connector" on the Connections page
2. Enter the MCP server URL
3. Optionally provide an API key if required
4. Test the connection

### Optional Paid Upgrades

| Service | Purpose | API Key Needed |
|---------|---------|---------------|
| OpenBnB | Rental data (Airbnb-style) | No |
| Gondola | Hotel price comparison | No |
| AirROI | Demand data for rentals | Yes (airroi.com) |
| SerpApi | Better hotel cross-site pricing | Yes (serpapi.com) |
| Makcorps | Hotel price comparison API | Yes (makcorps.com) |

## Project Structure

```
BeatBooker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page
│   │   ├── layout.tsx          # Root layout
│   │   ├── connections/        # MCP setup page
│   │   ├── trip/new/           # New trip form
│   │   ├── trip/[id]/          # Trip results (tabs)
│   │   ├── history/            # Saved trips
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Footer, ThemeToggle
│   │   ├── trip/               # TripForm, RentalsTab, HotelsTab, ThePickTab
│   │   └── mcp/                # MCP connector components
│   ├── lib/
│   │   ├── mcp/                # MCP protocol client
│   │   └── export/             # JSON/Markdown export
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript interfaces
├── .env.example
└── README.md
```

## Extending with More MCP Sources

To add a new MCP data source:

1. **Create a connector module** in `src/lib/mcp/` (see `openbnb.ts` and `gondola.ts` for examples)
2. **Register the connector** in `src/lib/mcp/index.ts`
3. **Add the default connection** in `src/store/mcpStore.ts`
4. **Update the analyze API route** in `src/app/api/analyze/route.ts` to query the new source

The MCP client in `src/lib/mcp/client.ts` handles the protocol communication. Each connector just needs to define:
- The MCP server URL
- The tools it exposes (e.g., `search_listings`, `compare_prices`)
- How to parse the response into the app's data types

## How "The Pick" Works

The Pick algorithm ranks listings by a value score:

```
score = (reviewScore / pricePerNight) * 100
```

This ensures the best combination of quality and affordability. The top 3 organic picks are compared against typical sponsored listings to show potential savings.

## License

MIT

---

Built to beat Booking.com & Airbnb fees.
