export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface DiceRoll {
  diceType: DiceType;
  numDice: number;
  modifier: number;
  mode: RollMode;
}

export interface RollResult {
  rolls: number[];
  total: number;
  modifier: number;
  finalTotal: number;
  diceType: DiceType;
  numDice: number;
  mode: RollMode;
  timestamp: Date;
  description?: string;
  isAdvantage?: boolean;
  isDisadvantage?: boolean;
  discardedRolls?: number[];
}

/**
 * Get the maximum value for a dice type
 */
export function getDiceMax(diceType: DiceType): number {
  switch (diceType) {
    case 'd4':
      return 4;
    case 'd6':
      return 6;
    case 'd8':
      return 8;
    case 'd10':
      return 10;
    case 'd12':
      return 12;
    case 'd20':
      return 20;
    case 'd100':
      return 100;
  }
}

/**
 * Roll a single die
 */
export function rollDie(diceType: DiceType): number {
  const max = getDiceMax(diceType);
  return Math.floor(Math.random() * max) + 1;
}

/**
 * Roll multiple dice
 */
export function rollDice(diceType: DiceType, numDice: number): number[] {
  return Array.from({ length: numDice }, () => rollDie(diceType));
}

/**
 * Roll dice with modifiers and advantage/disadvantage
 */
export function performRoll(params: DiceRoll & { description?: string }): RollResult {
  const { diceType, numDice, modifier, mode, description } = params;

  let rolls: number[];
  let discardedRolls: number[] | undefined;

  if (mode === 'advantage' && diceType === 'd20') {
    // Roll twice, keep highest
    const roll1 = rollDice(diceType, numDice);
    const roll2 = rollDice(diceType, numDice);
    const sum1 = roll1.reduce((a, b) => a + b, 0);
    const sum2 = roll2.reduce((a, b) => a + b, 0);

    if (sum1 >= sum2) {
      rolls = roll1;
      discardedRolls = roll2;
    } else {
      rolls = roll2;
      discardedRolls = roll1;
    }
  } else if (mode === 'disadvantage' && diceType === 'd20') {
    // Roll twice, keep lowest
    const roll1 = rollDice(diceType, numDice);
    const roll2 = rollDice(diceType, numDice);
    const sum1 = roll1.reduce((a, b) => a + b, 0);
    const sum2 = roll2.reduce((a, b) => a + b, 0);

    if (sum1 <= sum2) {
      rolls = roll1;
      discardedRolls = roll2;
    } else {
      rolls = roll2;
      discardedRolls = roll1;
    }
  } else {
    // Normal roll
    rolls = rollDice(diceType, numDice);
  }

  const total = rolls.reduce((sum, roll) => sum + roll, 0);
  const finalTotal = total + modifier;

  return {
    rolls,
    total,
    modifier,
    finalTotal,
    diceType,
    numDice,
    mode,
    timestamp: new Date(),
    description,
    isAdvantage: mode === 'advantage',
    isDisadvantage: mode === 'disadvantage',
    discardedRolls,
  };
}

/**
 * Format a dice roll for display (e.g., "2d6+3")
 */
export function formatDiceRoll(diceType: DiceType, numDice: number, modifier: number): string {
  let result = `${numDice}${diceType}`;
  if (modifier > 0) {
    result += `+${modifier}`;
  } else if (modifier < 0) {
    result += modifier;
  }
  return result;
}

/**
 * Parse ability modifier from ability score
 */
export function getAbilityModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Calculate proficiency bonus based on level
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}
