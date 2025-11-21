import { calculateAbilityModifier } from '@roll-with-it/shared';
import type { AbilityScores } from '@roll-with-it/shared';

interface AbilityScoresProps {
  abilityScores: AbilityScores;
}

const abilities = [
  { key: 'str' as const, label: 'Strength', abbr: 'STR' },
  { key: 'dex' as const, label: 'Dexterity', abbr: 'DEX' },
  { key: 'con' as const, label: 'Constitution', abbr: 'CON' },
  { key: 'int' as const, label: 'Intelligence', abbr: 'INT' },
  { key: 'wis' as const, label: 'Wisdom', abbr: 'WIS' },
  { key: 'cha' as const, label: 'Charisma', abbr: 'CHA' },
];

export function AbilityScores({ abilityScores }: AbilityScoresProps) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Ability Scores</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {abilities.map(({ key, label, abbr }) => {
          const score = abilityScores[key];
          const modifier = calculateAbilityModifier(score);
          const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

          return (
            <div
              key={key}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                {abbr}
              </div>
              <div className="text-sm text-gray-600 mb-2">{label}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {score}
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {modifierText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
