import { PROFICIENCY_BY_LEVEL, EXPERIENCE_BY_LEVEL } from '../constants';
import type { AbilityScores } from '../types';

/**
 * Calculate ability modifier from ability score
 */
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate all ability modifiers from ability scores
 */
export function calculateAbilityModifiers(scores: AbilityScores): Record<string, number> {
  return {
    str: calculateAbilityModifier(scores.str),
    dex: calculateAbilityModifier(scores.dex),
    con: calculateAbilityModifier(scores.con),
    int: calculateAbilityModifier(scores.int),
    wis: calculateAbilityModifier(scores.wis),
    cha: calculateAbilityModifier(scores.cha),
  };
}

/**
 * Get proficiency bonus for a given level
 */
export function getProficiencyBonus(level: number): number {
  return PROFICIENCY_BY_LEVEL[level] || 2;
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 20) return EXPERIENCE_BY_LEVEL[20];
  return EXPERIENCE_BY_LEVEL[currentLevel + 1];
}

/**
 * Get level from XP
 */
export function getLevelFromXP(xp: number): number {
  for (let level = 20; level >= 1; level--) {
    if (xp >= EXPERIENCE_BY_LEVEL[level]) {
      return level;
    }
  }
  return 1;
}

/**
 * Format modifier as string with sign
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Roll dice (e.g., "1d8", "2d6+3")
 */
export function rollDice(diceString: string): number {
  const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return 0;

  const [, numDice, diceType, modifier] = match;
  const num = parseInt(numDice, 10);
  const die = parseInt(diceType, 10);
  const mod = modifier ? parseInt(modifier, 10) : 0;

  let total = mod;
  for (let i = 0; i < num; i++) {
    total += Math.floor(Math.random() * die) + 1;
  }

  return total;
}

/**
 * Parse dice string to get average value
 */
export function getAverageDiceValue(diceString: string): number {
  const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return 0;

  const [, numDice, diceType, modifier] = match;
  const num = parseInt(numDice, 10);
  const die = parseInt(diceType, 10);
  const mod = modifier ? parseInt(modifier, 10) : 0;

  return num * ((die + 1) / 2) + mod;
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, type: 'cp' | 'sp' | 'gp' | 'pp'): string {
  const labels = {
    cp: 'cp',
    sp: 'sp',
    gp: 'gp',
    pp: 'pp',
  };
  return `${amount} ${labels[type]}`;
}

/**
 * Convert currency to gold pieces
 */
export function convertToGold(amount: number, type: 'cp' | 'sp' | 'gp' | 'pp'): number {
  const rates = {
    cp: 0.01,
    sp: 0.1,
    gp: 1,
    pp: 10,
  };
  return amount * rates[type];
}

/**
 * Convert total value to currency breakdown
 */
export function convertGoldToCurrency(gold: number): {
  pp: number;
  gp: number;
  sp: number;
  cp: number;
} {
  let remaining = Math.round(gold * 100); // Convert to copper

  const pp = Math.floor(remaining / 1000);
  remaining -= pp * 1000;

  const gp = Math.floor(remaining / 100);
  remaining -= gp * 100;

  const sp = Math.floor(remaining / 10);
  remaining -= sp * 10;

  const cp = remaining;

  return { pp, gp, sp, cp };
}

/**
 * Calculate carrying capacity based on Strength score
 */
export function calculateCarryingCapacity(strength: number): number {
  return strength * 15; // In pounds
}

/**
 * Format weight value
 */
export function formatWeight(weight: number): string {
  return `${weight} lb${weight !== 1 ? 's' : ''}`;
}

/**
 * Generate UUID (simple version for client-side use)
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
