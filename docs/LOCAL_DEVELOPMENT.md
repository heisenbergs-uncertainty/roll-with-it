# Local Development Guide

This guide will help you set up Roll With It for local development using the Supabase CLI.

## Prerequisites

- Node.js 18.0.0+
- pnpm 8.0.0+
- Docker Desktop (required for Supabase CLI)
- Supabase CLI

## Quick Start

### 1. Install Dependencies

```bash
# Install project dependencies
pnpm install
```

### 2. Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

Or download from [Supabase CLI releases](https://github.com/supabase/cli/releases)

### 3. Start Supabase

```bash
# Start local Supabase instance
pnpm db:start

# Or use the supabase CLI directly
supabase start
```

This will:
- Start PostgreSQL database
- Start Supabase Studio (database UI)
- Apply migrations from `supabase/migrations/`
- Run seed data from `supabase/seed.sql`
- Start Auth, Storage, and other services

**Important URLs after startup:**
- API URL: http://127.0.0.1:54321
- Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio URL: http://127.0.0.1:54323
- Mailpit URL: http://127.0.0.1:54324 (email testing)

### 4. Configure Environment

The local environment is already configured in `packages/web/.env.local`:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

This is the **default local development key** - it's safe to commit.

### 5. Start the Web App

```bash
# Start the development server
pnpm dev:web
```

Visit http://localhost:5173 to see your app.

## Database Management

### View Database in Studio

```bash
# Open Supabase Studio
pnpm db:studio

# Or visit directly
open http://127.0.0.1:54323
```

Studio provides a UI for:
- Browsing tables
- Running SQL queries
- Managing authentication
- Viewing logs

### Check Supabase Status

```bash
pnpm db:status
```

This shows all running services and their URLs.

### Reset Database

```bash
# Reset database to initial state (runs migrations + seed)
pnpm db:reset
```

**Warning:** This will delete all data!

### Stop Supabase

```bash
# Stop all services
pnpm db:stop

# Stop and remove volumes (complete cleanup)
supabase stop --no-backup
```

## Database Migrations

### Creating a Migration

```bash
# Create a new migration file
supabase migration new your_migration_name

# This creates: supabase/migrations/TIMESTAMP_your_migration_name.sql
```

Example migration:
```sql
-- supabase/migrations/20241118120000_add_spell_components.sql

ALTER TABLE spells ADD COLUMN material_component TEXT;
```

### Applying Migrations

Migrations are automatically applied when you run:
```bash
supabase start  # or pnpm db:start
```

To manually apply new migrations:
```bash
supabase db reset  # or pnpm db:reset
```

### Migration Best Practices

1. **Never edit existing migrations** - Create new ones instead
2. **Test migrations locally** before deploying
3. **Include both up and down migrations** when possible
4. **Keep migrations atomic** - one logical change per migration

## Seed Data

Seed data is in `supabase/seed.sql` and includes:
- Rulesets (D&D 5e, 5e-2024)
- Sources (SRD, PHB, XGE, TCE)
- Sample races (Human, Elf, Dwarf, Halfling)
- Sample classes (Fighter, Wizard, Cleric, Rogue)

### Adding More Seed Data

Edit `supabase/seed.sql`:

```sql
-- Add to the appropriate section
INSERT INTO spells (source_id, name, level, school, ...)
VALUES (...);
```

Then reset the database to apply:
```bash
pnpm db:reset
```

## Development Workflow

### Typical Development Session

```bash
# 1. Start Supabase
pnpm db:start

# 2. Start web app
pnpm dev:web

# 3. Make changes to code

# 4. View database in Studio (optional)
pnpm db:studio

# 5. When done, stop Supabase
pnpm db:stop
```

### Making Database Changes

```bash
# 1. Create migration
supabase migration new add_new_feature

# 2. Edit the migration file
# supabase/migrations/TIMESTAMP_add_new_feature.sql

# 3. Apply migration
pnpm db:reset

# 4. Update TypeScript types if needed
cd packages/shared
pnpm build
```

### Troubleshooting

#### Port Already in Use

If you see port conflicts:
```bash
# Stop Supabase
pnpm db:stop

# Check for running containers
docker ps

# Remove all Supabase containers
docker rm -f $(docker ps -aq --filter name=supabase)

# Start again
pnpm db:start
```

#### Database Connection Issues

```bash
# Check if Supabase is running
pnpm db:status

# Check Docker
docker ps

# Restart Supabase
pnpm db:stop
pnpm db:start
```

#### Migration Errors

```bash
# View migration history
supabase migration list

# Reset database to fresh state
pnpm db:reset

# If that fails, stop and remove everything
supabase stop --no-backup
rm -rf .supabase/
pnpm db:start
```

## Testing

### Manual Testing

1. Start local Supabase
2. Create test user in Studio (Authentication > Users)
3. Use the app to create characters, campaigns, etc.
4. Verify data in Studio

### Testing Authentication

Local Supabase includes a test email server (Mailpit):
- Visit http://127.0.0.1:54324
- Sign up in the app
- Check Mailpit for confirmation emails

## Production vs Development

### Local Development

- Uses `http://127.0.0.1:54321`
- Default anon key (safe to commit)
- Data is not persistent across resets
- Email is caught by Mailpit

### Production (Supabase Cloud)

- Uses `https://your-project.supabase.co`
- Real anon key (keep secret!)
- Data persists
- Real email delivery

To switch to production:
1. Create a Supabase project at supabase.com
2. Update `packages/web/.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-real-anon-key
   ```
3. Deploy migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

## Useful Commands Reference

```bash
# Supabase
pnpm db:start          # Start local Supabase
pnpm db:stop           # Stop local Supabase
pnpm db:reset          # Reset database (migrations + seed)
pnpm db:status         # Show service status
pnpm db:studio         # Open database UI

# Development
pnpm dev:web           # Start web app
pnpm build             # Build all packages
pnpm type-check        # Type check all packages
pnpm lint              # Lint all packages

# Migrations
supabase migration new <name>    # Create migration
supabase migration list          # List migrations
supabase db reset                # Apply migrations

# Docker
docker ps                        # List running containers
docker logs <container>          # View container logs
docker stop <container>          # Stop container
```

## Next Steps

- Read [Architecture Documentation](./ARCHITECTURE.md)
- Review [Database Schema](./DATABASE_SCHEMA.md)
- Check out [Getting Started Guide](./GETTING_STARTED.md)
- Explore the code in `packages/web/src/`

## Getting Help

- Check Supabase logs: `docker logs supabase_db`
- Visit Supabase Studio: http://127.0.0.1:54323
- Review [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
