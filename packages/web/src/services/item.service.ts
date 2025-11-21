import { supabase } from '@/lib/supabase';
import type { Item } from '@roll-with-it/shared';

class ItemService {
  /**
   * Fetch all items from the database
   */
  async getItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching items:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Fetch items by IDs (useful for getting inventory item details)
   */
  async getItemsByIds(ids: string[]): Promise<Item[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching items by IDs:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Search items by name or type
   */
  async searchItems(query: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .or(`name.ilike.%${query}%,type.ilike.%${query}%,subtype.ilike.%${query}%`)
      .order('name')
      .limit(20);

    if (error) {
      console.error('Error searching items:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single item by ID
   */
  async getItem(id: string): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching item:', error);
      throw error;
    }

    return data;
  }
}

export const itemService = new ItemService();
