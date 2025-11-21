import { supabase } from '@/lib/supabase';
import type { CharacterWithRelations, CharacterWithFullRelations } from '@/types/database';
import type { Character } from '@roll-with-it/shared';

export const characterService = {
  async getCharacters(): Promise<CharacterWithRelations[]> {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        race:races(name),
        class:classes(name)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CharacterWithRelations[];
  },

  async getCharacter(id: string): Promise<CharacterWithFullRelations> {
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
    return data as CharacterWithFullRelations;
  },

  async updateCharacter(id: string, updates: Partial<Character>): Promise<CharacterWithFullRelations> {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        race:races(*),
        class:classes(*),
        subclass:subclasses(*),
        background:backgrounds(*)
      `)
      .single();

    if (error) throw error;
    return data as CharacterWithFullRelations;
  },

  async deleteCharacter(id: string): Promise<void> {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
