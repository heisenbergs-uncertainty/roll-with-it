import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCharacter, useDeleteCharacter } from '@/hooks/useCharacters';
import { useSpellsByIds } from '@/hooks/useSpells';
import { CharacterHeader } from '@/components/character/CharacterHeader';
import { AbilityScores } from '@/components/character/AbilityScores';
import { SkillsList } from '@/components/character/SkillsList';
import { SavingThrows } from '@/components/character/SavingThrows';
import { CombatStats } from '@/components/character/CombatStats';
import { InventoryListEnhanced } from '@/components/character/InventoryListEnhanced';
import { CurrencyEditor } from '@/components/character/CurrencyEditor';
import { EncumbranceTracker } from '@/components/character/EncumbranceTracker';
import { EquipmentSlots } from '@/components/character/EquipmentSlots';
import { SpellSlotTracker } from '@/components/character/SpellSlotTracker';
import { SpellList } from '@/components/character/SpellList';
import { DiceRoller } from '@/components/dice/DiceRoller';
import { QuickRollButtons } from '@/components/dice/QuickRollButtons';
import { RollHistory } from '@/components/dice/RollHistory';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { getProficiencyBonus } from '@/utils/dice';

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: character, isLoading, error } = useCharacter(id!);
  const deleteMutation = useDeleteCharacter();

  // Fetch spells for this character
  const spellIds = character?.spells_prepared || [];
  const { data: preparedSpells = [] } = useSpellsByIds(spellIds);

  // Convert spell slots from database format to component format
  const spellSlots = character?.spell_slots
    ? Object.entries(character.spell_slots).map(([level, slots]) => ({
        level: Number(level),
        total: (slots as { current: number; max: number }).max,
        used: (slots as { current: number; max: number }).max - (slots as { current: number; max: number }).current,
      }))
    : [];

  // Get proficiency bonus and skill proficiencies
  const proficiencyBonus = character ? getProficiencyBonus(character.level) : 0;
  const skillProficiencies = character?.skills
    ? Object.entries(character.skills)
        .filter(([_, proficient]) => proficient)
        .map(([skill, _]) => skill)
    : [];

  const handleDelete = async () => {
    if (!character) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${character.name}? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(character.id);
        navigate('/characters');
      } catch (error) {
        console.error('Failed to delete character:', error);
        alert('Failed to delete character. Please try again.');
      }
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button and actions */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/characters">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Characters
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link to={`/characters/${character.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2 text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Character Header */}
      <CharacterHeader character={character} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ability Scores and Combat Stats */}
        <div className="space-y-6">
          <AbilityScores abilityScores={character.ability_scores} />
          <CombatStats character={character} />
        </div>

        {/* Middle Column - Skills */}
        <div>
          <SkillsList
            skills={character.skills}
            abilityScores={character.ability_scores}
            level={character.level}
          />
        </div>

        {/* Right Column - Saving Throws */}
        <div>
          <SavingThrows
            savingThrows={character.saving_throws}
            abilityScores={character.ability_scores}
            level={character.level}
          />
        </div>
      </div>

      {/* Dice Rolling Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dice Rolling</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <DiceRoller />
            <QuickRollButtons
              abilityScores={character.ability_scores}
              proficiencyBonus={proficiencyBonus}
              skillProficiencies={skillProficiencies}
            />
          </div>
          <RollHistory limit={10} />
        </div>
      </div>

      {/* Equipment Slots */}
      <div className="mt-6">
        <EquipmentSlots inventory={character.inventory} />
      </div>

      {/* Spellcasting Section */}
      {(preparedSpells.length > 0 || spellSlots.length > 0) && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpellSlotTracker
            slots={spellSlots}
            onSlotsChange={() => {}} // Read-only on detail page
          />
          <SpellList spells={preparedSpells} />
        </div>
      )}

      {/* Inventory & Currency Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <InventoryListEnhanced
            inventory={character.inventory}
            onChange={() => {}} // Read-only on detail page
            readOnly={true}
          />
        </div>
        <div className="space-y-6">
          <CurrencyEditor
            currency={character.currency}
            onChange={() => {}} // Read-only on detail page
            readOnly={true}
          />
          <EncumbranceTracker
            inventory={character.inventory}
            abilityScores={character.ability_scores}
          />
        </div>
      </div>

      {/* Additional sections placeholder */}
      {character.backstory && (
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Backstory</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{character.backstory}</p>
        </div>
      )}

      {character.notes && (
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{character.notes}</p>
        </div>
      )}
    </div>
  );
}
