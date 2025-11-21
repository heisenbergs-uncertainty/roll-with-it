import { supabase } from '@/lib/supabase';
import type { Campaign, CampaignMember, CampaignCharacter, Session } from '@roll-with-it/shared';

class CampaignService {
  /**
   * Get all campaigns for the current user (owned or member)
   */
  async getCampaigns(): Promise<Campaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(id: string): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaign: {
    name: string;
    description?: string;
    setting?: string;
    ruleset_id: string;
  }): Promise<Campaign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Clean up the campaign data - convert empty strings to null
    const campaignData = {
      name: campaign.name,
      description: campaign.description || null,
      setting: campaign.setting || null,
      ruleset_id: campaign.ruleset_id,
      user_id: user.id,
      status: 'planning' as const,
    };

    console.log('Inserting campaign:', campaignData);

    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a campaign
   */
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign members
   */
  async getCampaignMembers(campaignId: string): Promise<CampaignMember[]> {
    const { data, error } = await supabase
      .from('campaign_members')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching campaign members:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Add a member to a campaign
   */
  async addCampaignMember(campaignId: string, userId: string, role: 'dm' | 'player' = 'player'): Promise<CampaignMember> {
    const { data, error } = await supabase
      .from('campaign_members')
      .insert({
        campaign_id: campaignId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding campaign member:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove a member from a campaign
   */
  async removeCampaignMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('campaign_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error removing campaign member:', error);
      throw error;
    }
  }

  /**
   * Get characters in a campaign
   */
  async getCampaignCharacters(campaignId: string): Promise<CampaignCharacter[]> {
    const { data, error } = await supabase
      .from('campaign_characters')
      .select(`
        *,
        character:characters(*)
      `)
      .eq('campaign_id', campaignId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching campaign characters:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Add a character to a campaign
   */
  async addCampaignCharacter(campaignId: string, characterId: string, role: 'player' | 'dm_pc' | 'npc' = 'player'): Promise<CampaignCharacter> {
    const { data, error } = await supabase
      .from('campaign_characters')
      .insert({
        campaign_id: campaignId,
        character_id: characterId,
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding character to campaign:', error);
      throw error;
    }

    return data;
  }

  /**
   * Remove a character from a campaign
   */
  async removeCampaignCharacter(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaign_characters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing character from campaign:', error);
      throw error;
    }
  }

  /**
   * Get sessions for a campaign
   */
  async getCampaignSessions(campaignId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('session_number', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new session
   */
  async createSession(session: {
    campaign_id: string;
    session_number?: number;
    session_date?: string;
    title?: string;
    summary?: string;
    notes?: string;
  }): Promise<Session> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        ...session,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    // Update campaign session_count - fetch current campaign and increment
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('session_count')
      .eq('id', session.campaign_id)
      .single();

    if (campaign) {
      await supabase
        .from('campaigns')
        .update({ session_count: (campaign.session_count || 0) + 1 })
        .eq('id', session.campaign_id);
    }

    return data;
  }

  /**
   * Update a session
   */
  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a session
   */
  async deleteSession(id: string, campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }

    // Update campaign session_count - fetch current campaign and decrement
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('session_count')
      .eq('id', campaignId)
      .single();

    if (campaign && campaign.session_count > 0) {
      await supabase
        .from('campaigns')
        .update({ session_count: campaign.session_count - 1 })
        .eq('id', campaignId);
    }
  }
}

export const campaignService = new CampaignService();
