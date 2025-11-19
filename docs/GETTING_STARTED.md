# Getting Started with Roll With It

This guide will help you get the Roll With It application up and running.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher
- **Supabase Account**: Create one at [supabase.com](https://supabase.com)
- **For iOS Development**: macOS with Xcode 15+

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd roll-with-it

# Install dependencies
pnpm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be ready

#### Get Your Credentials

From your Supabase project dashboard:
1. Go to Settings > API
2. Copy your "Project URL"
3. Copy your "anon/public" API key

#### Apply Database Schema

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push --db-url "your-database-url"
```

Or manually:
1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `packages/database/schema.sql`
3. Run the SQL

### 3. Configure Environment Variables

#### Web App

```bash
# Create environment file
cd packages/web
cp .env.example .env.local

# Edit .env.local with your credentials
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### iOS App

Add to `ios/RollWithIt/Info.plist`:

```xml
<key>SUPABASE_URL</key>
<string>your-project-url</string>
<key>SUPABASE_ANON_KEY</key>
<string>your-anon-key</string>
```

### 4. Seed the Database

```bash
# Run seed script (coming soon)
cd packages/database
pnpm seed
```

Or manually import:
1. Go to Table Editor in Supabase
2. Import JSON files from `packages/database/seed/srd/`

### 5. Run the Applications

#### Web App

```bash
# From root directory
pnpm dev:web

# Or from web package
cd packages/web
pnpm dev
```

Visit http://localhost:5173

#### iOS App

1. Open `ios/RollWithIt.xcodeproj` in Xcode
2. Select a simulator or device
3. Press Cmd+R to build and run

## Project Structure

```
roll-with-it/
├── packages/
│   ├── web/              # React web app
│   ├── shared/           # Shared types and utilities
│   └── database/         # Database schema and seeds
├── ios/                  # Native iOS app
└── docs/                 # Documentation
```

## Development Workflow

### Making Changes

1. **Shared Types**: Edit `packages/shared/src/types/`
2. **Database**: Create migrations in `packages/database/migrations/`
3. **Web**: Develop in `packages/web/src/`
4. **iOS**: Develop in `ios/RollWithIt/`

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter web build
```

### Testing

```bash
# Run tests (when implemented)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Common Tasks

### Adding Content

#### 1. Via Web Interface

Use the Content Library page to add:
- Races
- Classes
- Spells
- Items
- etc.

#### 2. Via Import

Prepare JSON/CSV files and use the import feature (coming soon).

#### 3. Via SQL

```sql
-- Example: Add a new race
INSERT INTO races (source_id, name, description, size, speed, is_homebrew)
VALUES (
  'source-uuid',
  'Dragonborn',
  'Your draconic heritage is unmistakable...',
  'Medium',
  30,
  false
);
```

### Creating a Character

1. Sign in to the app
2. Navigate to Characters
3. Click "Create Character"
4. Select a ruleset (this filters available content)
5. Choose race, class, etc.
6. Fill in details
7. Save

### Running a Campaign

1. Create a campaign
2. Set the ruleset
3. Invite players (via email or share link)
4. Add characters to the campaign
5. Start playing

### Filtering by Ruleset

All content is automatically filtered by the selected ruleset:
- Characters only see content from their ruleset
- Campaigns limit content based on campaign ruleset
- Content library can be filtered manually

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
supabase db ping

# Check your credentials in .env files
```

### Build Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules
pnpm install

# Clear build cache
pnpm clean
pnpm build
```

### Type Errors

```bash
# Rebuild shared package
cd packages/shared
pnpm build

# Check types
pnpm type-check
```

## Next Steps

- [Architecture Documentation](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [iOS Setup Guide](./IOS_SETUP.md)
- [Contributing Guide](../CONTRIBUTING.md) (coming soon)

## Getting Help

- Check existing documentation
- Review code examples
- Open an issue on GitHub
- Join our Discord (coming soon)

## Learn More

### D&D Resources

- [D&D Beyond](https://www.dndbeyond.com)
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)

### Tech Stack

- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
