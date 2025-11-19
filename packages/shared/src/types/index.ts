// Core System Types
export interface Ruleset {
  id: string;
  name: string;
  short_name: string;
  description: string | null;
  version: string | null;
  is_official: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  ruleset_id: string;
  name: string;
  abbreviation: string;
  description: string | null;
  publication_year: number | null;
  is_official: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Content Types
export interface Race {
  id: string;
  source_id: string;
  name: string;
  description: string | null;
  size: string | null;
  speed: number | null;
  ability_score_increases: AbilityScoreIncrease | null;
  traits: RacialTrait[] | null;
  languages: string[] | null;
  subraces: Subrace[] | null;
  is_homebrew: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AbilityScoreIncrease {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
}

export interface RacialTrait {
  name: string;
  description: string;
}

export interface Subrace {
  name: string;
  description: string;
  ability_score_increases?: AbilityScoreIncrease;
  traits?: RacialTrait[];
}

export interface Class {
  id: string;
  source_id: string;
  name: string;
  description: string | null;
  hit_die: number | null;
  primary_ability: string | null;
  saving_throw_proficiencies: string[] | null;
  armor_proficiencies: string[] | null;
  weapon_proficiencies: string[] | null;
  tool_proficiencies: string[] | null;
  skill_choices: SkillChoice | null;
  starting_equipment: StartingEquipment[] | null;
  spellcasting: Spellcasting | null;
  class_features: ClassFeature[] | null;
  is_homebrew: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillChoice {
  choose: number;
  from: string[];
}

export interface StartingEquipment {
  item: string;
  quantity: number;
  alternatives?: string[];
}

export interface Spellcasting {
  ability: string;
  cantrips_known?: number[];
  spells_known?: number[];
  spell_slots?: SpellSlots;
  ritual_casting?: boolean;
  spellcasting_focus?: string;
}

export interface SpellSlots {
  [level: number]: number[];
}

export interface ClassFeature {
  level: number;
  name: string;
  description: string;
}

export interface Subclass {
  id: string;
  source_id: string;
  class_id: string;
  name: string;
  description: string | null;
  level_available: number | null;
  features: SubclassFeature[] | null;
  is_homebrew: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubclassFeature {
  level: number;
  name: string;
  description: string;
}

export interface Spell {
  id: string;
  source_id: string;
  name: string;
  level: number;
  school: string | null;
  casting_time: string | null;
  range: string | null;
  components: SpellComponents | null;
  duration: string | null;
  concentration: boolean;
  ritual: boolean;
  description: string | null;
  higher_levels: string | null;
  classes: string[] | null;
  is_homebrew: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material?: string;
}

export interface Item {
  id: string;
  source_id: string;
  name: string;
  type: string | null;
  subtype: string | null;
  rarity: string | null;
  requires_attunement: boolean;
  description: string | null;
  properties: ItemProperty[] | null;
  damage: Damage | null;
  armor_class: number | null;
  weight: number | null;
  cost: Cost | null;
  magical: boolean;
  is_homebrew: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemProperty {
  name: string;
  description?: string;
}

export interface Damage {
  dice: string;
  type: string;
}

export interface Cost {
  amount: number;
  currency: string;
}

export interface Ability {
  id: string;
  source_id: string;
  name: string;
  type: string | null;
  description: string | null;
  prerequisites: Prerequisites | null;
  benefits: string | null;
  is_homebrew: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prerequisites {
  level?: number;
  ability?: AbilityScoreIncrease;
  proficiencies?: string[];
}

export interface Background {
  id: string;
  source_id: string;
  name: string;
  description: string | null;
  skill_proficiencies: string[] | null;
  tool_proficiencies: string[] | null;
  languages: number | null;
  equipment: string[] | null;
  feature: BackgroundFeature | null;
  suggested_characteristics: string | null;
  is_homebrew: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackgroundFeature {
  name: string;
  description: string;
}

// Character Types
export interface Character {
  id: string;
  user_id: string;
  ruleset_id: string;
  name: string;
  race_id: string | null;
  class_id: string | null;
  subclass_id: string | null;
  background_id: string | null;
  level: number;
  experience_points: number;
  ability_scores: AbilityScores;
  hit_points_max: number | null;
  hit_points_current: number | null;
  temporary_hit_points: number;
  armor_class: number | null;
  initiative_bonus: number | null;
  speed: number | null;
  proficiency_bonus: number | null;
  saving_throws: SavingThrows | null;
  skills: Skills | null;
  attacks: Attack[] | null;
  spell_slots: SpellSlotTracker | null;
  spells_known: string[] | null;
  spells_prepared: string[] | null;
  inventory: InventoryItem[] | null;
  currency: Currency | null;
  features: string[] | null;
  personality_traits: string | null;
  ideals: string | null;
  bonds: string | null;
  flaws: string | null;
  appearance: string | null;
  backstory: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface SavingThrows {
  str: { proficient: boolean; bonus: number };
  dex: { proficient: boolean; bonus: number };
  con: { proficient: boolean; bonus: number };
  int: { proficient: boolean; bonus: number };
  wis: { proficient: boolean; bonus: number };
  cha: { proficient: boolean; bonus: number };
}

export interface Skills {
  acrobatics: { proficient: boolean; expertise: boolean; bonus: number };
  animal_handling: { proficient: boolean; expertise: boolean; bonus: number };
  arcana: { proficient: boolean; expertise: boolean; bonus: number };
  athletics: { proficient: boolean; expertise: boolean; bonus: number };
  deception: { proficient: boolean; expertise: boolean; bonus: number };
  history: { proficient: boolean; expertise: boolean; bonus: number };
  insight: { proficient: boolean; expertise: boolean; bonus: number };
  intimidation: { proficient: boolean; expertise: boolean; bonus: number };
  investigation: { proficient: boolean; expertise: boolean; bonus: number };
  medicine: { proficient: boolean; expertise: boolean; bonus: number };
  nature: { proficient: boolean; expertise: boolean; bonus: number };
  perception: { proficient: boolean; expertise: boolean; bonus: number };
  performance: { proficient: boolean; expertise: boolean; bonus: number };
  persuasion: { proficient: boolean; expertise: boolean; bonus: number };
  religion: { proficient: boolean; expertise: boolean; bonus: number };
  sleight_of_hand: { proficient: boolean; expertise: boolean; bonus: number };
  stealth: { proficient: boolean; expertise: boolean; bonus: number };
  survival: { proficient: boolean; expertise: boolean; bonus: number };
}

export interface Attack {
  name: string;
  attack_bonus: number;
  damage: Damage;
  notes?: string;
}

export interface SpellSlotTracker {
  [level: number]: { current: number; max: number };
}

export interface InventoryItem {
  item_id: string;
  quantity: number;
  equipped: boolean;
  attuned: boolean;
}

export interface Currency {
  cp: number;
  sp: number;
  gp: number;
  pp: number;
}

// Campaign Types
export interface Campaign {
  id: string;
  user_id: string;
  ruleset_id: string;
  name: string;
  description: string | null;
  setting: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  session_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignCharacter {
  id: string;
  campaign_id: string;
  character_id: string;
  role: 'player' | 'dm_pc' | 'npc';
  joined_at: string;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id: string;
  role: 'dm' | 'player';
  joined_at: string;
}

export interface Session {
  id: string;
  campaign_id: string;
  session_number: number | null;
  session_date: string | null;
  title: string | null;
  summary: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Utility Types
export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type SkillName = keyof Skills;
export type CurrencyType = 'cp' | 'sp' | 'gp' | 'pp';
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'artifact';
export type MagicSchool =
  | 'Abjuration'
  | 'Conjuration'
  | 'Divination'
  | 'Enchantment'
  | 'Evocation'
  | 'Illusion'
  | 'Necromancy'
  | 'Transmutation';
