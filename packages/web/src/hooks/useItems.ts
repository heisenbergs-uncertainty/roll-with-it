import { useQuery } from '@tanstack/react-query';
import { itemService } from '@/services/item.service';

/**
 * Hook to fetch all items
 */
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: () => itemService.getItems(),
    staleTime: 1000 * 60 * 10, // Items don't change often, cache for 10 minutes
  });
}

/**
 * Hook to fetch items by IDs (useful for character inventory)
 */
export function useItemsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['items', 'byIds', ids],
    queryFn: () => itemService.getItemsByIds(ids),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to search items
 */
export function useItemSearch(query: string) {
  return useQuery({
    queryKey: ['items', 'search', query],
    queryFn: () => itemService.searchItems(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch a single item
 */
export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => itemService.getItem(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}
