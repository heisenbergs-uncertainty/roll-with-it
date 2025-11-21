import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useCampaign,
  useCampaignCharacters,
  useCampaignSessions,
  useDeleteCampaign,
  useUpdateCampaign,
  useAddCampaignCharacter,
  useRemoveCampaignCharacter,
} from '@/hooks/useCampaigns';
import { useCharacters } from '@/hooks/useCharacters';
import { Button } from '@/components/common/Button';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Users,
  Calendar,
  BookOpen,
  Play,
  Pause,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading, error } = useCampaign(id);
  const { data: campaignCharacters = [] } = useCampaignCharacters(id);
  const { data: sessions = [] } = useCampaignSessions(id);
  const { data: userCharacters = [] } = useCharacters();
  const deleteMutation = useDeleteCampaign();
  const updateMutation = useUpdateCampaign();
  const addCharacterMutation = useAddCampaignCharacter();
  const removeCharacterMutation = useRemoveCampaignCharacter();

  const [showAddCharacter, setShowAddCharacter] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState('');

  const handleDelete = async () => {
    if (!campaign) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${campaign.name}"? This will delete all sessions and remove all characters. This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(campaign.id);
        navigate('/campaigns');
      } catch (error) {
        console.error('Failed to delete campaign:', error);
        alert('Failed to delete campaign. Please try again.');
      }
    }
  };

  const handleStatusChange = async (newStatus: 'planning' | 'active' | 'on_hold' | 'completed') => {
    if (!campaign) return;

    try {
      await updateMutation.mutateAsync({
        id: campaign.id,
        updates: { status: newStatus },
      });
    } catch (error) {
      console.error('Failed to update campaign status:', error);
      alert('Failed to update campaign status. Please try again.');
    }
  };

  const handleAddCharacter = async () => {
    if (!selectedCharacterId || !campaign) return;

    try {
      await addCharacterMutation.mutateAsync({
        campaignId: campaign.id,
        characterId: selectedCharacterId,
        role: 'player',
      });
      setSelectedCharacterId('');
      setShowAddCharacter(false);
    } catch (error) {
      console.error('Failed to add character:', error);
      alert('Failed to add character to campaign. They may already be in this campaign.');
    }
  };

  const handleRemoveCharacter = async (characterId: string) => {
    const campaignChar = campaignCharacters.find(cc => (cc as any).character_id === characterId);
    if (!campaignChar) return;

    const confirmed = window.confirm('Remove this character from the campaign?');
    if (!confirmed) return;

    try {
      await removeCharacterMutation.mutateAsync({
        id: campaignChar.id,
        campaignId: campaign!.id,
      });
    } catch (error) {
      console.error('Failed to remove character:', error);
      alert('Failed to remove character. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-5 w-5 text-green-600" />;
      case 'planning':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'on_hold':
        return <Pause className="h-5 w-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  // Filter out characters already in campaign
  const campaignCharacterIds = campaignCharacters.map(cc => (cc as any).character_id);
  const availableCharacters = userCharacters.filter(
    char => !campaignCharacterIds.includes(char.id)
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading campaign...</div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600 mb-4">Failed to load campaign</div>
          <Link to="/campaigns">
            <Button variant="outline">Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/campaigns">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Campaign Header */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <div className="flex items-center gap-1">
                {getStatusIcon(campaign.status)}
              </div>
            </div>
            {campaign.setting && (
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Setting:</span> {campaign.setting}
              </p>
            )}
            {campaign.description && (
              <p className="text-gray-700 mt-3">{campaign.description}</p>
            )}
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant={campaign.status === 'planning' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('planning')}
            disabled={updateMutation.isPending}
          >
            Planning
          </Button>
          <Button
            size="sm"
            variant={campaign.status === 'active' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('active')}
            disabled={updateMutation.isPending}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={campaign.status === 'on_hold' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('on_hold')}
            disabled={updateMutation.isPending}
          >
            On Hold
          </Button>
          <Button
            size="sm"
            variant={campaign.status === 'completed' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('completed')}
            disabled={updateMutation.isPending}
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Characters */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Characters ({campaignCharacters.length})
            </h2>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setShowAddCharacter(!showAddCharacter)}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {showAddCharacter && (
            <div className="mb-4 p-4 border rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Character
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCharacterId}
                  onChange={(e) => setSelectedCharacterId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Choose a character...</option>
                  {availableCharacters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name} - Level {char.level} {char.race?.name} {char.class?.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleAddCharacter}
                  disabled={!selectedCharacterId || addCharacterMutation.isPending}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {campaignCharacters.length === 0 ? (
            <p className="text-gray-600 text-sm">No characters in this campaign yet</p>
          ) : (
            <div className="space-y-2">
              {campaignCharacters.map((cc: any) => {
                const character = cc.character;
                if (!character) return null;

                return (
                  <div
                    key={cc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <Link to={`/characters/${character.id}`} className="flex-1">
                      <div className="font-medium text-gray-900">{character.name}</div>
                      <div className="text-sm text-gray-600">
                        Level {character.level} {character.race?.name} {character.class?.name}
                      </div>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveCharacter(character.id)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Sessions ({campaign.session_count})
            </h2>
            <Link to={`/campaigns/${campaign.id}/sessions/new`}>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </Link>
          </div>

          {sessions.length === 0 ? (
            <p className="text-gray-600 text-sm">No sessions recorded yet</p>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {session.title || `Session ${session.session_number}`}
                      </div>
                      {session.session_date && (
                        <div className="text-sm text-gray-600">
                          {format(new Date(session.session_date), 'MMMM d, yyyy')}
                        </div>
                      )}
                      {session.summary && (
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {sessions.length > 5 && (
                <div className="text-center pt-2">
                  <Link to={`/campaigns/${campaign.id}/sessions`}>
                    <Button variant="ghost" size="sm">
                      View all sessions
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
