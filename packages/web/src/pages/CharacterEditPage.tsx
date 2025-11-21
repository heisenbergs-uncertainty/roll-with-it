import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useCharacter, useUpdateCharacter } from '@/hooks/useCharacters';
import { useSpellsByIds } from '@/hooks/useSpells';
import { Button } from '@/components/common/Button';
import { SkillProficiencyEditor } from '@/components/character/SkillProficiencyEditor';
import { SavingThrowEditor } from '@/components/character/SavingThrowEditor';
import { InventoryListEnhanced } from '@/components/character/InventoryListEnhanced';
import { CurrencyEditor } from '@/components/character/CurrencyEditor';
import { EncumbranceTracker } from '@/components/character/EncumbranceTracker';
import { EquipmentSlots } from '@/components/character/EquipmentSlots';
import { SpellSlotEditor } from '@/components/character/SpellSlotEditor';
import { SpellBrowser } from '@/components/character/SpellBrowser';
import { ArrowLeft } from 'lucide-react';
import { getProficiencyBonus, calculateAbilityModifier } from '@roll-with-it/shared';
import type { Skills, SavingThrows, InventoryItem, Currency, Spell } from '@roll-with-it/shared';

const characterEditSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  level: z.number().min(1).max(20),
  experience_points: z.number().min(0),
  hit_points_max: z.number().min(1),
  hit_points_current: z.number().min(0),
  armor_class: z.number().min(1),
  speed: z.number().min(0),
  ability_scores: z.object({
    str: z.number().min(1).max(30),
    dex: z.number().min(1).max(30),
    con: z.number().min(1).max(30),
    int: z.number().min(1).max(30),
    wis: z.number().min(1).max(30),
    cha: z.number().min(1).max(30),
  }),
  personality_traits: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  backstory: z.string().optional(),
  notes: z.string().optional(),
});

type CharacterEditFormData = z.infer<typeof characterEditSchema>;

export default function CharacterEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: character, isLoading, error } = useCharacter(id!);
  const updateMutation = useUpdateCharacter();

  const [skills, setSkills] = useState<Skills | null>(null);
  const [savingThrows, setSavingThrows] = useState<SavingThrows | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currency, setCurrency] = useState<Currency>({ cp: 0, sp: 0, gp: 0, pp: 0 });
  const [spellSlots, setSpellSlots] = useState<Array<{ level: number; total: number; used: number }>>([]);
  const [preparedSpellIds, setPreparedSpellIds] = useState<string[]>([]);

  // Fetch prepared spells
  const { data: preparedSpells = [] } = useSpellsByIds(preparedSpellIds);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CharacterEditFormData>({
    resolver: zodResolver(characterEditSchema),
    values: character
      ? {
          name: character.name,
          level: character.level,
          experience_points: character.experience_points || 0,
          hit_points_max: character.hit_points_max || 10,
          hit_points_current: character.hit_points_current || 10,
          armor_class: character.armor_class || 10,
          speed: character.speed || 30,
          ability_scores: character.ability_scores,
          personality_traits: character.personality_traits || '',
          ideals: character.ideals || '',
          bonds: character.bonds || '',
          flaws: character.flaws || '',
          backstory: character.backstory || '',
          notes: character.notes || '',
        }
      : undefined,
  });

  // Initialize skills, saving throws, inventory, currency, and spells from character
  useEffect(() => {
    if (character) {
      setSkills(character.skills);
      setSavingThrows(character.saving_throws);
      setInventory(character.inventory || []);
      setCurrency(character.currency || { cp: 0, sp: 0, gp: 0, pp: 0 });

      // Initialize spell slots
      if (character.spell_slots) {
        const slots = Object.entries(character.spell_slots).map(([level, slot]) => ({
          level: Number(level),
          total: (slot as { current: number; max: number }).max,
          used: (slot as { current: number; max: number }).max - (slot as { current: number; max: number }).current,
        }));
        setSpellSlots(slots);
      }

      // Initialize prepared spells
      setPreparedSpellIds(character.spells_prepared || []);
    }
  }, [character]);

  // Watch level and DEX for auto-calculations
  const currentLevel = watch('level');
  const currentDex = watch('ability_scores.dex');

  // Auto-calculate proficiency bonus when level changes
  useEffect(() => {
    if (currentLevel) {
      // Proficiency bonus will be calculated and saved on submit
    }
  }, [currentLevel]);

  // Helper functions for spell management
  const handleAddSpell = (spell: Spell) => {
    if (!preparedSpellIds.includes(spell.id)) {
      setPreparedSpellIds([...preparedSpellIds, spell.id]);
    }
  };

  const handleRemoveSpell = (spellId: string) => {
    setPreparedSpellIds(preparedSpellIds.filter(id => id !== spellId));
  };

  const onSubmit = async (data: CharacterEditFormData) => {
    if (!character) return;

    try {
      const proficiencyBonus = getProficiencyBonus(data.level);
      const initiativeBonus = calculateAbilityModifier(data.ability_scores.dex);

      // Convert spell slots back to database format
      const dbSpellSlots = spellSlots.length > 0
        ? spellSlots.reduce((acc, slot) => {
            acc[slot.level] = {
              current: slot.total - slot.used,
              max: slot.total,
            };
            return acc;
          }, {} as Record<number, { current: number; max: number }>)
        : null;

      await updateMutation.mutateAsync({
        id: character.id,
        updates: {
          ...data,
          skills,
          saving_throws: savingThrows,
          inventory,
          currency,
          proficiency_bonus: proficiencyBonus,
          initiative_bonus: initiativeBonus,
          spell_slots: dbSpellSlots,
          spells_prepared: preparedSpellIds.length > 0 ? preparedSpellIds : null,
        },
      });
      navigate(`/characters/${character.id}`);
    } catch (err: any) {
      console.error('Failed to update character:', err);
      alert('Failed to update character. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading character...</div>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600 mb-4">
            Failed to load character
          </div>
          <Link to="/characters">
            <Button variant="outline">Back to Characters</Button>
          </Link>
        </div>
      </div>
    );
  }

  const proficiencyBonus = getProficiencyBonus(currentLevel || character.level);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to={`/characters/${character.id}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Character Sheet
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Edit {character.name}
        </h1>
        <p className="text-gray-600">
          Level {character.level} {character.race?.name} {character.class?.name}
        </p>
        <p className="text-sm text-blue-600 mt-2">
          Current Proficiency Bonus: +{proficiencyBonus}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Character Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <input
                type="number"
                {...register('level', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="20"
              />
              {errors.level && (
                <p className="text-red-600 text-sm mt-1">{errors.level.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Proficiency bonus will auto-update: +{proficiencyBonus}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Points
              </label>
              <input
                type="number"
                {...register('experience_points', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              {errors.experience_points && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.experience_points.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ability Scores</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => {
              const score = watch(`ability_scores.${ability}`);
              const modifier = score ? calculateAbilityModifier(score) : 0;
              const modText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

              return (
                <div key={ability}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 uppercase">
                    {ability}
                  </label>
                  <input
                    type="number"
                    {...register(`ability_scores.${ability}`, { valueAsNumber: true })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Modifier: {modText}
                  </p>
                  {errors.ability_scores?.[ability] && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.ability_scores[ability]?.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Combat Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max HP
              </label>
              <input
                type="number"
                {...register('hit_points_max', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              {errors.hit_points_max && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hit_points_max.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current HP
              </label>
              <input
                type="number"
                {...register('hit_points_current', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              {errors.hit_points_current && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hit_points_current.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Armor Class
              </label>
              <input
                type="number"
                {...register('armor_class', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              {errors.armor_class && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.armor_class.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed (ft)
              </label>
              <input
                type="number"
                {...register('speed', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              {errors.speed && (
                <p className="text-red-600 text-sm mt-1">{errors.speed.message}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Initiative bonus will auto-calculate from DEX:
            <span className="font-semibold text-blue-600 ml-1">
              {currentDex ? (calculateAbilityModifier(currentDex) >= 0 ? '+' : '') + calculateAbilityModifier(currentDex) : '+0'}
            </span>
          </p>
        </div>

        {/* Skill Proficiencies */}
        {skills !== null && (
          <SkillProficiencyEditor skills={skills} onChange={setSkills} />
        )}

        {/* Saving Throws */}
        {savingThrows !== null && (
          <SavingThrowEditor savingThrows={savingThrows} onChange={setSavingThrows} />
        )}

        {/* Equipment Slots */}
        <EquipmentSlots inventory={inventory} />

        {/* Spellcasting Management */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spellcasting</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Spell Slots</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure how many spell slots your character has. Use "Quick Set" for standard wizard progression, or manually adjust each level.
                </p>
                <SpellSlotEditor slots={spellSlots} onChange={setSpellSlots} />
              </div>
              {preparedSpells.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Prepared Spells ({preparedSpells.length})</h3>
                  <div className="space-y-2">
                    {preparedSpells.map((spell) => (
                      <div key={spell.id} className="flex items-center justify-between border rounded p-2">
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-xs text-gray-600">
                            Level {spell.level} • {spell.school}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpell(spell.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Add Spells</h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse and add spells to your character. Cantrips (Level 0) don't use spell slots and can be cast at will. Leveled spells (Level 1-9) require spell slots to cast.
              </p>
              <SpellBrowser
                selectedSpellIds={preparedSpellIds}
                characterClass={character?.class?.name}
                onAddSpell={handleAddSpell}
              />
            </div>
          </div>
        </div>

        {/* Inventory & Currency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InventoryListEnhanced
              inventory={inventory}
              onChange={setInventory}
            />
          </div>
          <div className="space-y-6">
            <CurrencyEditor
              currency={currency}
              onChange={setCurrency}
            />
            <EncumbranceTracker
              inventory={inventory}
              abilityScores={watch('ability_scores') || character!.ability_scores}
            />
          </div>
        </div>

        {/* Personality & Backstory */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personality & Backstory</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personality Traits
              </label>
              <textarea
                {...register('personality_traits')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="e.g., I'm always polite and respectful. I love a good mystery."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ideals
              </label>
              <textarea
                {...register('ideals')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="e.g., Knowledge. The path to power and self-improvement is through knowledge."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonds
              </label>
              <textarea
                {...register('bonds')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="e.g., I would die to recover an ancient artifact of my faith."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flaws
              </label>
              <textarea
                {...register('flaws')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="e.g., I can't resist a pretty face."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backstory
              </label>
              <textarea
                {...register('backstory')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Your character's history and background story..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register('notes')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Campaign notes, reminders, or other information..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 sticky bottom-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <Link to={`/characters/${character.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
