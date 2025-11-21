import { calculateAbilityModifier } from '@roll-with-it/shared';
import type { Character } from '@roll-with-it/shared';

interface CombatStatsProps {
  character: Character;
}

export function CombatStats({ character }: CombatStatsProps) {
  const dexModifier = calculateAbilityModifier(character.ability_scores.dex);
  const initiative = character.initiative_bonus ?? dexModifier;
  const initiativeText = initiative >= 0 ? `+${initiative}` : `${initiative}`;

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Combat Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Hit Points */}
        <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs font-semibold text-red-600 uppercase mb-1">
            Hit Points
          </div>
          <div className="flex items-baseline gap-1">
            <div className="text-3xl font-bold text-red-700">
              {character.hit_points_current ?? character.hit_points_max ?? 0}
            </div>
            <div className="text-lg text-red-600">
              / {character.hit_points_max ?? 0}
            </div>
          </div>
          {character.temporary_hit_points > 0 && (
            <div className="text-sm text-red-600 mt-1">
              +{character.temporary_hit_points} temp
            </div>
          )}
        </div>

        {/* Armor Class */}
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-blue-600 uppercase mb-1">
            Armor Class
          </div>
          <div className="text-3xl font-bold text-blue-700">
            {character.armor_class ?? 10 + dexModifier}
          </div>
        </div>

        {/* Initiative */}
        <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs font-semibold text-green-600 uppercase mb-1">
            Initiative
          </div>
          <div className="text-3xl font-bold text-green-700">
            {initiativeText}
          </div>
        </div>

        {/* Speed */}
        <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-xs font-semibold text-purple-600 uppercase mb-1">
            Speed
          </div>
          <div className="text-3xl font-bold text-purple-700">
            {character.speed ?? 30}
          </div>
          <div className="text-xs text-purple-600">ft</div>
        </div>
      </div>

      {/* Proficiency Bonus */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Proficiency Bonus
          </span>
          <span className="text-lg font-bold text-gray-900">
            +{character.proficiency_bonus ?? 2}
          </span>
        </div>
      </div>
    </div>
  );
}
