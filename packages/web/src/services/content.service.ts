import { supabase } from '@/lib/supabase';
import type { Ruleset, Source, Race, Class, Spell, Item } from '@roll-with-it/shared';

export const contentService = {
  // Rulesets
  async getRulesets(): Promise<Ruleset[]> {
    const { data, error } = await supabase.from('rulesets').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async getRuleset(id: string): Promise<Ruleset> {
    const { data, error } = await supabase.from('rulesets').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Sources
  async getSourcesByRuleset(rulesetId: string): Promise<Source[]> {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('ruleset_id', rulesetId)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getSource(id: string): Promise<Source> {
    const { data, error } = await supabase.from('sources').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Races
  async getRacesByRuleset(rulesetId: string): Promise<Race[]> {
    const { data, error } = await supabase
      .from('races')
      .select(
        `
        *,
        source:sources!inner(ruleset_id)
      `
      )
      .eq('source.ruleset_id', rulesetId)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getRace(id: string): Promise<Race> {
    const { data, error } = await supabase.from('races').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Classes
  async getClassesByRuleset(rulesetId: string): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select(
        `
        *,
        source:sources!inner(ruleset_id)
      `
      )
      .eq('source.ruleset_id', rulesetId)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getClass(id: string): Promise<Class> {
    const { data, error } = await supabase.from('classes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Spells
  async getSpellsByRuleset(rulesetId: string, filters?: { level?: number; school?: string }): Promise<Spell[]> {
    let query = supabase
      .from('spells')
      .select(
        `
        *,
        source:sources!inner(ruleset_id)
      `
      )
      .eq('source.ruleset_id', rulesetId);

    if (filters?.level !== undefined) {
      query = query.eq('level', filters.level);
    }
    if (filters?.school) {
      query = query.eq('school', filters.school);
    }

    const { data, error } = await query.order('level').order('name');
    if (error) throw error;
    return data || [];
  },

  async getSpell(id: string): Promise<Spell> {
    const { data, error } = await supabase.from('spells').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Items
  async getItemsByRuleset(rulesetId: string, filters?: { type?: string; rarity?: string }): Promise<Item[]> {
    let query = supabase
      .from('items')
      .select(
        `
        *,
        source:sources!inner(ruleset_id)
      `
      )
      .eq('source.ruleset_id', rulesetId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.rarity) {
      query = query.eq('rarity', filters.rarity);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    return data || [];
  },

  async getItem(id: string): Promise<Item> {
    const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
};
