# Quick Start - Roll With It

Get up and running with Roll With It in 5 minutes!

## Prerequisites

Make sure you have these installed:
- **Node.js 18+**: `node --version`
- **pnpm**: `pnpm --version` (install with `npm install -g pnpm`)
- **Docker Desktop**: Running (for Supabase)
- **Supabase CLI**: `supabase --version` (install below)

## Step 1: Install Supabase CLI

**macOS/Linux:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Step 2: Install Dependencies

```bash
pnpm install
```

## Step 3: Start Supabase

```bash
pnpm db:start
```

Wait for it to finish. You should see:
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
      Studio URL: http://127.0.0.1:54323
```

**Important:** Your database is now ready with:
- ✅ Schema created (tables, indexes, RLS policies)
- ✅ Seed data loaded (rulesets, sources, races, classes)

## Step 4: Start the Web App

```bash
pnpm dev:web
```

Visit **http://localhost:5173** - you should see the Roll With It home page!

## Step 5: Explore the Database

Open Supabase Studio:
```bash
pnpm db:studio
# Or visit: http://127.0.0.1:54323
```

Browse the tables:
- **rulesets**: D&D 5e editions
- **sources**: PHB, XGE, TCE, etc.
- **races**: Human, Elf, Dwarf, Halfling
- **classes**: Fighter, Wizard, Cleric, Rogue

## What's Next?

### Create a User Account

1. Visit http://localhost:5173/login
2. Sign up with any email (it's local, no real email needed)
3. Check http://127.0.0.1:54324 (Mailpit) for the confirmation email
4. Click the confirmation link

### Explore Features

- **Characters**: Create D&D characters
- **Campaigns**: Start campaigns and invite players
- **Content Library**: Browse D&D content filtered by ruleset

### Development Tools

```bash
# Database commands
pnpm db:status    # Check if Supabase is running
pnpm db:studio    # Open database UI
pnpm db:reset     # Reset database (fresh start)
pnpm db:stop      # Stop Supabase

# Development commands
pnpm dev:web      # Start web app
pnpm build        # Build all packages
pnpm type-check   # Check TypeScript types
```

## Troubleshooting

### Supabase won't start?

```bash
# Make sure Docker is running
docker --version

# Stop and clean up
pnpm db:stop
docker ps -a  # Check for running containers

# Try again
pnpm db:start
```

### Port already in use?

```bash
# Find what's using port 54321
lsof -i :54321

# Or change ports in supabase/config.toml
```

### Web app won't start?

```bash
# Make sure Supabase is running
pnpm db:status

# Check environment variables
cat packages/web/.env.local

# Should show:
# VITE_SUPABASE_URL=http://127.0.0.1:54321
```

## Project Structure

```
roll-with-it/
├── packages/
│   ├── web/          # React web app (you're here)
│   ├── shared/       # Shared TypeScript types
│   └── database/     # Database utilities
├── supabase/
│   ├── migrations/   # Database migrations
│   └── seed.sql      # Seed data
└── docs/            # Documentation
```

## Learn More

- [Local Development Guide](./docs/LOCAL_DEVELOPMENT.md) - Detailed development setup
- [Architecture](./docs/ARCHITECTURE.md) - System architecture
- [Database Schema](./docs/DATABASE_SCHEMA.md) - Complete schema reference
- [iOS Setup](./docs/IOS_SETUP.md) - iOS app setup

## Useful URLs (when Supabase is running)

- **Web App**: http://localhost:5173
- **Database Studio**: http://127.0.0.1:54323
- **Email Testing**: http://127.0.0.1:54324
- **API**: http://127.0.0.1:54321

## Need Help?

1. Check the [troubleshooting section](#troubleshooting) above
2. Review the [Local Development Guide](./docs/LOCAL_DEVELOPMENT.md)
3. Check [Supabase CLI docs](https://supabase.com/docs/guides/cli)

Happy coding! 🎲⚔️
