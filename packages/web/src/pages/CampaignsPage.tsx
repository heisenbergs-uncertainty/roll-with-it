import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns, useCreateCampaign } from '@/hooks/useCampaigns';
import { Button } from '@/components/common/Button';
import { Plus, Users, Calendar, Play, Pause, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const planningCampaigns = campaigns.filter(c => c.status === 'planning');
  const onHoldCampaigns = campaigns.filter(c => c.status === 'on_hold');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'planning':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'on_hold':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'planning':
        return 'Planning';
      case 'on_hold':
        return 'On Hold';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-2">Your D&D campaigns</p>
        </div>
        <Link to="/campaigns/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🎲</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h2>
          <p className="text-gray-600 mb-4">Start a new campaign or join an existing one</p>
          <Link to="/campaigns/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Campaign
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Campaigns */}
          {activeCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Active Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCampaigns.map((campaign) => (
                  <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {campaign.session_count} sessions
                        </span>
                        <span className="text-xs">
                          {format(new Date(campaign.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Planning Campaigns */}
          {planningCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Planning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planningCampaigns.map((campaign) => (
                  <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* On Hold Campaigns */}
          {onHoldCampaigns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">On Hold</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {onHoldCampaigns.map((campaign) => (
                  <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer opacity-75">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {campaign.session_count} sessions
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Completed Campaigns */}
          {completedCampaigns.length > 0 && (
            <details className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <summary className="cursor-pointer font-semibold text-gray-900">
                Completed Campaigns ({completedCampaigns.length})
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {completedCampaigns.map((campaign) => (
                  <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer opacity-60">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {campaign.session_count} sessions
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
