import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types matching our database schema
interface Ruleset {
  name: string;
  short_name: string;
  description: string;
  version: string;
  is_official: boolean;
}

interface Source {
  name: string;
  abbreviation: string;
  description: string;
  publication_year: number;
  is_official: boolean;
}

interface Race {
  name: string;
  description: string;
  size: string;
  speed: number;
  ability_score_increases: any;
  traits: any;
  languages: any;
  is_homebrew: boolean;
}

interface Class {
  name: string;
  description: string;
  hit_die: number;
  primary_ability: string;
  saving_throw_proficiencies: string[];
  armor_proficiencies: string[];
  weapon_proficiencies: string[];
  skill_choices: any;
  class_features: any;
  is_homebrew: boolean;
}

interface Item {
  name: string;
  type: string;
  subtype: string;
  rarity: string;
  requires_attunement: boolean;
  description: string;
  properties?: any;
  damage?: any;
  armor_class?: number | null;
  weight: number;
  cost: any;
  magical: boolean;
}

interface Spell {
  name: string;
  level: number;
  school: string;
  casting_time: string;
  range: string;
  components: any;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higher_levels: string | null;
  classes: string[];
}

// SQL escaping helper
function escapeSql(value: any): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'object') {
    // Convert objects/arrays to JSON and escape
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  // Escape single quotes in strings
  return `'${value.toString().replace(/'/g, "''")}'`;
}

// Read JSON files
const seedDir = path.join(__dirname, '..', 'seed', 'srd');
const outputFile = path.join(__dirname, '..', '..', '..', 'supabase', 'seed.sql');

const rulesets: Ruleset[] = JSON.parse(fs.readFileSync(path.join(seedDir, 'rulesets.json'), 'utf-8'));
const sources: Source[] = JSON.parse(fs.readFileSync(path.join(seedDir, 'sources.json'), 'utf-8'));
const races: Race[] = JSON.parse(fs.readFileSync(path.join(seedDir, 'races.json'), 'utf-8'));
const classes: Class[] = JSON.parse(fs.readFileSync(path.join(seedDir, 'classes.json'), 'utf-8'));
const items: Item[] = JSON.parse(fs.readFileSync(path.join(seedDir, 'items.json'), 'utf-8'));
const spells: Spell[] = JSON.parse(fs.readFileSync(path.join(seedDir, 'spells.json'), 'utf-8'));

// Generate SQL
let sql = `-- Seed data for Roll With It
-- This file is loaded by Supabase local development on startup
-- GENERATED FILE - DO NOT EDIT MANUALLY
-- Edit JSON files in packages/database/seed/srd/ and run: pnpm --filter database generate-seed

-- =====================================================
-- RULESETS
-- =====================================================

INSERT INTO rulesets (name, short_name, description, version, is_official)
VALUES
`;

sql += rulesets.map(r =>
  `  (\n    ${escapeSql(r.name)},\n    ${escapeSql(r.short_name)},\n    ${escapeSql(r.description)},\n    ${escapeSql(r.version)},\n    ${escapeSql(r.is_official)}\n  )`
).join(',\n');

sql += `;\n\n-- =====================================================
-- SOURCES
-- =====================================================

-- Get the 5e ruleset ID for references
DO $$
DECLARE
  ruleset_5e_id UUID;
BEGIN
  SELECT id INTO ruleset_5e_id FROM rulesets WHERE short_name = '5e';

  INSERT INTO sources (ruleset_id, name, abbreviation, description, publication_year, is_official)
  VALUES
`;

sql += sources.map(s =>
  `    (\n      ruleset_5e_id,\n      ${escapeSql(s.name)},\n      ${escapeSql(s.abbreviation)},\n      ${escapeSql(s.description)},\n      ${escapeSql(s.publication_year)},\n      ${escapeSql(s.is_official)}\n    )`
).join(',\n');

sql += `;\nEND $$;\n\n-- =====================================================
-- RACES
-- =====================================================

DO $$
DECLARE
  srd_source_id UUID;
BEGIN
  SELECT id INTO srd_source_id FROM sources WHERE abbreviation = 'SRD' LIMIT 1;

  INSERT INTO races (source_id, name, description, size, speed, ability_score_increases, traits, languages, is_homebrew)
  VALUES
`;

sql += races.map(r =>
  `    (\n      srd_source_id,\n      ${escapeSql(r.name)},\n      ${escapeSql(r.description)},\n      ${escapeSql(r.size)},\n      ${escapeSql(r.speed)},\n      ${escapeSql(r.ability_score_increases)},\n      ${escapeSql(r.traits)},\n      ${escapeSql(r.languages)},\n      ${escapeSql(r.is_homebrew)}\n    )`
).join(',\n');

sql += `;\nEND $$;\n\n-- =====================================================
-- CLASSES
-- =====================================================

DO $$
DECLARE
  srd_source_id UUID;
BEGIN
  SELECT id INTO srd_source_id FROM sources WHERE abbreviation = 'SRD' LIMIT 1;

  INSERT INTO classes (source_id, name, description, hit_die, primary_ability, saving_throw_proficiencies, armor_proficiencies, weapon_proficiencies, skill_choices, class_features, is_homebrew)
  VALUES
`;

sql += classes.map(c =>
  `    (\n      srd_source_id,\n      ${escapeSql(c.name)},\n      ${escapeSql(c.description)},\n      ${escapeSql(c.hit_die)},\n      ${escapeSql(c.primary_ability)},\n      ${escapeSql(c.saving_throw_proficiencies)},\n      ${escapeSql(c.armor_proficiencies)},\n      ${escapeSql(c.weapon_proficiencies)},\n      ${escapeSql(c.skill_choices)},\n      ${escapeSql(c.class_features)},\n      ${escapeSql(c.is_homebrew)}\n    )`
).join(',\n');

sql += `;\nEND $$;\n\n-- =====================================================
-- ITEMS
-- =====================================================

DO $$
DECLARE
  srd_source_id UUID;
BEGIN
  SELECT id INTO srd_source_id FROM sources WHERE abbreviation = 'SRD' LIMIT 1;

  -- WEAPONS (items with damage)
  INSERT INTO items (source_id, name, type, subtype, rarity, requires_attunement, description, properties, damage, weight, cost, magical, is_homebrew)
  VALUES
`;

const weaponsWithDamage = items.filter(i => i.damage);
sql += weaponsWithDamage.map(i =>
  `    (srd_source_id, ${escapeSql(i.name)}, ${escapeSql(i.type)}, ${escapeSql(i.subtype)}, ${escapeSql(i.rarity)}, ${escapeSql(i.requires_attunement)}, ${escapeSql(i.description)}, ${escapeSql(i.properties)}, ${escapeSql(i.damage)}, ${escapeSql(i.weight)}, ${escapeSql(i.cost)}, ${escapeSql(i.magical)}, false)`
).join(',\n');

sql += `;\n\n  -- ARMOR (items with armor_class)
  INSERT INTO items (source_id, name, type, subtype, rarity, requires_attunement, description, properties, armor_class, weight, cost, magical, is_homebrew)
  VALUES
`;

const armor = items.filter(i => i.armor_class !== null && i.armor_class !== undefined);
sql += armor.map(i =>
  `    (srd_source_id, ${escapeSql(i.name)}, ${escapeSql(i.type)}, ${escapeSql(i.subtype)}, ${escapeSql(i.rarity)}, ${escapeSql(i.requires_attunement)}, ${escapeSql(i.description)}, ${escapeSql(i.properties)}, ${escapeSql(i.armor_class)}, ${escapeSql(i.weight)}, ${escapeSql(i.cost)}, ${escapeSql(i.magical)}, false)`
).join(',\n');

sql += `;\n\n  -- GEAR, TOOLS, CONSUMABLES (other items)
  INSERT INTO items (source_id, name, type, subtype, rarity, requires_attunement, description, weight, cost, magical, is_homebrew)
  VALUES
`;

const otherItems = items.filter(i => !i.damage && (i.armor_class === null || i.armor_class === undefined) && !i.properties);
sql += otherItems.map(i =>
  `    (srd_source_id, ${escapeSql(i.name)}, ${escapeSql(i.type)}, ${escapeSql(i.subtype)}, ${escapeSql(i.rarity)}, ${escapeSql(i.requires_attunement)}, ${escapeSql(i.description)}, ${escapeSql(i.weight)}, ${escapeSql(i.cost)}, ${escapeSql(i.magical)}, false)`
).join(',\n');

sql += `;\n\n  -- MAGIC ITEMS (items with properties but no damage/armor_class)
  INSERT INTO items (source_id, name, type, subtype, rarity, requires_attunement, description, properties, weight, cost, magical, is_homebrew)
  VALUES
`;

const magicItems = items.filter(i => !i.damage && (i.armor_class === null || i.armor_class === undefined) && i.properties);
sql += magicItems.map(i =>
  `    (srd_source_id, ${escapeSql(i.name)}, ${escapeSql(i.type)}, ${escapeSql(i.subtype)}, ${escapeSql(i.rarity)}, ${escapeSql(i.requires_attunement)}, ${escapeSql(i.description)}, ${escapeSql(i.properties)}, ${escapeSql(i.weight)}, ${escapeSql(i.cost)}, ${escapeSql(i.magical)}, false)`
).join(',\n');

sql += `;\n\nEND $$;\n\n-- =====================================================
-- SPELLS
-- =====================================================

DO $$
DECLARE
  srd_source_id UUID;
BEGIN
  SELECT id INTO srd_source_id FROM sources WHERE abbreviation = 'SRD' LIMIT 1;

  INSERT INTO spells (source_id, name, level, school, casting_time, range, components, duration, concentration, ritual, description, higher_levels, classes, is_homebrew)
  VALUES
`;

sql += spells.map(s =>
  `    (srd_source_id, ${escapeSql(s.name)}, ${escapeSql(s.level)}, ${escapeSql(s.school)}, ${escapeSql(s.casting_time)}, ${escapeSql(s.range)}, ${escapeSql(s.components)}, ${escapeSql(s.duration)}, ${escapeSql(s.concentration)}, ${escapeSql(s.ritual)}, ${escapeSql(s.description)}, ${escapeSql(s.higher_levels)}, ${escapeSql(s.classes)}, false)`
).join(',\n');

sql += `;\n\nEND $$;\n`;

// Write SQL file
fs.writeFileSync(outputFile, sql, 'utf-8');

console.log('✅ Generated seed.sql successfully!');
console.log(`   Output: ${outputFile}`);
console.log(`   Rulesets: ${rulesets.length}`);
console.log(`   Sources: ${sources.length}`);
console.log(`   Races: ${races.length}`);
console.log(`   Classes: ${classes.length}`);
console.log(`   Items: ${items.length}`);
console.log(`   Spells: ${spells.length}`);
