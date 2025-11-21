# Database Package

This package manages database schema migrations and seed data for Roll With It.

## Architecture

We use **JSON as the source of truth** for seed data, which is then **generated into SQL** for Supabase:

```
packages/database/
├── seed/srd/           # JSON seed data (SOURCE OF TRUTH)
│   ├── rulesets.json
│   ├── sources.json
│   ├── races.json
│   ├── classes.json
│   └── items.json
├── scripts/
│   └── generate-seed.ts  # Converts JSON → SQL
└── schema.sql

supabase/
├── migrations/
│   └── *.sql            # Database migrations
└── seed.sql            # GENERATED (do not edit manually!)
```

## Why This Approach?

✅ **JSON is easier to maintain** - No SQL syntax, just data
✅ **Type-safe** - Can add TypeScript validation
✅ **Single source of truth** - Edit in one place
✅ **Supabase CLI compatible** - Generated SQL works with `supabase db reset`
✅ **Version control friendly** - Clean diffs in JSON

## Workflow

### 1. Edit Seed Data

Edit the JSON files in `packages/database/seed/srd/`:

```json
// packages/database/seed/srd/items.json
[
  {
    "name": "Longsword",
    "type": "weapon",
    "subtype": "martial melee",
    "damage": { "dice": "1d8", "type": "slashing" },
    "weight": 3,
    "cost": { "amount": 15, "currency": "gp" }
  }
]
```

### 2. Generate SQL

Run the generation script:

```bash
pnpm --filter database generate-seed
```

This reads all JSON files and generates `supabase/seed.sql`.

### 3. Reset Database

Apply the generated seed data:

```bash
supabase db reset
```

This runs migrations and seeds the database with your data.

## Available Scripts

```bash
# Generate seed.sql from JSON files
pnpm --filter database generate-seed

# Reset database (runs migrations + seeds)
pnpm --filter database reset

# Run migrations only
pnpm --filter database migrate

# Generate TypeScript types from schema
pnpm --filter database generate-types
```

## Complete Workflow Example

```bash
# 1. Edit items.json to add a new weapon
vim packages/database/seed/srd/items.json

# 2. Generate SQL
pnpm --filter database generate-seed

# 3. Reset database
supabase db reset

# ✅ New item is now in the database!
```

## Seed Data Files

### `rulesets.json`
Contains RPG system definitions (D&D 5e, Pathfinder, etc.)

### `sources.json`
Official sourcebooks (PHB, Xanathar's, etc.)

### `races.json`
Character races with traits, ability score increases, languages

### `classes.json`
Character classes with hit dice, proficiencies, features

### `items.json`
Equipment, weapons, armor, gear, and magic items

## Adding New Seed Data

1. Create/edit the appropriate JSON file in `seed/srd/`
2. Run `pnpm --filter database generate-seed`
3. Run `supabase db reset` to apply
4. Commit both the JSON and generated SQL

## Important Notes

- **Never edit `supabase/seed.sql` directly!** It will be overwritten
- Always edit JSON files in `packages/database/seed/srd/`
- The generation script validates data types and escapes SQL properly
- Generated SQL includes a warning header not to edit manually

## Schema Changes

For schema changes, create a new migration:

```bash
supabase migration new your_migration_name
```

Edit the migration file in `supabase/migrations/`, then:

```bash
supabase db reset
```
