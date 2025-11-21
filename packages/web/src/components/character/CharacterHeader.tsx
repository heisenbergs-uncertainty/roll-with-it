import type { CharacterWithFullRelations } from '@/types/database';

interface CharacterHeaderProps {
  character: CharacterWithFullRelations;
}

export function CharacterHeader({ character }: CharacterHeaderProps) {
  return (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {character.name}
          </h1>
          <p className="text-lg text-gray-600">
            Level {character.level}{' '}
            {character.race?.name || 'Unknown Race'}{' '}
            {character.class?.name || 'Unknown Class'}
            {character.subclass && ` (${character.subclass.name})`}
          </p>
          {character.background && (
            <p className="text-sm text-gray-500 mt-1">
              Background: {character.background.name}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Experience Points</div>
          <div className="text-2xl font-bold text-gray-900">
            {character.experience_points || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
