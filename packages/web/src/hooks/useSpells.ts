import { useQuery } from '@tanstack/react-query';
import { spellService } from '@/services/spell.service';

/**
 * Hook to fetch all spells
 */
export function useSpells() {
  return useQuery({
    queryKey: ['spells'],
    queryFn: () => spellService.getSpells(),
    staleTime: 1000 * 60 * 10, // 10 minutes - spells rarely change
  });
}

/**
 * Hook to fetch spells by IDs (for character spell lists)
 */
export function useSpellsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['spells', 'by-ids', ids.sort().join(',')],
    queryFn: () => spellService.getSpellsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch spells by level
 */
export function useSpellsByLevel(level: number) {
  return useQuery({
    queryKey: ['spells', 'by-level', level],
    queryFn: () => spellService.getSpellsByLevel(level),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch spells by class
 */
export function useSpellsByClass(className: string) {
  return useQuery({
    queryKey: ['spells', 'by-class', className],
    queryFn: () => spellService.getSpellsByClass(className),
    enabled: !!className,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to search spells
 */
export function useSpellSearch(query: string) {
  return useQuery({
    queryKey: ['spells', 'search', query],
    queryFn: () => spellService.searchSpells(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch a single spell
 */
export function useSpell(id: string | undefined) {
  return useQuery({
    queryKey: ['spells', id],
    queryFn: () => spellService.getSpell(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to filter spells with advanced criteria
 */
export function useFilteredSpells(filters: {
  levels?: number[];
  schools?: string[];
  classes?: string[];
  concentration?: boolean;
  ritual?: boolean;
}) {
  const filterKey = JSON.stringify(filters);

  return useQuery({
    queryKey: ['spells', 'filtered', filterKey],
    queryFn: () => spellService.filterSpells(filters),
    staleTime: 1000 * 60 * 10,
  });
}
