import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/common/Button';
import { useRulesets, useRacesByRuleset, useClassesByRuleset } from '@/hooks/useContent';

const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  ruleset_id: z.string().uuid('Please select a ruleset'),
  race_id: z.string().uuid('Please select a race'),
  class_id: z.string().uuid('Please select a class'),
  level: z.number().min(1).max(20),
});

type CharacterFormData = z.infer<typeof characterSchema>;

export default function CharacterCreatePage() {
  const navigate = useNavigate();
  const { data: rulesets } = useRulesets();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      level: 1,
    },
  });

  const rulesetId = watch('ruleset_id');
  const { data: races, isLoading: racesLoading } = useRacesByRuleset(rulesetId);
  const { data: classes, isLoading: classesLoading } = useClassesByRuleset(rulesetId);

  const createMutation = useMutation({
    mutationFn: async (data: CharacterFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: character, error } = await supabase
        .from('characters')
        .insert({
          ...data,
          user_id: user.user.id,
          ability_scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          hit_points_max: 10,
          hit_points_current: 10,
          armor_class: 10,
          speed: 30,
        })
        .select()
        .single();

      if (error) throw error;
      return character;
    },
    onSuccess: (character) => {
      navigate(`/characters/${character.id}`);
    },
    onError: (error) => {
      console.error('Error creating character:', error);
      alert('Failed to create character. Please try again.');
    },
  });

  const onSubmit = (data: CharacterFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Character</h1>
      <p className="text-gray-600 mb-6">
        Start creating your D&D character by filling out the basic information below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Character Name *
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter character name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ruleset *
          </label>
          <select
            {...register('ruleset_id')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select ruleset...</option>
            {rulesets?.map((ruleset) => (
              <option key={ruleset.id} value={ruleset.id}>
                {ruleset.name}
              </option>
            ))}
          </select>
          {errors.ruleset_id && (
            <p className="text-red-600 text-sm mt-1">{errors.ruleset_id.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            The ruleset determines what races, classes, and content are available.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Race *</label>
          <select
            {...register('race_id')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!rulesetId || racesLoading}
          >
            <option value="">
              {!rulesetId
                ? 'Select a ruleset first...'
                : racesLoading
                ? 'Loading races...'
                : 'Select race...'}
            </option>
            {races?.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name}
              </option>
            ))}
          </select>
          {errors.race_id && (
            <p className="text-red-600 text-sm mt-1">{errors.race_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
          <select
            {...register('class_id')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!rulesetId || classesLoading}
          >
            <option value="">
              {!rulesetId
                ? 'Select a ruleset first...'
                : classesLoading
                ? 'Loading classes...'
                : 'Select class...'}
            </option>
            {classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.class_id && (
            <p className="text-red-600 text-sm mt-1">{errors.class_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starting Level *
          </label>
          <input
            type="number"
            {...register('level', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
            max={20}
          />
          {errors.level && (
            <p className="text-red-600 text-sm mt-1">{errors.level.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Most campaigns start at level 1. Ask your DM if unsure.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Character'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/characters')}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a simplified character creator. We'll set default ability
          scores and stats for now. You'll be able to customize everything in the full character
          builder coming soon!
        </p>
      </div>
    </div>
  );
}
