import { calculateAbilityModifier, getProficiencyBonus } from '@roll-with-it/shared';
import type { SavingThrows, AbilityScores } from '@roll-with-it/shared';

interface SavingThrowsProps {
  savingThrows: SavingThrows | null;
  abilityScores: AbilityScores;
  level: number;
}

const abilities = [
  { key: 'str' as const, label: 'Strength' },
  { key: 'dex' as const, label: 'Dexterity' },
  { key: 'con' as const, label: 'Constitution' },
  { key: 'int' as const, label: 'Intelligence' },
  { key: 'wis' as const, label: 'Wisdom' },
  { key: 'cha' as const, label: 'Charisma' },
];

export function SavingThrows({ savingThrows, abilityScores, level }: SavingThrowsProps) {
  const proficiencyBonus = getProficiencyBonus(level);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Saving Throws</h2>
      <div className="space-y-2">
        {abilities.map(({ key, label }) => {
          const abilityModifier = calculateAbilityModifier(abilityScores[key]);
          const savingThrow = savingThrows?.[key];
          const isProficient = savingThrow?.proficient || false;

          const totalBonus = isProficient
            ? abilityModifier + proficiencyBonus
            : abilityModifier;

          const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isProficient
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {isProficient && (
                    <span className="text-white text-xs">•</span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {label}
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {bonusText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
