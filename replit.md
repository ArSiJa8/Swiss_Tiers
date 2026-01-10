# Swiss Tiers Leaderboard

## Overview

Swiss Tiers is a Minecraft PvP leaderboard application that displays player rankings across multiple game modes. The app fetches player data from an external API, caches it server-side, and presents it through a polished dark-themed gaming interface with search, filtering by game mode, and detailed player profile modals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, local useState for UI state
- **Styling**: Tailwind CSS with custom dark gaming theme, CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives with custom styling)
- **Animations**: Framer Motion for smooth list transitions and modal effects
- **Build Tool**: Vite with HMR support

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: Simple REST endpoint proxying external leaderboard data
- **Caching**: In-memory cache with 1-minute TTL to reduce external API calls

### Data Flow
1. Client requests `/api/leaderboard`
2. Server checks in-memory cache (MemStorage class)
3. If cache expired, fetches from external API at `http://134.255.227.145:25637/api/leaderboard`
4. Returns cached or fresh data as JSON array of Player objects

### Database Schema
- PostgreSQL configured via Drizzle ORM (currently unused - data comes from external API)
- Schema includes `leaderboard_cache` table for potential persistent caching
- Database migrations managed through `drizzle-kit push`

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components including LeaderboardTable, PlayerModal
│       ├── hooks/        # Custom hooks (useLeaderboard, useMobile, useToast)
│       ├── pages/        # Route components (Home, NotFound)
│       └── lib/          # Utilities and query client config
├── server/           # Express backend
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # MemStorage class with caching logic
│   └── db.ts         # Drizzle database connection
├── shared/           # Shared types and schemas
│   ├── schema.ts     # Zod schemas and Drizzle table definitions
│   └── routes.ts     # API route contracts
└── migrations/       # Database migrations (Drizzle)
```

### Key Design Decisions
- **External API Proxy**: Rather than storing player data, the app acts as a caching proxy to an external leaderboard API. This simplifies data management and ensures data freshness.
- **Type Safety**: Zod schemas in `shared/schema.ts` validate API responses and are shared between frontend and backend.
- **Component Library**: shadcn/ui provides accessible, customizable components without heavy dependencies.

## External Dependencies

### Third-Party Services
- **External Leaderboard API**: `http://134.255.227.145:25637/api/leaderboard` - Primary data source for player rankings
- **MineSkin API**: `https://mineskin.eu` - Provides Minecraft player skin renders (helm and bust images)

### Database
- **PostgreSQL**: Connected via `DATABASE_URL` environment variable, managed with Drizzle ORM

### Key NPM Packages
- `@tanstack/react-query`: Server state management and caching
- `drizzle-orm` / `drizzle-zod`: Database ORM with Zod schema integration
- `framer-motion`: Animation library for UI transitions
- `wouter`: Lightweight React router
- `zod`: Runtime type validation
- Full shadcn/ui component set (Radix UI primitives)