import type { Character, Race, Class, Subclass, Background, InventoryItem, Item } from '@roll-with-it/shared';

// Extended types for database queries with joins

export interface CharacterWithRelations extends Character {
  race?: { name: string } | null;
  class?: { name: string } | null;
}

export interface CharacterWithFullRelations extends Character {
  race?: Race | null;
  class?: Class | null;
  subclass?: Subclass | null;
  background?: Background | null;
}

// Inventory item with full item details for display
export interface InventoryItemWithDetails extends InventoryItem {
  item?: Item | null;
}

// Helper to get equipment slot from item properties
export function getItemSlot(item: Item): string | null {
  if (typeof item.properties === 'object' && item.properties !== null && 'slot' in item.properties) {
    return (item.properties as { slot?: string }).slot || null;
  }
  return null;
}

// Helper to get item bonus from properties
export function getItemBonus(item: Item): { ac?: number; attack?: number; damage?: number; abilityScores?: Record<string, number> } | null {
  if (typeof item.properties === 'object' && item.properties !== null && 'bonus' in item.properties) {
    return (item.properties as { bonus?: { ac?: number; attack?: number; damage?: number; abilityScores?: Record<string, number> } }).bonus || null;
  }
  return null;
}
