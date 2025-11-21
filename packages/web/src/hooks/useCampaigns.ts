import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/services/campaign.service';
import type { Campaign, CampaignMember, CampaignCharacter, Session } from '@roll-with-it/shared';

/**
 * Hook to fetch all campaigns for the current user
 */
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getCampaigns(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single campaign
 */
export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignService.getCampaign(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to create a campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaign: {
      name: string;
      description?: string;
      setting?: string;
      ruleset_id: string;
    }) => campaignService.createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

/**
 * Hook to update a campaign
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Campaign> }) =>
      campaignService.updateCampaign(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] });
    },
  });
}

/**
 * Hook to delete a campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

/**
 * Hook to fetch campaign members
 */
export function useCampaignMembers(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'members'],
    queryFn: () => campaignService.getCampaignMembers(campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to add a campaign member
 */
export function useAddCampaignMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, userId, role }: { campaignId: string; userId: string; role?: 'dm' | 'player' }) =>
      campaignService.addCampaignMember(campaignId, userId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId, 'members'] });
    },
  });
}

/**
 * Hook to remove a campaign member
 */
export function useRemoveCampaignMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, campaignId }: { memberId: string; campaignId: string }) =>
      campaignService.removeCampaignMember(memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId, 'members'] });
    },
  });
}

/**
 * Hook to fetch campaign characters
 */
export function useCampaignCharacters(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'characters'],
    queryFn: () => campaignService.getCampaignCharacters(campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to add a character to a campaign
 */
export function useAddCampaignCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, characterId, role }: { campaignId: string; characterId: string; role?: 'player' | 'dm_pc' | 'npc' }) =>
      campaignService.addCampaignCharacter(campaignId, characterId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId, 'characters'] });
    },
  });
}

/**
 * Hook to remove a character from a campaign
 */
export function useRemoveCampaignCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, campaignId }: { id: string; campaignId: string }) =>
      campaignService.removeCampaignCharacter(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId, 'characters'] });
    },
  });
}

/**
 * Hook to fetch campaign sessions
 */
export function useCampaignSessions(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'sessions'],
    queryFn: () => campaignService.getCampaignSessions(campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to create a session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: {
      campaign_id: string;
      session_number?: number;
      session_date?: string;
      title?: string;
      summary?: string;
      notes?: string;
    }) => campaignService.createSession(session),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.campaign_id, 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.campaign_id] });
    },
  });
}

/**
 * Hook to update a session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates, campaignId }: { id: string; updates: Partial<Session>; campaignId: string }) =>
      campaignService.updateSession(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId, 'sessions'] });
    },
  });
}

/**
 * Hook to delete a session
 */
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, campaignId }: { id: string; campaignId: string }) =>
      campaignService.deleteSession(id, campaignId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId, 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId] });
    },
  });
}
