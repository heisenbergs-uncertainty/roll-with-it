import { calculateAbilityModifier, getProficiencyBonus } from '@roll-with-it/shared';
import type { Skills, AbilityScores } from '@roll-with-it/shared';

interface SkillsListProps {
  skills: Skills | null;
  abilityScores: AbilityScores;
  level: number;
}

interface SkillInfo {
  key: keyof Skills;
  label: string;
  ability: keyof AbilityScores;
}

const skillsData: SkillInfo[] = [
  { key: 'acrobatics', label: 'Acrobatics', ability: 'dex' },
  { key: 'animal_handling', label: 'Animal Handling', ability: 'wis' },
  { key: 'arcana', label: 'Arcana', ability: 'int' },
  { key: 'athletics', label: 'Athletics', ability: 'str' },
  { key: 'deception', label: 'Deception', ability: 'cha' },
  { key: 'history', label: 'History', ability: 'int' },
  { key: 'insight', label: 'Insight', ability: 'wis' },
  { key: 'intimidation', label: 'Intimidation', ability: 'cha' },
  { key: 'investigation', label: 'Investigation', ability: 'int' },
  { key: 'medicine', label: 'Medicine', ability: 'wis' },
  { key: 'nature', label: 'Nature', ability: 'int' },
  { key: 'perception', label: 'Perception', ability: 'wis' },
  { key: 'performance', label: 'Performance', ability: 'cha' },
  { key: 'persuasion', label: 'Persuasion', ability: 'cha' },
  { key: 'religion', label: 'Religion', ability: 'int' },
  { key: 'sleight_of_hand', label: 'Sleight of Hand', ability: 'dex' },
  { key: 'stealth', label: 'Stealth', ability: 'dex' },
  { key: 'survival', label: 'Survival', ability: 'wis' },
];

export function SkillsList({ skills, abilityScores, level }: SkillsListProps) {
  const proficiencyBonus = getProficiencyBonus(level);

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
      <div className="space-y-2">
        {skillsData.map(({ key, label, ability }) => {
          const abilityModifier = calculateAbilityModifier(abilityScores[ability]);
          const skill = skills?.[key];
          const isProficient = skill?.proficient || false;
          const hasExpertise = skill?.expertise || false;

          let totalBonus = abilityModifier;
          if (hasExpertise) {
            totalBonus += proficiencyBonus * 2;
          } else if (isProficient) {
            totalBonus += proficiencyBonus;
          }

          const bonusText = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {/* Proficiency indicator */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      hasExpertise
                        ? 'bg-blue-600 border-blue-600'
                        : isProficient
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {hasExpertise && (
                      <span className="text-white text-xs font-bold">×2</span>
                    )}
                    {isProficient && !hasExpertise && (
                      <span className="text-white text-xs">•</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {label}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {ability}
                  </div>
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
