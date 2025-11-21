import { useState, useEffect } from 'react';
import type { Skills } from '@roll-with-it/shared';

interface SkillProficiencyEditorProps {
  skills: Skills | null;
  onChange: (skills: Skills) => void;
}

interface SkillInfo {
  key: keyof Skills;
  label: string;
  ability: string;
}

const skillsData: SkillInfo[] = [
  { key: 'acrobatics', label: 'Acrobatics', ability: 'DEX' },
  { key: 'animal_handling', label: 'Animal Handling', ability: 'WIS' },
  { key: 'arcana', label: 'Arcana', ability: 'INT' },
  { key: 'athletics', label: 'Athletics', ability: 'STR' },
  { key: 'deception', label: 'Deception', ability: 'CHA' },
  { key: 'history', label: 'History', ability: 'INT' },
  { key: 'insight', label: 'Insight', ability: 'WIS' },
  { key: 'intimidation', label: 'Intimidation', ability: 'CHA' },
  { key: 'investigation', label: 'Investigation', ability: 'INT' },
  { key: 'medicine', label: 'Medicine', ability: 'WIS' },
  { key: 'nature', label: 'Nature', ability: 'INT' },
  { key: 'perception', label: 'Perception', ability: 'WIS' },
  { key: 'performance', label: 'Performance', ability: 'CHA' },
  { key: 'persuasion', label: 'Persuasion', ability: 'CHA' },
  { key: 'religion', label: 'Religion', ability: 'INT' },
  { key: 'sleight_of_hand', label: 'Sleight of Hand', ability: 'DEX' },
  { key: 'stealth', label: 'Stealth', ability: 'DEX' },
  { key: 'survival', label: 'Survival', ability: 'WIS' },
];

const defaultSkill = { proficient: false, expertise: false, bonus: 0 };

const createDefaultSkills = (): Skills => ({
  acrobatics: defaultSkill,
  animal_handling: defaultSkill,
  arcana: defaultSkill,
  athletics: defaultSkill,
  deception: defaultSkill,
  history: defaultSkill,
  insight: defaultSkill,
  intimidation: defaultSkill,
  investigation: defaultSkill,
  medicine: defaultSkill,
  nature: defaultSkill,
  perception: defaultSkill,
  performance: defaultSkill,
  persuasion: defaultSkill,
  religion: defaultSkill,
  sleight_of_hand: defaultSkill,
  stealth: defaultSkill,
  survival: defaultSkill,
});

export function SkillProficiencyEditor({ skills, onChange }: SkillProficiencyEditorProps) {
  const [localSkills, setLocalSkills] = useState<Skills>(
    skills || createDefaultSkills()
  );

  useEffect(() => {
    if (skills) {
      setLocalSkills(skills);
    }
  }, [skills]);

  const handleSkillChange = (
    skillKey: keyof Skills,
    field: 'proficient' | 'expertise',
    value: boolean
  ) => {
    const updatedSkills = {
      ...localSkills,
      [skillKey]: {
        ...localSkills[skillKey],
        [field]: value,
        // If setting expertise, also set proficient
        ...(field === 'expertise' && value ? { proficient: true } : {}),
        // If removing proficient, also remove expertise
        ...(field === 'proficient' && !value ? { expertise: false } : {}),
      },
    };
    setLocalSkills(updatedSkills);
    onChange(updatedSkills);
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Skill Proficiencies</h2>
      <p className="text-sm text-gray-600 mb-4">
        Select which skills your character is proficient in. Rogues and Bards can have expertise in some skills.
      </p>

      <div className="space-y-2">
        {skillsData.map(({ key, label, ability }) => {
          const skill = localSkills[key] || defaultSkill;

          return (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {/* Proficient checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skill.proficient}
                      onChange={(e) =>
                        handleSkillChange(key, 'proficient', e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="sr-only">Proficient</span>
                  </label>

                  {/* Expertise checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skill.expertise}
                      onChange={(e) =>
                        handleSkillChange(key, 'expertise', e.target.checked)
                      }
                      disabled={!skill.proficient}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="sr-only">Expertise</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">
                    ({ability})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {skill.expertise && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Expertise
                  </span>
                )}
                {skill.proficient && !skill.expertise && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Proficient
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Left checkbox = Proficient (adds proficiency bonus),
          Right checkbox = Expertise (doubles proficiency bonus). Expertise requires proficiency.
        </p>
      </div>
    </div>
  );
}
