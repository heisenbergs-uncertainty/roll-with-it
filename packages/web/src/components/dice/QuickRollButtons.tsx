import { Dices } from 'lucide-react';
import { useDiceRoller } from '../../contexts/DiceRollerContext';
import { getAbilityModifier } from '../../utils/dice';

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface QuickRollButtonsProps {
  abilityScores: AbilityScores;
  proficiencyBonus?: number;
  skillProficiencies?: string[];
}

const ABILITY_NAMES = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
} as const;

const SKILLS = {
  acrobatics: { ability: 'dexterity', name: 'Acrobatics' },
  animalHandling: { ability: 'wisdom', name: 'Animal Handling' },
  arcana: { ability: 'intelligence', name: 'Arcana' },
  athletics: { ability: 'strength', name: 'Athletics' },
  deception: { ability: 'charisma', name: 'Deception' },
  history: { ability: 'intelligence', name: 'History' },
  insight: { ability: 'wisdom', name: 'Insight' },
  intimidation: { ability: 'charisma', name: 'Intimidation' },
  investigation: { ability: 'intelligence', name: 'Investigation' },
  medicine: { ability: 'wisdom', name: 'Medicine' },
  nature: { ability: 'intelligence', name: 'Nature' },
  perception: { ability: 'wisdom', name: 'Perception' },
  performance: { ability: 'charisma', name: 'Performance' },
  persuasion: { ability: 'charisma', name: 'Persuasion' },
  religion: { ability: 'intelligence', name: 'Religion' },
  sleightOfHand: { ability: 'dexterity', name: 'Sleight of Hand' },
  stealth: { ability: 'dexterity', name: 'Stealth' },
  survival: { ability: 'wisdom', name: 'Survival' },
} as const;

export function QuickRollButtons({
  abilityScores,
  proficiencyBonus = 0,
  skillProficiencies = [],
}: QuickRollButtonsProps) {
  const { roll } = useDiceRoller();

  const rollAbilityCheck = (ability: keyof AbilityScores) => {
    const modifier = getAbilityModifier(abilityScores[ability]);
    roll({
      diceType: 'd20',
      numDice: 1,
      modifier,
      mode: 'normal',
      description: `${ABILITY_NAMES[ability]} Check`,
    });
  };

  const rollSavingThrow = (ability: keyof AbilityScores) => {
    const modifier = getAbilityModifier(abilityScores[ability]);
    roll({
      diceType: 'd20',
      numDice: 1,
      modifier,
      mode: 'normal',
      description: `${ABILITY_NAMES[ability]} Save`,
    });
  };

  const rollSkillCheck = (skillKey: keyof typeof SKILLS) => {
    const skill = SKILLS[skillKey];
    const abilityMod = getAbilityModifier(abilityScores[skill.ability as keyof AbilityScores]);
    const isProficient = skillProficiencies.includes(skillKey);
    const modifier = abilityMod + (isProficient ? proficiencyBonus : 0);

    roll({
      diceType: 'd20',
      numDice: 1,
      modifier,
      mode: 'normal',
      description: `${skill.name}${isProficient ? ' (Prof)' : ''}`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Ability Checks */}
      <div>
        <h4 className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
          <Dices className="w-4 h-4" />
          Ability Checks
        </h4>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(Object.keys(ABILITY_NAMES) as Array<keyof AbilityScores>).map((ability) => {
            const modifier = getAbilityModifier(abilityScores[ability]);
            return (
              <button
                key={ability}
                onClick={() => rollAbilityCheck(ability)}
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <div className="font-semibold">{ABILITY_NAMES[ability]}</div>
                <div className="text-xs text-gray-500">
                  {modifier >= 0 ? '+' : ''}
                  {modifier}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saving Throws */}
      <div>
        <h4 className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
          <Dices className="w-4 h-4" />
          Saving Throws
        </h4>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(Object.keys(ABILITY_NAMES) as Array<keyof AbilityScores>).map((ability) => {
            const modifier = getAbilityModifier(abilityScores[ability]);
            return (
              <button
                key={ability}
                onClick={() => rollSavingThrow(ability)}
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <div className="text-xs text-gray-500">{ABILITY_NAMES[ability]}</div>
                <div className="font-semibold">
                  {modifier >= 0 ? '+' : ''}
                  {modifier}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
          <Dices className="w-4 h-4" />
          Skills
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {(Object.keys(SKILLS) as Array<keyof typeof SKILLS>).map((skillKey) => {
            const skill = SKILLS[skillKey];
            const abilityMod = getAbilityModifier(
              abilityScores[skill.ability as keyof AbilityScores]
            );
            const isProficient = skillProficiencies.includes(skillKey);
            const modifier = abilityMod + (isProficient ? proficiencyBonus : 0);

            return (
              <button
                key={skillKey}
                onClick={() => rollSkillCheck(skillKey)}
                className={`px-3 py-2 text-sm text-left transition-colors rounded-lg border ${
                  isProficient
                    ? 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <span className="font-semibold text-gray-700">
                    {modifier >= 0 ? '+' : ''}
                    {modifier}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {ABILITY_NAMES[skill.ability as keyof typeof ABILITY_NAMES]}
                  {isProficient && ' • Prof'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
