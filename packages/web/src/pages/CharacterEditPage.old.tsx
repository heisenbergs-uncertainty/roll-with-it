import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCharacter, useUpdateCharacter } from '@/hooks/useCharacters';
import { Button } from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react';

const characterEditSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  level: z.number().min(1).max(20),
  experience_points: z.number().min(0),
  hit_points_max: z.number().min(1),
  hit_points_current: z.number().min(0),
  armor_class: z.number().min(1),
  speed: z.number().min(0),
  ability_scores: z.object({
    str: z.number().min(1).max(30),
    dex: z.number().min(1).max(30),
    con: z.number().min(1).max(30),
    int: z.number().min(1).max(30),
    wis: z.number().min(1).max(30),
    cha: z.number().min(1).max(30),
  }),
});

type CharacterEditFormData = z.infer<typeof characterEditSchema>;

export default function CharacterEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: character, isLoading, error } = useCharacter(id!);
  const updateMutation = useUpdateCharacter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CharacterEditFormData>({
    resolver: zodResolver(characterEditSchema),
    values: character
      ? {
          name: character.name,
          level: character.level,
          experience_points: character.experience_points || 0,
          hit_points_max: character.hit_points_max || 10,
          hit_points_current: character.hit_points_current || 10,
          armor_class: character.armor_class || 10,
          speed: character.speed || 30,
          ability_scores: character.ability_scores,
        }
      : undefined,
  });

  const onSubmit = async (data: CharacterEditFormData) => {
    if (!character) return;

    try {
      await updateMutation.mutateAsync({
        id: character.id,
        updates: data,
      });
      navigate(`/characters/${character.id}`);
    } catch (err: any) {
      console.error('Failed to update character:', err);
      alert('Failed to update character. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading character...</div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600 mb-4">
            Failed to load character
          </div>
          <Link to="/characters">
            <Button variant="outline">Back to Characters</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to={`/characters/${character.id}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Character Sheet
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Edit {character.name}
        </h1>
        <p className="text-gray-600">
          Level {character.level} {character.race?.name} {character.class?.name}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Character Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <input
                type="number"
                {...register('level', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="20"
              />
              {errors.level && (
                <p className="text-red-600 text-sm mt-1">{errors.level.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Points
              </label>
              <input
                type="number"
                {...register('experience_points', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              {errors.experience_points && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.experience_points.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ability Scores</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => (
              <div key={ability}>
                <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                  {ability}
                </label>
                <input
                  type="number"
                  {...register(`ability_scores.${ability}`, { valueAsNumber: true })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="30"
                />
                {errors.ability_scores?.[ability] && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.ability_scores[ability]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Combat Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max HP
              </label>
              <input
                type="number"
                {...register('hit_points_max', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              {errors.hit_points_max && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hit_points_max.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current HP
              </label>
              <input
                type="number"
                {...register('hit_points_current', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              {errors.hit_points_current && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hit_points_current.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Armor Class
              </label>
              <input
                type="number"
                {...register('armor_class', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              {errors.armor_class && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.armor_class.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed (ft)
              </label>
              <input
                type="number"
                {...register('speed', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              {errors.speed && (
                <p className="text-red-600 text-sm mt-1">{errors.speed.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Link to={`/characters/${character.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
