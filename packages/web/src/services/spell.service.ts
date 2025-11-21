import { supabase } from '@/lib/supabase';
import type { Spell } from '@roll-with-it/shared/types/supabase';

class SpellService {
  /**
   * Get all spells from the database
   */
  async getSpells(): Promise<Spell[]> {
    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching spells:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get spells by IDs (for character spell lists)
   */
  async getSpellsByIds(ids: string[]): Promise<Spell[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .in('id', ids)
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching spells by IDs:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get spells by level
   */
  async getSpellsByLevel(level: number): Promise<Spell[]> {
    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .eq('level', level)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching spells by level:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get spells by class
   */
  async getSpellsByClass(className: string): Promise<Spell[]> {
    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .contains('classes', [className])
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching spells by class:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Search spells by name
   */
  async searchSpells(query: string): Promise<Spell[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('level', { ascending: true })
      .order('name', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error searching spells:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single spell by ID
   */
  async getSpell(id: string): Promise<Spell> {
    const { data, error } = await supabase
      .from('spells')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching spell:', error);
      throw error;
    }

    return data;
  }

  /**
   * Filter spells with advanced criteria
   */
  async filterSpells(filters: {
    levels?: number[];
    schools?: string[];
    classes?: string[];
    concentration?: boolean;
    ritual?: boolean;
  }): Promise<Spell[]> {
    let query = supabase.from('spells').select('*');

    if (filters.levels && filters.levels.length > 0) {
      query = query.in('level', filters.levels);
    }

    if (filters.schools && filters.schools.length > 0) {
      query = query.in('school', filters.schools);
    }

    if (filters.classes && filters.classes.length > 0) {
      // For JSONB array contains, we need to check if the classes array overlaps
      query = query.overlaps('classes', filters.classes);
    }

    if (filters.concentration !== undefined) {
      query = query.eq('concentration', filters.concentration);
    }

    if (filters.ritual !== undefined) {
      query = query.eq('ritual', filters.ritual);
    }

    query = query.order('level', { ascending: true }).order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error filtering spells:', error);
      throw error;
    }

    return data || [];
  }
}

export const spellService = new SpellService();
