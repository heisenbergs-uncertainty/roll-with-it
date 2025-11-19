# Technical Decisions & Best Practices

> Expert recommendations for building Roll With It

## Key Technical Decisions

### 1. Character Builder Implementation

**Decision**: Multi-step wizard with persistent state

**Rationale**:
- Character creation is complex (6-8 steps)
- Users need to go back and forth between steps
- Progress should be saved (don't lose work on refresh)
- Mobile-friendly (one step at a time)

**Implementation**:
```typescript
// Use Zustand for wizard state (persisted to localStorage)
export const useCharacterBuilderStore = create<CharacterBuilderState>()(
  persist(
    (set, get) => ({
      // Wizard state
      currentStep: 0,
      completedSteps: [],

      // Character data
      rulesetId: null,
      selectedRace: null,
      selectedClass: null,
      abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      selectedSkills: [],
      selectedBackground: null,
      equipment: [],

      // Actions
      setStep: (step) => set({ currentStep: step }),
      setRace: (race) => set({ selectedRace: race }),
      reset: () => set({ /* reset to initial state */ }),

      // Validation
      canProceed: () => {
        const state = get();
        // Validate current step is complete
        switch (state.currentStep) {
          case 0: return !!state.selectedRace;
          case 1: return !!state.selectedClass;
          case 2: return validateAbilityScores(state.abilityScores);
          // ...
        }
      },
    }),
    {
      name: 'character-builder-storage',
    }
  )
);
```

### 2. Real-time Multiplayer

**Decision**: Supabase Real-time subscriptions

**Rationale**:
- Built into Supabase (no additional infrastructure)
- PostgreSQL logical replication
- Works with RLS policies
- Auto-scales

**Implementation**:
```typescript
// Subscribe to campaign character updates
export function useCampaignCharacters(campaignId: string) {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchCharacters = async () => {
      const { data } = await supabase
        .from('characters')
        .select('*, campaign_characters!inner(campaign_id)')
        .eq('campaign_characters.campaign_id', campaignId);
      setCharacters(data || []);
    };

    fetchCharacters();

    // Subscribe to changes
    const channel = supabase
      .channel(`campaign-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'characters',
          filter: `id=in.(${characters.map(c => c.id).join(',')})`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCharacters(prev =>
              prev.map(c => c.id === payload.new.id ? payload.new : c)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  return characters;
}
```

### 3. Content Caching Strategy

**Decision**: React Query with aggressive caching

**Rationale**:
- Content rarely changes (static data)
- Reduces database load
- Improves perceived performance
- Offline support

**Implementation**:
```typescript
// Cache content for 24 hours
export const contentQueryConfig = {
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
  cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

// Pre-fetch critical content on app load
export function usePrefetchContent(rulesetId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (rulesetId) {
      // Prefetch races and classes in background
      queryClient.prefetchQuery({
        queryKey: ['races', rulesetId],
        queryFn: () => contentService.getRacesByRuleset(rulesetId),
        ...contentQueryConfig,
      });

      queryClient.prefetchQuery({
        queryKey: ['classes', rulesetId],
        queryFn: () => contentService.getClassesByRuleset(rulesetId),
        ...contentQueryConfig,
      });
    }
  }, [rulesetId, queryClient]);
}
```

### 4. Form Validation

**Decision**: Zod schemas with React Hook Form

**Rationale**:
- Type-safe validation
- Shared between frontend and backend
- Excellent DX with TypeScript
- Performance (minimal re-renders)

**Implementation**:
```typescript
// packages/shared/src/schemas/character.ts
import { z } from 'zod';

export const characterFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  ruleset_id: z.string().uuid('Invalid ruleset'),
  race_id: z.string().uuid('Invalid race'),
  class_id: z.string().uuid('Invalid class'),
  ability_scores: z.object({
    str: z.number().min(1).max(30),
    dex: z.number().min(1).max(30),
    con: z.number().min(1).max(30),
    int: z.number().min(1).max(30),
    wis: z.number().min(1).max(30),
    cha: z.number().min(1).max(30),
  }),
});

export type CharacterFormData = z.infer<typeof characterFormSchema>;

// In component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm<CharacterFormData>({
  resolver: zodResolver(characterFormSchema),
});
```

### 5. Performance Optimization

**Decision**: Virtual scrolling for large lists

**Rationale**:
- Spell list can be 500+ items
- Item list can be 1000+ items
- Better UX on mobile
- Reduced memory usage

**Implementation**:
```typescript
// Use @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

export function SpellList({ spells }: { spells: Spell[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: spells.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 items above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const spell = spells[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <SpellCard spell={spell} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## D&D 5e Rule Engine

### Ability Score Calculations

```typescript
// packages/shared/src/utils/character.ts

/**
 * Apply racial ability score increases (5e 2014 rules)
 */
export function applyRacialBonuses(
  baseScores: AbilityScores,
  racialBonuses: AbilityScoreIncrease
): AbilityScores {
  const result = { ...baseScores };

  for (const [ability, bonus] of Object.entries(racialBonuses)) {
    const key = ability as keyof AbilityScores;
    result[key] = Math.min(20, result[key] + (bonus || 0)); // Cap at 20
  }

  return result;
}

/**
 * Calculate derived stats from ability scores
 */
export function calculateDerivedStats(
  character: Character,
  race: Race,
  classData: Class
): DerivedStats {
  const abilityMods = calculateAbilityModifiers(character.ability_scores);

  return {
    // AC calculation (assuming no armor for now)
    armorClass: 10 + abilityMods.dex,

    // Initiative
    initiative: abilityMods.dex,

    // Proficiency bonus
    proficiencyBonus: getProficiencyBonus(character.level),

    // Speed (from race)
    speed: race.speed || 30,

    // Passive perception
    passivePerception: 10 + abilityMods.wis +
      (character.skills?.perception?.proficient ? getProficiencyBonus(character.level) : 0),

    // Max HP (level 1)
    hitPointsMax: classData.hit_die + abilityMods.con,
  };
}
```

### Skill Proficiency Calculations

```typescript
/**
 * Calculate skill bonus
 */
export function calculateSkillBonus(
  abilityScore: number,
  proficient: boolean,
  expertise: boolean,
  level: number
): number {
  const abilityMod = calculateAbilityModifier(abilityScore);
  const profBonus = getProficiencyBonus(level);

  if (expertise) return abilityMod + (profBonus * 2);
  if (proficient) return abilityMod + profBonus;
  return abilityMod;
}

/**
 * Generate skill list with bonuses
 */
export function generateSkillList(
  character: Character,
  abilityScores: AbilityScores
): SkillWithBonus[] {
  return Object.entries(SKILL_ABILITY_MAP).map(([skill, ability]) => {
    const skillData = character.skills?.[skill as SkillName];
    const abilityScore = abilityScores[ability as AbilityName];

    return {
      name: skill as SkillName,
      label: SKILL_LABELS[skill],
      ability,
      bonus: calculateSkillBonus(
        abilityScore,
        skillData?.proficient || false,
        skillData?.expertise || false,
        character.level
      ),
      proficient: skillData?.proficient || false,
      expertise: skillData?.expertise || false,
    };
  });
}
```

### Spell Slot Management

```typescript
/**
 * Get spell slots for a character
 */
export function getSpellSlots(
  classData: Class,
  level: number
): SpellSlotTracker {
  if (!classData.spellcasting) return {};

  const slots: SpellSlotTracker = {};

  for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
    const maxSlots = SPELL_SLOTS_BY_LEVEL[level]?.[spellLevel - 1] || 0;
    if (maxSlots > 0) {
      slots[spellLevel] = { current: maxSlots, max: maxSlots };
    }
  }

  return slots;
}

/**
 * Use a spell slot
 */
export function useSpellSlot(
  slots: SpellSlotTracker,
  level: number
): SpellSlotTracker | null {
  if (!slots[level] || slots[level].current === 0) {
    return null; // No slots available
  }

  return {
    ...slots,
    [level]: {
      ...slots[level],
      current: slots[level].current - 1,
    },
  };
}

/**
 * Rest (restore spell slots)
 */
export function restoreSpellSlots(
  slots: SpellSlotTracker,
  restType: 'short' | 'long'
): SpellSlotTracker {
  if (restType === 'long') {
    // Long rest: restore all slots
    return Object.entries(slots).reduce((acc, [level, data]) => ({
      ...acc,
      [level]: { ...data, current: data.max },
    }), {});
  }

  // Short rest: some classes restore slots (e.g., Warlock)
  // Implementation depends on class
  return slots;
}
```

## Component Architecture Best Practices

### 1. Compound Components for Complex UI

```typescript
// Character sheet as compound component
export function CharacterSheet({ character }: { character: Character }) {
  return (
    <CharacterSheetProvider character={character}>
      <div className="character-sheet">
        <CharacterSheet.Header />
        <CharacterSheet.AbilityScores />
        <CharacterSheet.Skills />
        <CharacterSheet.Combat />
        <CharacterSheet.Features />
      </div>
    </CharacterSheetProvider>
  );
}

CharacterSheet.Header = function Header() {
  const { character } = useCharacterSheet();
  return (
    <div>
      <h1>{character.name}</h1>
      <p>Level {character.level} {/* race */} {/* class */}</p>
    </div>
  );
};

CharacterSheet.AbilityScores = function AbilityScores() {
  const { character } = useCharacterSheet();
  const abilities = calculateAbilityModifiers(character.ability_scores);

  return (
    <div className="grid grid-cols-6 gap-2">
      {ABILITY_NAMES.map((ability) => (
        <AbilityScore
          key={ability}
          name={ability}
          score={character.ability_scores[ability]}
          modifier={abilities[ability]}
        />
      ))}
    </div>
  );
};
```

### 2. Custom Hooks for Business Logic

```typescript
// Separate data fetching from UI
export function useCharacter(characterId: string) {
  const query = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('characters')
        .select('*, race:races(*), class:classes(*)')
        .eq('id', characterId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<Character>) => {
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', characterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', characterId] });
    },
  });

  return {
    character: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateCharacter: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
```

### 3. Error Boundaries for Resilience

```typescript
// Error boundary for character sheet
export class CharacterSheetErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Character sheet error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state">
          <h2>Something went wrong with this character sheet</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// Test D&D calculations
describe('calculateAbilityModifier', () => {
  it('calculates modifier correctly', () => {
    expect(calculateAbilityModifier(10)).toBe(0);
    expect(calculateAbilityModifier(18)).toBe(4);
    expect(calculateAbilityModifier(8)).toBe(-1);
  });
});

describe('validatePointBuy', () => {
  it('validates correct point buy', () => {
    const scores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
    const result = validatePointBuy(scores);
    expect(result.valid).toBe(true);
    expect(result.pointsUsed).toBe(27);
  });

  it('rejects invalid point buy', () => {
    const scores = { str: 15, dex: 15, con: 15, int: 15, wis: 15, cha: 15 };
    const result = validatePointBuy(scores);
    expect(result.valid).toBe(false);
  });
});
```

### Integration Tests

```typescript
// Test character creation flow
describe('Character Creation', () => {
  it('creates a character with all steps', async () => {
    const { result } = renderHook(() => useCharacterBuilderStore());

    // Step 1: Select race
    act(() => {
      result.current.setRace(mockRace);
    });
    expect(result.current.canProceed()).toBe(true);

    // Step 2: Select class
    act(() => {
      result.current.setClass(mockClass);
    });

    // Step 3: Assign ability scores
    act(() => {
      result.current.setAbilityScores(mockAbilityScores);
    });

    // Save character
    const character = await result.current.saveCharacter();
    expect(character.id).toBeDefined();
  });
});
```

## Performance Monitoring

```typescript
// Add performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16) { // > 1 frame at 60fps
        console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
        // Log to analytics service
      }
    };
  });
}

// Use in components
export function CharacterSheet() {
  usePerformanceMonitoring('CharacterSheet');
  // ... component code
}
```

## Security Best Practices

### 1. Input Validation

```typescript
// Always validate on both client and server
export async function createCharacter(data: CharacterFormData) {
  // Client-side validation
  const validated = characterFormSchema.parse(data);

  // Server-side validation (in Supabase function or API route)
  const { data: character, error } = await supabase
    .from('characters')
    .insert(validated)
    .select()
    .single();

  if (error) throw error;
  return character;
}
```

### 2. Prevent XSS

```typescript
// Sanitize user input (especially for homebrew content)
import DOMPurify from 'dompurify';

export function sanitizeContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

// Use in components
<div dangerouslySetInnerHTML={{ __html: sanitizeContent(spell.description) }} />
```

### 3. Rate Limiting

```typescript
// Implement rate limiting for mutations
const RATE_LIMIT = 10; // requests per minute
const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitStore.get(userId) || [];

  // Remove requests older than 1 minute
  const recentRequests = userRequests.filter(time => now - time < 60000);

  if (recentRequests.length >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }

  recentRequests.push(now);
  rateLimitStore.set(userId, recentRequests);
  return true;
}
```

## Accessibility (A11y)

```typescript
// Keyboard navigation for character sheet
export function CharacterSheet() {
  const [focusedSection, setFocusedSection] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Custom tab navigation between sections
    }
  };

  return (
    <div
      role="application"
      aria-label="Character Sheet"
      onKeyDown={handleKeyDown}
    >
      <section
        role="region"
        aria-label="Ability Scores"
        tabIndex={0}
      >
        {/* Ability scores */}
      </section>

      <section
        role="region"
        aria-label="Skills"
        tabIndex={0}
      >
        {/* Skills */}
      </section>
    </div>
  );
}

// Screen reader announcements
export function useLiveRegion() {
  const announce = (message: string) => {
    const region = document.getElementById('live-region');
    if (region) {
      region.textContent = message;
    }
  };

  return { announce };
}

// Use in components
const { announce } = useLiveRegion();

const rollDice = () => {
  const result = rollDice('1d20');
  announce(`Rolled ${result} on a d20`);
};
```

---

These technical decisions set us up for success! Ready to implement? 🚀
