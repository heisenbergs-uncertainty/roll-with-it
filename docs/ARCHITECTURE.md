# Roll With It - Architecture Documentation

## Overview

Roll With It is a multi-platform D&D management application designed to aggregate D&D content from various sources and provide ruleset-specific filtering for characters and campaigns.

## Tech Stack

### Backend

- **Supabase**: Serverless PostgreSQL database with built-in Auth, Storage,
  and Real-time subscriptions
- **PostgreSQL**: Relational database for structured D&D content
- **Row Level Security (RLS)**: Fine-grained access control

### Web Application

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **React Query**: Server state management
- **Zustand**: Client state management
- **TailwindCSS**: Styling
- **Supabase JS Client**: Database and auth client

### iOS Application

- **Swift 5.9+**: Programming language
- **SwiftUI**: Declarative UI framework
- **Supabase Swift Client**: Database and auth client
- **Combine**: Reactive programming

### Shared Layer

- **TypeScript**: Type definitions and validation schemas
- **Zod**: Runtime validation
- **Type generation**: Auto-generate Swift types from TypeScript

## Project Structure

```
roll-with-it/
├── packages/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API services
│   │   │   ├── store/          # State management
│   │   │   └── lib/            # Utilities
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── shared/                 # Shared code
│   │   ├── src/
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   ├── schemas/        # Zod validation schemas
│   │   │   ├── constants/      # Constants and enums
│   │   │   └── utils/          # Shared utilities
│   │   └── package.json
│   │
│   └── database/               # Database layer
│       ├── migrations/         # SQL migrations
│       ├── seed/               # Seed data
│       │   ├── srd/            # D&D SRD content
│       │   └── scripts/        # Seeding scripts
│       ├── functions/          # PostgreSQL functions
│       └── schema.sql          # Complete schema
│
├── ios/                        # iOS application
│   ├── RollWithIt/
│   │   ├── Models/             # Data models
│   │   ├── Views/              # SwiftUI views
│   │   ├── ViewModels/         # View models
│   │   ├── Services/           # API services
│   │   └── Utilities/          # Utilities
│   └── RollWithIt.xcodeproj
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── API.md
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # PNPM workspace config
└── README.md
```

## Core Concepts

### 1. Rulesets

Rulesets represent different editions/versions of D&D (or other systems):

- D&D 5th Edition
- D&D 4th Edition
- Pathfinder 2e
- Custom/Homebrew rulesets

### 2. Sources

Sources are the books/supplements that content comes from:

- Player's Handbook (PHB)
- Xanathar's Guide to Everything (XGE)
- Tasha's Cauldron of Everything (TCE)
- Etc.

Each source is linked to a specific ruleset.

### 3. Content

All D&D materials (races, classes, spells, items, etc.) are:

- Linked to a source
- Automatically associated with the source's ruleset
- Tagged as official or homebrew
- Filterable by ruleset

### 4. Characters & Campaigns

Both are linked to a specific ruleset, which automatically filters:

- Available races, classes, spells
- Available items and equipment
- Applicable rules and tables
- Available abilities and features

## Data Flow

### Web Application

```
User Action → React Component → React Query → Supabase Client → PostgreSQL
                                      ↓
                              Zustand Store (local state)
```

### iOS Application

```
User Action → SwiftUI View → ViewModel → Supabase Client → PostgreSQL
                                  ↓
                           @Published properties (Combine)
```

## Key Features

### 1. Ruleset Filtering

- All content queries filtered by ruleset
- Characters/Campaigns locked to a ruleset
- Cross-ruleset content management

### 2. Content Management

- Import content from JSON/CSV
- Manual content creation (homebrew)
- Pre-seeded SRD content
- Version control for content updates

### 3. Multi-user Support

- User authentication (Supabase Auth)
- Private characters and campaigns
- Shared campaigns (DM + players)
- Public content library

### 4. Real-time Sync

- Campaign updates in real-time
- Character sheet changes sync across devices
- Collaborative features for shared campaigns

## Security

### Row Level Security (RLS)

All tables implement RLS policies:

- Users can only access their own data
- Campaign members can access shared campaign data
- Public content is readable by all
- Only content owners can modify their content

## Scalability

- **Serverless architecture**: Scales automatically with Supabase
- **CDN**: Static assets served via CDN
- **Indexing**: Proper database indexes for common queries
- **Caching**: React Query for web, in-memory cache for iOS

## Future Enhancements

- [ ] Dice rolling system
- [ ] Battle map integration
- [ ] Character progression tracking
- [ ] Session notes and logging
- [ ] PDF character sheet export
- [ ] Integration with VTT platforms
- [ ] AI-powered content generation
- [ ] Mobile Android app (React Native)
