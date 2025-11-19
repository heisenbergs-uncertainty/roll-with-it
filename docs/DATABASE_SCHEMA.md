# Database Schema

## Overview

This document describes the PostgreSQL database schema for Roll With It. The schema is designed to support multiple D&D rulesets with proper filtering and relationships.

## Core Principles

1. **Ruleset-Centric**: All content is linked to a ruleset
2. **Source Tracking**: All content references its source material
3. **Homebrew Support**: Official and homebrew content coexist
4. **Multi-tenancy**: Users own their private data
5. **Sharing**: Campaigns can be shared between users

## Entity Relationship Diagram

```
Users (Supabase Auth)
  ↓
  ├─→ Rulesets (owns custom rulesets)
  ├─→ Sources (owns homebrew sources)
  ├─→ Characters
  ├─→ Campaigns
  └─→ Content (homebrew)

Rulesets
  ↓
  └─→ Sources
       ↓
       └─→ Content (Races, Classes, Spells, Items, etc.)

Characters ←→ Campaigns (many-to-many)
```

## Tables

### 1. Core System Tables

#### `rulesets`
Represents game systems/editions (5e, 4e, Pathfinder, etc.)

```sql
CREATE TABLE rulesets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL UNIQUE, -- e.g., "5e", "4e"
  description TEXT,
  version TEXT, -- e.g., "2024", "2014"
  is_official BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `sources`
Source books and supplements

```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_id UUID REFERENCES rulesets(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Player's Handbook"
  abbreviation TEXT NOT NULL, -- e.g., "PHB"
  description TEXT,
  publication_year INTEGER,
  is_official BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ruleset_id, abbreviation)
);
```

### 2. Content Tables

#### `races`
Character races (Elf, Dwarf, Human, etc.)

```sql
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  size TEXT, -- Small, Medium, Large
  speed INTEGER, -- Base walking speed
  ability_score_increases JSONB, -- {str: 2, dex: 1}
  traits JSONB, -- Array of racial traits
  languages JSONB, -- Array of languages
  subraces JSONB, -- Array of subrace options
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `classes`
Character classes (Fighter, Wizard, Rogue, etc.)

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  hit_die INTEGER, -- d6, d8, d10, d12
  primary_ability TEXT, -- STR, DEX, INT, etc.
  saving_throw_proficiencies JSONB, -- [STR, CON]
  armor_proficiencies JSONB,
  weapon_proficiencies JSONB,
  tool_proficiencies JSONB,
  skill_choices JSONB, -- Available skills and number to choose
  starting_equipment JSONB,
  spellcasting JSONB, -- Spellcasting details if applicable
  class_features JSONB, -- Features gained at each level
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `subclasses`
Subclasses/Archetypes

```sql
CREATE TABLE subclasses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  level_available INTEGER, -- Level at which you can choose this
  features JSONB, -- Features gained at each level
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `spells`
Spells for spellcasting classes

```sql
CREATE TABLE spells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER CHECK (level >= 0 AND level <= 9), -- 0 for cantrips
  school TEXT, -- Evocation, Abjuration, etc.
  casting_time TEXT,
  range TEXT,
  components JSONB, -- {verbal: true, somatic: true, material: "a feather"}
  duration TEXT,
  concentration BOOLEAN DEFAULT false,
  ritual BOOLEAN DEFAULT false,
  description TEXT,
  higher_levels TEXT, -- Effect when cast at higher levels
  classes JSONB, -- Array of class IDs that can learn this
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `items`
Equipment, weapons, armor, magic items

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- weapon, armor, potion, wondrous, etc.
  subtype TEXT, -- longsword, plate, etc.
  rarity TEXT, -- common, uncommon, rare, very rare, legendary, artifact
  requires_attunement BOOLEAN DEFAULT false,
  description TEXT,
  properties JSONB, -- Weapon/armor properties
  damage JSONB, -- {dice: "1d8", type: "slashing"}
  armor_class INTEGER, -- For armor
  weight DECIMAL,
  cost JSONB, -- {amount: 50, currency: "gp"}
  magical BOOLEAN DEFAULT false,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `abilities`
Feats, racial abilities, class features

```sql
CREATE TABLE abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- feat, racial_trait, class_feature, background_feature
  description TEXT,
  prerequisites JSONB, -- {level: 4, ability: {str: 13}}
  benefits JSONB, -- Mechanical benefits
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `backgrounds`
Character backgrounds

```sql
CREATE TABLE backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  skill_proficiencies JSONB,
  tool_proficiencies JSONB,
  languages INTEGER, -- Number of additional languages
  equipment JSONB,
  feature JSONB, -- Background feature
  suggested_characteristics JSONB,
  is_homebrew BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Character & Campaign Tables

#### `characters`
Player characters

```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ruleset_id UUID REFERENCES rulesets(id),
  name TEXT NOT NULL,
  race_id UUID REFERENCES races(id),
  class_id UUID REFERENCES classes(id),
  subclass_id UUID REFERENCES subclasses(id),
  background_id UUID REFERENCES backgrounds(id),
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,

  -- Ability Scores
  ability_scores JSONB, -- {str: 16, dex: 14, con: 13, int: 12, wis: 10, cha: 8}

  -- Core Stats
  hit_points_max INTEGER,
  hit_points_current INTEGER,
  temporary_hit_points INTEGER DEFAULT 0,
  armor_class INTEGER,
  initiative_bonus INTEGER,
  speed INTEGER,

  -- Proficiencies & Skills
  proficiency_bonus INTEGER,
  saving_throws JSONB,
  skills JSONB,

  -- Combat
  attacks JSONB, -- Array of attacks

  -- Spellcasting
  spell_slots JSONB, -- Current and max spell slots by level
  spells_known JSONB, -- Array of spell IDs
  spells_prepared JSONB, -- Array of spell IDs

  -- Inventory
  inventory JSONB, -- Array of {item_id, quantity, equipped, attuned}
  currency JSONB, -- {cp: 0, sp: 0, gp: 100, pp: 0}

  -- Features & Traits
  features JSONB, -- Array of ability IDs and custom features
  personality_traits TEXT,
  ideals TEXT,
  bonds TEXT,
  flaws TEXT,

  -- Appearance & Backstory
  appearance TEXT,
  backstory TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `campaigns`
D&D campaigns

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- DM
  ruleset_id UUID REFERENCES rulesets(id),
  name TEXT NOT NULL,
  description TEXT,
  setting TEXT,
  status TEXT DEFAULT 'planning', -- planning, active, on_hold, completed
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `campaign_characters`
Many-to-many relationship between campaigns and characters

```sql
CREATE TABLE campaign_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player', -- player, dm_pc, npc
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, character_id)
);
```

#### `campaign_members`
Campaign access control (DM + players)

```sql
CREATE TABLE campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player', -- dm, player
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);
```

### 4. Additional Tables

#### `sessions`
Campaign session logs

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  session_number INTEGER,
  session_date DATE,
  title TEXT,
  summary TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Indexes

```sql
-- Ruleset and Source lookups
CREATE INDEX idx_sources_ruleset ON sources(ruleset_id);

-- Content lookups by source
CREATE INDEX idx_races_source ON races(source_id);
CREATE INDEX idx_classes_source ON classes(source_id);
CREATE INDEX idx_subclasses_source ON subclasses(source_id);
CREATE INDEX idx_spells_source ON spells(source_id);
CREATE INDEX idx_items_source ON items(source_id);
CREATE INDEX idx_abilities_source ON abilities(source_id);
CREATE INDEX idx_backgrounds_source ON backgrounds(source_id);

-- Character lookups
CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_ruleset ON characters(ruleset_id);

-- Campaign lookups
CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_ruleset ON campaigns(ruleset_id);
CREATE INDEX idx_campaign_characters_campaign ON campaign_characters(campaign_id);
CREATE INDEX idx_campaign_characters_character ON campaign_characters(character_id);
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);

-- Content search
CREATE INDEX idx_spells_level ON spells(level);
CREATE INDEX idx_spells_school ON spells(school);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);
```

## Row Level Security Policies

All tables will implement RLS policies to ensure:
- Users can only modify their own data
- Campaign members can view shared campaign data
- Official content is readable by all
- Homebrew content is private unless shared
