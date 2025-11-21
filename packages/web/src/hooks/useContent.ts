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
