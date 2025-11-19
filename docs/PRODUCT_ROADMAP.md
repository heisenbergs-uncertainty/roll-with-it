# Roll With It - Product Roadmap

> Expert Assessment by a Senior Software Engineer & D&D 5e Veteran

## Executive Summary

**Current State**: 20-25% complete - Strong foundation, needs feature implementation
**Target**: Open-source D&D Beyond alternative
**Competitive Advantage**: Multi-ruleset support, open-source, no paywall, offline-first capable

## Critical Assessment

### ✅ What We Have (Strengths)

1. **Superior Architecture** (vs D&D Beyond)
   - Multi-ruleset system (can support 5e 2014, 5e 2024, homebrew simultaneously)
   - Source tracking (every piece of content knows its origin)
   - Proper relational database with RLS security
   - Type-safe codebase with shared types
   - Local-first development with Supabase

2. **D&D 5e Rule Implementation**
   - Ability score calculations
   - Proficiency bonus by level
   - XP and leveling system
   - Spell slot progression
   - Skill-to-ability mappings
   - Currency conversion

3. **Technical Foundation**
   - Modern React 18 with TypeScript
   - Server state management (React Query)
   - Authentication ready
   - Real-time database subscriptions capable
   - Multi-platform architecture (Web + iOS)

### ❌ Critical Gaps (vs D&D Beyond)

#### Missing Core Features

1. **Character Builder** (CRITICAL - #1 Priority)
   - No step-by-step character creation wizard
   - No race/class selection UI
   - No ability score assignment (point buy, standard array, roll)
   - No equipment selection
   - No spell selection for casters
   - No background/personality traits

2. **Character Sheet** (CRITICAL - #2 Priority)
   - No digital character sheet display
   - No skill roll buttons
   - No ability check interface
   - No HP tracking
   - No spell slot management
   - No inventory management UI

3. **Content Display** (HIGH Priority)
   - Empty content library (filters exist but no data display)
   - No spell cards
   - No item descriptions
   - No class feature breakdowns
   - No search functionality

4. **Dice Roller** (MEDIUM Priority)
   - No digital dice roller UI
   - Logic exists but no interface
   - No roll history
   - No advantage/disadvantage

5. **Combat Tracking** (MEDIUM Priority)
   - No initiative tracker
   - No encounter builder
   - No hit point tracking for multiple creatures

6. **DM Tools** (LOW Priority initially)
   - No monster stat blocks
   - No encounter balancing
   - No loot generator
   - No NPC generator

## Feature Prioritization (Next 6 Months)

### Phase 1: MVP - Core Character Management (Months 1-2)

**Goal**: Users can create, view, and manage basic 5e characters

#### Sprint 1: Character Builder Foundation
- [ ] Character creation wizard (multi-step form)
- [ ] Race selection with trait display
- [ ] Class selection with feature preview
- [ ] Ability score assignment (Standard Array, Point Buy, Manual)
- [ ] Save character to database

**D&D 5e Specific Requirements**:
- Standard Array: 15, 14, 13, 12, 10, 8
- Point Buy: 27 points, costs match PHB
- Racial ability bonuses (5e 2014) vs. origin flexibility (5e 2024)
- Display class hit die, proficiencies, starting equipment

**Technical Implementation**:
```typescript
// components/CharacterBuilder/
├── CharacterWizard.tsx           # Main wizard container
├── steps/
│   ├── RaceSelection.tsx         # Step 1: Choose race
│   ├── ClassSelection.tsx        # Step 2: Choose class
│   ├── AbilityScores.tsx         # Step 3: Assign abilities
│   ├── SkillSelection.tsx        # Step 4: Choose skills
│   ├── BackgroundSelection.tsx   # Step 5: Choose background
│   └── EquipmentSelection.tsx    # Step 6: Starting equipment
├── hooks/
│   └── useCharacterBuilder.ts    # State management
└── utils/
    ├── abilityScoreCalculator.ts
    └── equipmentSelector.ts
```

#### Sprint 2: Character Sheet Display
- [ ] Full character sheet view
- [ ] Ability scores with modifiers
- [ ] Skills with proficiency indicators
- [ ] Saving throws display
- [ ] AC, HP, Speed display
- [ ] Attack actions list

**D&D 5e Specific Requirements**:
- Proficiency bonus: floor((level - 1) / 4) + 2
- Skill bonuses: ability modifier + (proficiency if proficient)
- Passive Perception: 10 + Wisdom modifier + proficiency (if proficient)
- Initiative: Dexterity modifier
- AC calculation based on armor + Dex modifier (max based on armor type)

#### Sprint 3: Character List & Management
- [ ] Character listing page with cards
- [ ] Character search and filtering
- [ ] Character deletion with confirmation
- [ ] Quick stats preview
- [ ] Character duplication

### Phase 2: Advanced Character Features (Month 3)

#### Sprint 4: Spell Management
- [ ] Spell list for casters (filtered by class spell list)
- [ ] Spell preparation interface
- [ ] Spell slot tracking
- [ ] Cantrip display
- [ ] Ritual spell indicators
- [ ] Spell detail modal (full description, components, etc.)

**D&D 5e Specific Requirements**:
- Spells Known vs. Spells Prepared (Wizard prepares, Sorcerer knows)
- Spell slots by level (matches SPELL_SLOTS_BY_LEVEL constant)
- Spell school icons (Evocation, Abjuration, etc.)
- Concentration tracking
- Ritual casting availability
- Spell components (V, S, M with material description)
- Higher-level casting effects

#### Sprint 5: Inventory & Equipment
- [ ] Equipment list with equipped status
- [ ] Weight tracking and encumbrance
- [ ] Currency management
- [ ] Item attunement tracking
- [ ] Magic item identification
- [ ] Quick equipment actions

**D&D 5e Specific Requirements**:
- Carrying capacity: Strength × 15 lbs
- Encumbrance: Strength × 5 (heavily encumbered), × 10 (encumbered)
- Attunement limit: 3 items
- Item rarity display (Common, Uncommon, Rare, Very Rare, Legendary, Artifact)
- Coin weight: 50 coins = 1 lb

#### Sprint 6: Leveling Up
- [ ] Level up wizard
- [ ] HP increase (roll or average)
- [ ] New class features automatic addition
- [ ] New spell selection (for spellcasters)
- [ ] ASI or Feat selection (levels 4, 8, 12, 16, 19)
- [ ] Proficiency bonus auto-update

**D&D 5e Specific Requirements**:
- HP on level up: Roll hit die OR take average (rounded up)
- ASI: +2 to one ability, +1 to two abilities, OR take a feat
- Spellcaster progression: new spells known/prepared, new spell slots
- Multiclassing rules (if supported)

### Phase 3: Content Library & Discovery (Month 4)

#### Sprint 7: Browsable Content Library
- [ ] Spell browser with search and filters
- [ ] Item browser with rarity/type filters
- [ ] Race/class browser with feature previews
- [ ] Content detail pages (full descriptions)
- [ ] Source book attribution
- [ ] Favorites/bookmarking

**D&D 5e Content Coverage**:
Priority order for content addition:
1. **Core PHB Content** (5e SRD):
   - All PHB races (9 races)
   - All PHB classes (12 classes)
   - All PHB subclasses (2-4 per class)
   - PHB spells (~300 spells)
   - PHB equipment and magic items

2. **Xanathar's Guide to Everything**:
   - New subclasses (1-2 per class)
   - New spells (~100)
   - Magic items

3. **Tasha's Cauldron of Everything**:
   - Custom lineages
   - Optional class features
   - New subclasses
   - Group patrons

4. **5e 2024 Player's Handbook**:
   - Updated class features
   - Revised spells
   - New origin options

#### Sprint 8: Search & Filtering
- [ ] Global search across all content
- [ ] Advanced filters (level, school, casting time for spells)
- [ ] Filter by source book
- [ ] Filter by ruleset (5e 2014 vs 5e 2024)
- [ ] Saved filter presets

#### Sprint 9: Homebrew Content Creation
- [ ] Create custom races
- [ ] Create custom classes/subclasses
- [ ] Create custom spells
- [ ] Create custom items
- [ ] Homebrew validation (prevent game-breaking content)
- [ ] Homebrew sharing (public/private)

### Phase 4: Campaign & Multiplayer Features (Month 5)

#### Sprint 10: Campaign Management
- [ ] Create campaign with name, description, ruleset
- [ ] Invite players via email
- [ ] Player acceptance workflow
- [ ] Add existing characters to campaign
- [ ] Campaign dashboard (all characters, session count)
- [ ] Campaign chat/notes

**D&D 5e DM Features**:
- Set starting level
- Allow/disallow homebrew content
- Source book restrictions
- Stat rolling method for players

#### Sprint 11: Session Tracking
- [ ] Create session with date and title
- [ ] Session notes (rich text editor)
- [ ] Session summary
- [ ] Award XP to party
- [ ] Distribute loot
- [ ] Track session count

#### Sprint 12: Real-time Multiplayer
- [ ] Live character sheet updates (Supabase real-time)
- [ ] Shared dice rolls
- [ ] Initiative tracker for combat
- [ ] HP tracking visible to DM
- [ ] Status effects/conditions

### Phase 5: DM Tools & Advanced Features (Month 6)

#### Sprint 13: Dice Roller
- [ ] Visual dice roller with 3D animations
- [ ] Support all dice types (d4, d6, d8, d10, d12, d20, d100)
- [ ] Modifiers and custom formulas
- [ ] Advantage/disadvantage
- [ ] Roll history
- [ ] Shared rolls in campaigns

#### Sprint 14: Combat Tracker
- [ ] Initiative tracker with drag-and-drop
- [ ] Turn counter
- [ ] Add monsters/NPCs
- [ ] HP tracking for all combatants
- [ ] Conditions and status effects
- [ ] Combat log

#### Sprint 15: Monster Management
- [ ] Monster stat blocks (from SRD)
- [ ] Monster search and filtering (CR, type, size)
- [ ] Custom monster creation
- [ ] Monster tactics notes
- [ ] Encounter builder with CR calculations

**D&D 5e Encounter Building**:
- XP thresholds by level (Easy, Medium, Hard, Deadly)
- Encounter multiplier based on monster count
- Adjusted XP calculation
- CR to XP conversion table

### Phase 6: Polish & Quality of Life (Ongoing)

- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode
- [ ] Print-friendly character sheets
- [ ] PDF export
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Offline mode (PWA)
- [ ] Character portraits/avatars
- [ ] Customizable character sheet layouts

## Technical Recommendations

### Architecture Decisions

#### 1. State Management Strategy

```typescript
// Use Zustand for client state
// packages/web/src/store/

// Character Builder State
export const useCharacterBuilderStore = create<CharacterBuilderState>((set) => ({
  currentStep: 0,
  selectedRace: null,
  selectedClass: null,
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  // ...
}));

// Auth State
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  // ...
}));

// App State (UI state, modals, etc.)
export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  // ...
}));
```

#### 2. Data Fetching Patterns

```typescript
// Use React Query for server state
// packages/web/src/hooks/

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRacesByRuleset(rulesetId: string) {
  return useQuery({
    queryKey: ['races', rulesetId],
    queryFn: () => contentService.getRacesByRuleset(rulesetId),
    enabled: !!rulesetId,
  });
}
```

#### 3. Form Validation with Zod

```typescript
// packages/shared/src/schemas/character.schema.ts
import { z } from 'zod';

export const abilityScoresSchema = z.object({
  str: z.number().min(1).max(30),
  dex: z.number().min(1).max(30),
  con: z.number().min(1).max(30),
  int: z.number().min(1).max(30),
  wis: z.number().min(1).max(30),
  cha: z.number().min(1).max(30),
});

export const characterCreateSchema = z.object({
  name: z.string().min(1).max(50),
  ruleset_id: z.string().uuid(),
  race_id: z.string().uuid(),
  class_id: z.string().uuid(),
  ability_scores: abilityScoresSchema,
  // ...
});
```

#### 4. Component Structure Best Practices

```
packages/web/src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Select.tsx
│   ├── character/           # Character-specific components
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterSheet.tsx
│   │   ├── AbilityScores.tsx
│   │   ├── SkillsList.tsx
│   │   └── SpellSlots.tsx
│   ├── builder/             # Character builder components
│   │   └── CharacterWizard/
│   ├── content/             # Content library components
│   │   ├── SpellCard.tsx
│   │   ├── ItemCard.tsx
│   │   └── RaceCard.tsx
│   └── campaign/            # Campaign components
│       ├── CampaignCard.tsx
│       └── SessionLog.tsx
```

### D&D 5e Rule Engine Enhancements

#### Expand Shared Utilities

```typescript
// packages/shared/src/utils/character.ts

/**
 * Calculate AC based on armor and modifiers
 */
export function calculateArmorClass(
  armor: Item | null,
  shield: boolean,
  dexModifier: number,
  bonuses: number[] = []
): number {
  if (!armor) {
    // Unarmored: 10 + Dex modifier
    return 10 + dexModifier + bonuses.reduce((a, b) => a + b, 0);
  }

  const baseAC = armor.armor_class || 10;

  // Light armor: add full Dex modifier
  if (armor.type === 'light') {
    return baseAC + dexModifier + (shield ? 2 : 0) + bonuses.reduce((a, b) => a + b, 0);
  }

  // Medium armor: add Dex modifier (max +2)
  if (armor.type === 'medium') {
    return baseAC + Math.min(dexModifier, 2) + (shield ? 2 : 0) + bonuses.reduce((a, b) => a + b, 0);
  }

  // Heavy armor: no Dex modifier
  return baseAC + (shield ? 2 : 0) + bonuses.reduce((a, b) => a + b, 0);
}

/**
 * Calculate hit points on level up
 */
export function calculateHPIncrease(
  classHitDie: number,
  conModifier: number,
  method: 'roll' | 'average'
): number {
  if (method === 'average') {
    return Math.floor(classHitDie / 2) + 1 + conModifier;
  }
  // For 'roll', this would be called after the roll
  return rollDice(`1d${classHitDie}`) + conModifier;
}

/**
 * Validate point buy allocation
 */
export function validatePointBuy(scores: AbilityScores): { valid: boolean; pointsUsed: number } {
  const costs = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

  const pointsUsed = Object.values(scores).reduce((total, score) => {
    if (score < 8 || score > 15) return Infinity;
    return total + (costs[score as keyof typeof costs] || Infinity);
  }, 0);

  return {
    valid: pointsUsed === 27,
    pointsUsed,
  };
}
```

## Competitive Advantages Over D&D Beyond

### 1. **Multi-Ruleset Support**
- D&D Beyond only supports current 5e
- We support: 5e 2014, 5e 2024, 4e, custom rulesets
- Users can compare and migrate characters between editions

### 2. **Open Source & Free**
- No paywall for basic features
- Community contributions
- Self-hostable
- API access for third-party tools

### 3. **Offline-First**
- Works without internet (PWA)
- Local database sync
- D&D Beyond requires constant connection

### 4. **Homebrew-Friendly**
- No approval process for homebrew
- Share homebrew easily
- Import/export homebrew JSON

### 5. **Campaign Tools**
- Better collaboration features
- Real-time multiplayer
- Initiative tracker built-in
- Session notes integrated

### 6. **Source Tracking**
- Always know which book content is from
- Filter by owned books
- Respect IP while being open

## Content Acquisition Strategy

### Legal Considerations

**Can Use (OGL/SRD Content)**:
- System Reference Document 5.1 (official WotC)
- Basic rules for 5e
- SRD monsters, spells, items
- Game mechanics (not protected by copyright)

**Cannot Use**:
- Full text from PHB, XGE, TCE, etc.
- Adventure modules
- Setting-specific content (Forgotten Realms lore, etc.)
- WotC artwork

**Strategy**:
1. Start with SRD content only
2. Add homebrew community content
3. Allow users to manually enter owned content
4. Provide import tools for personal use
5. Partner with third-party publishers (Kobold Press, etc.)

### Content Roadmap

**Phase 1**: SRD 5.1 (100% legal, free)
- 9 races (Human, Elf, Dwarf, Halfling, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling)
- 12 classes with basic subclasses
- ~300 spells
- ~200 monsters
- Basic equipment and magic items

**Phase 2**: Community homebrew
- Build homebrew creation tools
- Community voting/rating system
- Curated homebrew collections

**Phase 3**: Third-party partnerships
- Integrate Kobold Press content (with permission)
- MCDM content
- Other OGL publishers

## Success Metrics

### Phase 1 Success (Month 2)
- [ ] Users can create and save characters
- [ ] Users can view character sheets
- [ ] 100+ users registered
- [ ] 500+ characters created

### Phase 2 Success (Month 4)
- [ ] Full content library browsable
- [ ] Spell and item search functional
- [ ] 1,000+ users
- [ ] 5,000+ characters
- [ ] 100+ homebrew items created

### Phase 3 Success (Month 6)
- [ ] Campaign creation functional
- [ ] Real-time multiplayer working
- [ ] 5,000+ users
- [ ] 100+ active campaigns
- [ ] iOS app beta launched

## Risk Mitigation

### Legal Risks
- **Risk**: Copyright infringement
- **Mitigation**: Use only SRD content, clearly mark homebrew, respect IP

### Technical Risks
- **Risk**: Supabase free tier limits
- **Mitigation**: Implement caching, optimize queries, plan for scaling

### Competition Risks
- **Risk**: D&D Beyond improving or going free
- **Mitigation**: Focus on open-source, offline, multi-ruleset advantages

### Adoption Risks
- **Risk**: Users don't migrate from D&D Beyond
- **Mitigation**: Import tools, superior features, community engagement

## Next Steps (This Week)

1. **Character Builder Sprint Planning**
   - Create detailed wireframes for character wizard
   - Set up component structure
   - Implement Step 1: Race Selection

2. **Content Population**
   - Add remaining SRD races (5 more races)
   - Add remaining SRD classes (8 more classes)
   - Add basic spells (50-100 to start)

3. **Community Setup**
   - Create GitHub discussions for feature requests
   - Set up Discord server for community
   - Create contribution guidelines

4. **Documentation**
   - API documentation for developers
   - User guide for character creation
   - DM guide for campaign management

---

**Ready to build the best open-source D&D tool?** Let's start with the Character Builder! 🎲⚔️
