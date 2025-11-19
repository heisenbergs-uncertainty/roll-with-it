# Next Steps - Start Here! 🚀

> Immediate action items to get Roll With It to MVP

## This Week: Character Builder Foundation

### Day 1-2: Project Setup & First Component

#### 1. Set up development environment
```bash
# Ensure everything is running
pnpm db:start
pnpm dev:web
```

#### 2. Install additional dependencies
```bash
cd packages/web

# Form handling
pnpm add react-hook-form @hookform/resolvers/zod

# Icons
pnpm add lucide-react

# Utilities
pnpm add clsx tailwind-merge

# Date handling (for session tracking later)
pnpm add date-fns
```

#### 3. Create utility functions
```bash
# Create these files:
mkdir -p packages/web/src/lib/utils
touch packages/web/src/lib/utils/cn.ts
```

```typescript
// packages/web/src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### 4. Create your first reusable component
```typescript
// packages/web/src/components/common/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'border border-gray-300 bg-transparent hover:bg-gray-100': variant === 'outline',
            'hover:bg-gray-100': variant === 'ghost',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
```

### Day 3-4: Character List Page

#### 1. Create character service
```typescript
// packages/web/src/services/character.service.ts
import { supabase } from '@/lib/supabase';
import type { Character } from '@roll-with-it/shared';

export const characterService = {
  async getCharacters(): Promise<Character[]> {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        race:races(name),
        class:classes(name)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCharacter(id: string): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        race:races(*),
        class:classes(*),
        subclass:subclasses(*),
        background:backgrounds(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCharacter(id: string): Promise<void> {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
```

#### 2. Create character hooks
```typescript
// packages/web/src/hooks/useCharacters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { characterService } from '@/services/character.service';

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: characterService.getCharacters,
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: ['character', id],
    queryFn: () => characterService.getCharacter(id),
    enabled: !!id,
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: characterService.deleteCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}
```

#### 3. Update CharactersPage
```typescript
// packages/web/src/pages/CharactersPage.tsx
import { useCharacters, useDeleteCharacter } from '@/hooks/useCharacters';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

export default function CharactersPage() {
  const { data: characters, isLoading } = useCharacters();
  const deleteMutation = useDeleteCharacter();

  if (isLoading) {
    return <div>Loading characters...</div>;
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Characters Yet</h2>
        <p className="text-gray-600 mb-6">Create your first character to get started</p>
        <Link to="/characters/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Character
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Characters</h1>
        <Link to="/characters/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Character
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <div
            key={character.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
                <p className="text-sm text-gray-600">
                  Level {character.level} {character.race?.name} {character.class?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Delete this character?')) {
                    deleteMutation.mutate(character.id);
                  }
                }}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">HP</span>
                <p className="font-semibold">
                  {character.hit_points_current}/{character.hit_points_max}
                </p>
              </div>
              <div>
                <span className="text-gray-500">AC</span>
                <p className="font-semibold">{character.armor_class}</p>
              </div>
              <div>
                <span className="text-gray-500">Speed</span>
                <p className="font-semibold">{character.speed} ft</p>
              </div>
            </div>

            <Link to={`/characters/${character.id}`}>
              <Button variant="outline" className="w-full mt-4" size="sm">
                View Sheet
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Day 5-7: Simple Character Creator (No Wizard Yet)

#### 1. Create basic character form
```typescript
// packages/web/src/pages/CharacterCreatePage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/common/Button';
import { useRulesets } from '@/hooks/useContent';
import { useRacesByRuleset, useClassesByRuleset } from '@/hooks/useContent';

const characterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ruleset_id: z.string().uuid(),
  race_id: z.string().uuid(),
  class_id: z.string().uuid(),
  level: z.number().min(1).max(20),
});

type CharacterFormData = z.infer<typeof characterSchema>;

export default function CharacterCreatePage() {
  const navigate = useNavigate();
  const { data: rulesets } = useRulesets();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      level: 1,
    },
  });

  const rulesetId = watch('ruleset_id');
  const { data: races } = useRacesByRuleset(rulesetId);
  const { data: classes } = useClassesByRuleset(rulesetId);

  const createMutation = useMutation({
    mutationFn: async (data: CharacterFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: character, error } = await supabase
        .from('characters')
        .insert({
          ...data,
          user_id: user.user.id,
          ability_scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          hit_points_max: 10,
          hit_points_current: 10,
          armor_class: 10,
        })
        .select()
        .single();

      if (error) throw error;
      return character;
    },
    onSuccess: (character) => {
      navigate(`/characters/${character.id}`);
    },
  });

  const onSubmit = (data: CharacterFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Character</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Character Name
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter character name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ruleset
          </label>
          <select
            {...register('ruleset_id')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select ruleset...</option>
            {rulesets?.map((ruleset) => (
              <option key={ruleset.id} value={ruleset.id}>
                {ruleset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Race</label>
          <select
            {...register('race_id')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            disabled={!rulesetId}
          >
            <option value="">Select race...</option>
            {races?.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <select
            {...register('class_id')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            disabled={!rulesetId}
          >
            <option value="">Select class...</option>
            {classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <input
            type="number"
            {...register('level', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            min={1}
            max={20}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Character'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/characters')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
```

#### 2. Add route
```typescript
// packages/web/src/App.tsx
import CharacterCreatePage from './pages/CharacterCreatePage';

// In Routes:
<Route path="/characters/new" element={<CharacterCreatePage />} />
```

#### 3. Create content hooks
```typescript
// packages/web/src/hooks/useContent.ts
import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/content.service';

export function useRulesets() {
  return useQuery({
    queryKey: ['rulesets'],
    queryFn: contentService.getRulesets,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useRacesByRuleset(rulesetId: string) {
  return useQuery({
    queryKey: ['races', rulesetId],
    queryFn: () => contentService.getRacesByRuleset(rulesetId),
    enabled: !!rulesetId,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useClassesByRuleset(rulesetId: string) {
  return useQuery({
    queryKey: ['classes', rulesetId],
    queryFn: () => contentService.getClassesByRuleset(rulesetId),
    enabled: !!rulesetId,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
```

## Next Week: Character Sheet Display

### Goals
- Display full character details
- Show ability scores with modifiers
- List skills with bonuses
- Display saving throws
- Show equipped items

### Files to Create
```
packages/web/src/
├── pages/
│   └── CharacterDetailPage.tsx
├── components/
│   └── character/
│       ├── CharacterHeader.tsx
│       ├── AbilityScores.tsx
│       ├── SkillsList.tsx
│       ├── SavingThrows.tsx
│       ├── CombatStats.tsx
│       └── InventoryList.tsx
```

## Week 3: Character Builder Wizard

### Goals
- Multi-step character creation
- Race selection with trait preview
- Class selection with features
- Ability score assignment (point buy, standard array)
- Skill proficiency selection
- Equipment selection

## Common Pitfalls to Avoid

### 1. Don't Over-Engineer Early
- Start with simple forms before complex wizards
- Get basic CRUD working first
- Add polish later

### 2. Use Existing Components
- Don't rebuild everything from scratch
- Consider using shadcn/ui or headless UI
- Focus on D&D logic, not UI primitives

### 3. Test with Real Data
- Create test characters manually in Supabase Studio
- Test with multiple rulesets
- Verify calculations are correct

### 4. Handle Loading States
- Always show loading indicators
- Handle errors gracefully
- Provide feedback on mutations

### 5. Mobile-First
- Test on mobile viewport early
- Use responsive grid layouts
- Touch-friendly tap targets

## Resources

### D&D 5e References
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)
- [D&D Beyond](https://www.dndbeyond.com) - for inspiration
- [Roll20 Character Sheet](https://roll20.net/) - UI reference

### Code Examples
- [TanStack Query Examples](https://tanstack.com/query/latest/docs/react/examples/react/basic)
- [React Hook Form Examples](https://react-hook-form.com/get-started)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/react)

### UI Libraries (Optional)
- [shadcn/ui](https://ui.shadcn.com/) - Copy-paste components
- [Headless UI](https://headlessui.com/) - Unstyled components
- [Radix UI](https://www.radix-ui.com/) - Primitives

## Questions to Answer This Week

- [ ] What character creation flow feels best? (Wizard vs. long form)
- [ ] How much validation should happen on each step?
- [ ] Should we auto-calculate derived stats or let users override?
- [ ] How do we handle edge cases (multiclassing, variant rules)?

## Success Criteria

By end of Week 1:
- [ ] Can list existing characters
- [ ] Can create a basic character
- [ ] Can delete characters
- [ ] Character data saves to database

Ready to start building? Let's go! 🎲
