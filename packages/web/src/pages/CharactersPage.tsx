import { useCharacters, useDeleteCharacter } from '@/hooks/useCharacters';
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

export default function CharactersPage() {
  const { data: characters, isLoading } = useCharacters();
  const deleteMutation = useDeleteCharacter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading characters...</div>
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚔️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Characters Yet</h2>
        <p className="text-gray-600 mb-6">Create your first character to get started</p>
        <Link to="/characters/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Character
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Characters</h1>
          <p className="text-gray-600 mt-1">Manage your D&D characters</p>
        </div>
        <Link to="/characters/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Character
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <div
            key={character.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
                <p className="text-sm text-gray-600">
                  Level {character.level} {character.race?.name || 'Unknown'}{' '}
                  {character.class?.name || 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete ${character.name}?`)) {
                    deleteMutation.mutate(character.id);
                  }
                }}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Delete character"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-500 block text-xs">HP</span>
                <p className="font-semibold">
                  {character.hit_points_current || 0}/{character.hit_points_max || 0}
                </p>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">AC</span>
                <p className="font-semibold">{character.armor_class || 10}</p>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Speed</span>
                <p className="font-semibold">{character.speed || 30} ft</p>
              </div>
            </div>

            <Link to={`/characters/${character.id}`}>
              <Button variant="outline" className="w-full" size="sm">
                View Sheet
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
