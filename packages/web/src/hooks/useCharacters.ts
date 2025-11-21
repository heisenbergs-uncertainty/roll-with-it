import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { characterService } from '@/services/character.service';
import type { Character } from '@roll-with-it/shared';

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

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Character> }) =>
      characterService.updateCharacter(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['character', data.id] });
    },
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
