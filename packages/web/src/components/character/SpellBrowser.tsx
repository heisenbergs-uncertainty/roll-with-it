import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpells } from '@/hooks/useSpells';
import type { Spell } from '@roll-with-it/shared/types/supabase';

interface SpellBrowserProps {
  selectedSpellIds?: string[];
  characterClass?: string;
  onAddSpell?: (spell: Spell) => void;
  className?: string;
}

const SPELL_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function SpellBrowserItem({
  spell,
  isAdded,
  onAdd,
}: {
  spell: Spell;
  isAdded: boolean;
  onAdd: (spell: Spell) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const components: string[] = [];
  if (spell.components) {
    if (typeof spell.components === 'object') {
      const comp = spell.components as { verbal?: boolean; somatic?: boolean; material?: string };
      if (comp.verbal) components.push('V');
      if (comp.somatic) components.push('S');
      if (comp.material) components.push('M');
    }
  }

  const levelLabel = spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 text-left group"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex-1">
            <div className="font-medium group-hover:text-primary transition-colors">
              {spell.name}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="secondary" className="text-xs">
                {levelLabel}
              </Badge>
              <span>{spell.school}</span>
              {spell.concentration && <Badge variant="outline">Concentration</Badge>}
              {spell.ritual && <Badge variant="outline">Ritual</Badge>}
            </div>
          </div>
        </button>
        <Button
          size="sm"
          variant={isAdded ? 'secondary' : 'default'}
          onClick={() => !isAdded && onAdd(spell)}
          disabled={isAdded}
          className="shrink-0"
        >
          {isAdded ? (
            'Added'
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>

      {expanded && (
        <div className="pl-6 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Casting Time:</span> {spell.casting_time}
            </div>
            <div>
              <span className="text-muted-foreground">Range:</span> {spell.range}
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span> {spell.duration}
            </div>
            {components.length > 0 && (
              <div>
                <span className="text-muted-foreground">Components:</span> {components.join(', ')}
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm whitespace-pre-wrap">{spell.description}</p>
          </div>

          {spell.higher_levels && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">At Higher Levels:</span> {spell.higher_levels}
              </p>
            </div>
          )}

          {spell.classes && Array.isArray(spell.classes) && spell.classes.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {spell.classes.map((cls) => (
                <Badge key={cls} variant="secondary" className="text-xs">
                  {cls}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SpellBrowser({
  selectedSpellIds = [],
  characterClass,
  onAddSpell,
  className,
}: SpellBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [showClassOnly, setShowClassOnly] = useState(false);

  const { data: allSpells = [], isLoading } = useSpells();

  const filteredSpells = useMemo(() => {
    return allSpells.filter((spell) => {
      // Search filter
      if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Level filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(spell.level)) {
        return false;
      }

      // School filter
      if (selectedSchools.length > 0 && !selectedSchools.includes(spell.school)) {
        return false;
      }

      // Class filter
      if (showClassOnly && characterClass) {
        if (Array.isArray(spell.classes) && !spell.classes.includes(characterClass)) {
          return false;
        }
      }

      return true;
    });
  }, [allSpells, searchQuery, selectedLevels, selectedSchools, showClassOnly, characterClass]);

  const toggleLevel = (level: number) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleSchool = (school: string) => {
    setSelectedSchools((prev) =>
      prev.includes(school) ? prev.filter((s) => s !== school) : [...prev, school]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevels([]);
    setSelectedSchools([]);
    setShowClassOnly(false);
  };

  const hasFilters =
    searchQuery || selectedLevels.length > 0 || selectedSchools.length > 0 || showClassOnly;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spell Browser</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Level Filter */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Spell Level</div>
            <div className="flex flex-wrap gap-1">
              {SPELL_LEVELS.map((level) => (
                <Badge
                  key={level}
                  variant={selectedLevels.includes(level) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleLevel(level)}
                >
                  {level === 0 ? 'Cantrip' : level}
                </Badge>
              ))}
            </div>
          </div>

          {/* School Filter */}
          <div className="space-y-2">
            <div className="text-sm font-medium">School</div>
            <div className="flex flex-wrap gap-1">
              {SPELL_SCHOOLS.map((school) => (
                <Badge
                  key={school}
                  variant={selectedSchools.includes(school) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleSchool(school)}
                >
                  {school}
                </Badge>
              ))}
            </div>
          </div>

          {/* Class Filter */}
          {characterClass && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="class-filter"
                checked={showClassOnly}
                onChange={(e) => setShowClassOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="class-filter" className="text-sm cursor-pointer">
                Show only {characterClass} spells
              </label>
            </div>
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="border-t pt-4">
          <div className="text-sm text-muted-foreground mb-3">
            {isLoading ? (
              'Loading spells...'
            ) : (
              <>
                {filteredSpells.length} spell{filteredSpells.length !== 1 ? 's' : ''} found
              </>
            )}
          </div>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredSpells.map((spell) => (
                <SpellBrowserItem
                  key={spell.id}
                  spell={spell}
                  isAdded={selectedSpellIds.includes(spell.id)}
                  onAdd={onAddSpell || (() => {})}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
