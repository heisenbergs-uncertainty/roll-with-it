import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { Button } from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const campaignCreateSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  setting: z.string().optional(),
  ruleset_id: z.string().min(1, 'Please select a ruleset'),
});

type CampaignCreateFormData = z.infer<typeof campaignCreateSchema>;

interface Ruleset {
  id: string;
  name: string;
  short_name: string;
}

export default function CampaignCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateCampaign();
  const [rulesets, setRulesets] = useState<Ruleset[]>([]);
  const [isLoadingRulesets, setIsLoadingRulesets] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignCreateFormData>({
    resolver: zodResolver(campaignCreateSchema),
  });

  useEffect(() => {
    const fetchRulesets = async () => {
      try {
        const { data, error } = await supabase
          .from('rulesets')
          .select('id, name, short_name')
          .eq('is_official', true)
          .order('name');

        if (error) throw error;
        setRulesets(data || []);
      } catch (error) {
        console.error('Error fetching rulesets:', error);
      } finally {
        setIsLoadingRulesets(false);
      }
    };

    fetchRulesets();
  }, []);

  const onSubmit = async (data: CampaignCreateFormData) => {
    try {
      console.log('Creating campaign with data:', data);
      const campaign = await createMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        setting: data.setting || undefined,
        ruleset_id: data.ruleset_id,
      });
      console.log('Campaign created successfully:', campaign);
      navigate(`/campaigns/${campaign.id}`);
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
      console.error('Error details:', err.message, err.code, err.details);
      alert(`Failed to create campaign: ${err.message || 'Please try again.'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/campaigns">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
        <p className="text-gray-600">Set up a new D&D campaign and invite your players</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Lost Mines of Phandelver"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ruleset <span className="text-red-500">*</span>
              </label>
              {isLoadingRulesets ? (
                <div className="text-sm text-gray-600">Loading rulesets...</div>
              ) : (
                <select
                  {...register('ruleset_id')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a ruleset</option>
                  {rulesets.map((ruleset) => (
                    <option key={ruleset.id} value={ruleset.id}>
                      {ruleset.name} ({ruleset.short_name})
                    </option>
                  ))}
                </select>
              )}
              {errors.ruleset_id && (
                <p className="text-red-600 text-sm mt-1">{errors.ruleset_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setting/World
              </label>
              <input
                type="text"
                {...register('setting')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Forgotten Realms, Eberron, Homebrew"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: The world or setting your campaign takes place in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe your campaign's story, themes, or house rules..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Share what players can expect from this campaign
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 sticky bottom-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <Link to="/campaigns">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}
