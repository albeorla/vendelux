# Event Discovery - Vendelux Coding Challenge

A personalized event discovery app that asks users questions about their preferences and searches for relevant events using the Ticketmaster API.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
# Ticketmaster Discovery API (optional - uses mock data if not set)
TICKETMASTER_API_KEY=your_api_key_here
```

> **Note**: The app works without an API key using built-in mock data.

## Features

### Required Features (from challenge)

1. **Question Flow** - 5 configurable questions about event preferences
2. **Ticketmaster API Search** - Reverse proxy at `/api/events`
3. **Results Table** - Desktop table view + mobile card grid
4. **Question Flexibility** - Questions defined in `src/config/questions.json`
5. **Persistence** - Answers saved to localStorage
6. **Result Transparency** - Click any relevance score to see breakdown
7. **Result Filtering** - Filter by category, date, and price
8. **Error Handling** - Graceful fallback to mock data

### Tech Stack

- **Next.js 16** with App Router
- **React 19** + TypeScript
- **Tailwind CSS 4**
- **Jest** + React Testing Library

## Project Structure

```
src/
├── app/
│   ├── api/events/route.ts    # Ticketmaster proxy endpoint
│   ├── results/page.tsx       # Results page
│   └── page.tsx               # Home (questionnaire)
├── components/
│   ├── questions/             # Question flow components
│   └── results/               # Results display components
├── config/questions.json      # Question configuration
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities & API client
└── __tests__/                 # Test suites
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

## Assumptions & Shortcuts

These simplifications were made for the prototype:

1. **Location Input** - Uses predefined popular cities instead of a geocoding API. Production would use Google Places or similar.

2. **localStorage Persistence** - Simple `useState` + `useEffect` pattern. Production would use `useSyncExternalStore` for concurrent rendering safety.

3. **Relevance Scoring** - Basic algorithm with placeholder scores for distance/popularity. Production would use actual distance calculations and API popularity data.

4. **No Authentication** - All data is client-side. No user accounts.

5. **Limited Test Coverage** - Core functionality tested. Production would have more comprehensive E2E tests.

## What I'd Do Differently in Production

- **Geocoding API** for location autocomplete and coordinate lookup
- **Server-side state** with user accounts and saved searches
- **Rate limiting** on the API proxy
- **Caching layer** (Redis) for Ticketmaster responses
- **Error tracking** (Sentry) for monitoring
- **Analytics** to understand user behavior
- **A/B testing** framework for question flow optimization
- **Comprehensive E2E tests** with Playwright

## API Reference

### `GET /api/events`

Searches for events based on user preferences.

**Query Parameters:**
- `classificationId` - Ticketmaster category ID(s)
- `geoPoint` - Latitude,longitude
- `radius` - Search radius in miles
- `startDateTime` / `endDateTime` - Date range (ISO 8601)
- `preferences` - JSON-encoded user answers (for relevance calculation)

**Response:**
```json
{
  "events": [...],
  "source": "api" | "cache"
}
```

---

Built with Next.js, React, and TypeScript for the Vendelux coding challenge.
