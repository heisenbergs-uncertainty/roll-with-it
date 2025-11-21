import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Spell } from '@roll-with-it/shared/types/supabase';

interface SpellListProps {
  spells: Spell[];
  onCastSpell?: (spell: Spell) => void;
  className?: string;
}

interface SpellsByLevel {
  [level: number]: Spell[];
}

function SpellDetailItem({ spell, onCast }: { spell: Spell; onCast?: (spell: Spell) => void }) {
  const [expanded, setExpanded] = useState(false);

  const components: string[] = [];
  if (spell.components) {
    if (typeof spell.components === 'object') {
      const comp = spell.components as { verbal?: boolean; somatic?: boolean; material?: string };
      if (comp.verbal) components.push('V');
      if (comp.somatic) components.push('S');
      if (comp.material) components.push(`M (${comp.material})`);
    }
  }

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
            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <span>{spell.school}</span>
              {spell.concentration && <Badge variant="outline">Concentration</Badge>}
              {spell.ritual && <Badge variant="outline">Ritual</Badge>}
            </div>
          </div>
        </button>
        {spell.level > 0 && onCast && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCast(spell)}
            className="shrink-0"
          >
            <Zap className="h-3 w-3 mr-1" />
            Cast
          </Button>
        )}
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

export function SpellList({ spells, onCastSpell, className }: SpellListProps) {
  // Group spells by level
  const spellsByLevel: SpellsByLevel = spells.reduce((acc, spell) => {
    if (!acc[spell.level]) {
      acc[spell.level] = [];
    }
    acc[spell.level].push(spell);
    return acc;
  }, {} as SpellsByLevel);

  // Sort spells within each level alphabetically
  Object.keys(spellsByLevel).forEach((level) => {
    spellsByLevel[Number(level)].sort((a, b) => a.name.localeCompare(b.name));
  });

  const levels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  if (spells.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spells</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No spells prepared. Add spells to your character to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getLevelLabel = (level: number) => {
    if (level === 0) return 'Cantrips';
    if (level === 1) return '1st Level';
    if (level === 2) return '2nd Level';
    if (level === 3) return '3rd Level';
    return `${level}th Level`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spells ({spells.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {levels.map((level) => (
          <div key={level} className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-1">
              {getLevelLabel(level)}
              <span className="text-sm text-muted-foreground ml-2">
                ({spellsByLevel[level].length})
              </span>
            </h3>
            <div className="space-y-2">
              {spellsByLevel[level].map((spell) => (
                <SpellDetailItem key={spell.id} spell={spell} onCast={onCastSpell} />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
