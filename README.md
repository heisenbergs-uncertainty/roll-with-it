# Roll With It

A comprehensive multi-platform D&D management application for creating and managing campaigns, characters, and game content across different rulesets.

## Features

- **Multi-Ruleset Support**: Manage content for D&D 5e, 4e, and custom rulesets
- **Content Aggregation**: Centralized database of races, classes, spells, items, and more
- **Source Tracking**: All content linked to source books (PHB, Xanathar's, Tasha's, etc.)
- **Character Management**: Create and manage characters with ruleset-specific content
- **Campaign Management**: Run campaigns with shared access for DMs and players
- **Homebrew Support**: Create and manage custom content alongside official materials
- **Multi-Platform**: React web app and native iOS app with real-time sync

## Tech Stack

- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Web**: React + TypeScript + Vite + TailwindCSS
- **iOS**: Swift + SwiftUI
- **Shared**: TypeScript types with auto-generated Swift types

## Project Structure

```
roll-with-it/
├── packages/
│   ├── web/          # React web application
│   ├── shared/       # Shared types and utilities
│   └── database/     # Database schemas and migrations
├── ios/              # Native iOS app
└── docs/             # Documentation
```

## Prerequisites

- Node.js 18+
- pnpm 8+
- Docker Desktop (for local Supabase)
- Supabase CLI (install: `brew install supabase/tap/supabase`)
- Xcode 15+ (optional, for iOS development)

## Getting Started

### 🚀 Quick Start (Recommended for Local Development)

See **[QUICKSTART.md](./QUICKSTART.md)** for the fastest way to get running locally with Supabase.

**TL;DR:**
```bash
# 1. Install dependencies
pnpm install

# 2. Start local Supabase (requires Docker)
pnpm db:start

# 3. Start web app
pnpm dev:web

# Visit http://localhost:5173
```

### 📘 Detailed Setup Guides

- **[Local Development Guide](./docs/LOCAL_DEVELOPMENT.md)** - Complete local development setup with Supabase CLI
- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - General setup and deployment
- **[iOS Setup Guide](./docs/IOS_SETUP.md)** - Setting up the native iOS app

### ☁️ Production Deployment (Supabase Cloud)

For deploying to Supabase Cloud:

1. Create a Supabase project at https://supabase.com
2. Update `packages/web/.env.local` with your project credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Deploy migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

## Development

### Web App

```bash
# Start dev server
pnpm dev:web

# Build for production
pnpm build:web

# Preview production build
pnpm preview:web
```

### iOS App

1. Open `ios/RollWithIt.xcodeproj` in Xcode
2. Configure Supabase credentials in the app
3. Build and run on simulator or device

### Shared Package

The shared package contains TypeScript types and utilities used by both web and iOS (via code generation).

```bash
cd packages/shared
pnpm build
```

## Database

### Local Database

The project is configured for local development with Supabase CLI:

```bash
pnpm db:start      # Start local Supabase
pnpm db:stop       # Stop local Supabase
pnpm db:reset      # Reset database (apply migrations + seed)
pnpm db:studio     # Open database UI
pnpm db:status     # Check status
```

See [Database Schema Documentation](./docs/DATABASE_SCHEMA.md) for detailed schema information.

### Migrations

Migrations are in `supabase/migrations/`. Create a new migration:

```bash
supabase migration new migration_name
```

### Seed Data

Seed data is automatically loaded from `supabase/seed.sql` when you run `pnpm db:start` or `pnpm db:reset`.

Includes:
- D&D 5e rulesets
- Official sources (SRD, PHB, XGE, TCE)
- Sample races and classes

## Documentation

- **[Quick Start](./QUICKSTART.md)** - Get running in 5 minutes
- **[Local Development](./docs/LOCAL_DEVELOPMENT.md)** - Complete local development guide
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and design
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database structure and relationships
- **[Getting Started](./docs/GETTING_STARTED.md)** - General setup guide
- **[iOS Setup](./docs/IOS_SETUP.md)** - iOS app setup and development

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT
