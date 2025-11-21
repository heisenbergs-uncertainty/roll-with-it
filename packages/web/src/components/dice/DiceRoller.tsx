import { useState } from 'react';
import { useDiceRoller } from '../../contexts/DiceRollerContext';
import { DiceType, RollMode, RollResult } from '../../utils/dice';

const DICE_TYPES: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

interface DiceRollerProps {
  defaultDiceType?: DiceType;
  defaultNumDice?: number;
  defaultModifier?: number;
  description?: string;
  compact?: boolean;
}

export function DiceRoller({
  defaultDiceType = 'd20',
  defaultNumDice = 1,
  defaultModifier = 0,
  description,
  compact = false,
}: DiceRollerProps) {
  const { roll } = useDiceRoller();
  const [selectedDice, setSelectedDice] = useState<DiceType>(defaultDiceType);
  const [numDice, setNumDice] = useState(defaultNumDice);
  const [modifier, setModifier] = useState(defaultModifier);
  const [rollMode, setRollMode] = useState<RollMode>('normal');
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);

  const handleRoll = () => {
    const result = roll({
      diceType: selectedDice,
      numDice,
      modifier,
      mode: rollMode,
      description,
    });
    setLastRoll(result);
  };

  const getDiceColor = (diceType: DiceType) => {
    switch (diceType) {
      case 'd4':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'd6':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'd8':
        return 'bg-green-600 hover:bg-green-700';
      case 'd10':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'd12':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'd20':
        return 'bg-red-600 hover:bg-red-700';
      case 'd100':
        return 'bg-pink-600 hover:bg-pink-700';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <select
          value={selectedDice}
          onChange={(e) => setSelectedDice(e.target.value as DiceType)}
          className="px-2 py-1 text-sm border rounded"
        >
          {DICE_TYPES.map((dice) => (
            <option key={dice} value={dice}>
              {dice}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          max="20"
          value={numDice}
          onChange={(e) => setNumDice(parseInt(e.target.value) || 1)}
          className="w-16 px-2 py-1 text-sm border rounded"
          placeholder="Num"
        />

        <input
          type="number"
          min="-10"
          max="10"
          value={modifier}
          onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
          className="w-16 px-2 py-1 text-sm border rounded"
          placeholder="Mod"
        />

        <button
          onClick={handleRoll}
          className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Roll
        </button>

        {lastRoll && (
          <div className="px-3 py-1 font-bold text-indigo-900 bg-indigo-100 rounded">
            {lastRoll.finalTotal}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Dice Roller</h3>

      {/* Dice Type Selection */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Dice</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DICE_TYPES.map((dice) => (
            <button
              key={dice}
              onClick={() => setSelectedDice(dice)}
              className={`px-4 py-3 text-white rounded-lg font-semibold transition-colors ${
                selectedDice === dice
                  ? getDiceColor(dice)
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              {dice}
            </button>
          ))}
        </div>
      </div>

      {/* Number of Dice */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="numDice" className="block mb-2 text-sm font-medium text-gray-700">
            Number of Dice
          </label>
          <input
            id="numDice"
            type="number"
            min="1"
            max="20"
            value={numDice}
            onChange={(e) => setNumDice(parseInt(e.target.value) || 1)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="modifier" className="block mb-2 text-sm font-medium text-gray-700">
            Modifier
          </label>
          <input
            id="modifier"
            type="number"
            min="-100"
            max="100"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Advantage/Disadvantage (only for d20) */}
      {selectedDice === 'd20' && (
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">Roll Mode</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setRollMode('normal')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                rollMode === 'normal'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setRollMode('advantage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                rollMode === 'advantage'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Advantage
            </button>
            <button
              onClick={() => setRollMode('disadvantage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                rollMode === 'disadvantage'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Disadvantage
            </button>
          </div>
        </div>
      )}

      {/* Roll Button */}
      <button
        onClick={handleRoll}
        className="w-full px-6 py-3 text-lg font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        Roll {numDice}
        {selectedDice}
        {modifier !== 0 && (modifier > 0 ? `+${modifier}` : modifier)}
      </button>

      {/* Last Roll Result */}
      {lastRoll && (
        <div className="p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {lastRoll.numDice}
              {lastRoll.diceType}
              {lastRoll.modifier !== 0 &&
                (lastRoll.modifier > 0 ? `+${lastRoll.modifier}` : lastRoll.modifier)}
              {lastRoll.isAdvantage && ' (Advantage)'}
              {lastRoll.isDisadvantage && ' (Disadvantage)'}
            </span>
            <span className="text-2xl font-bold text-indigo-600">{lastRoll.finalTotal}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Rolls:</span>
            {lastRoll.rolls.map((roll, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center justify-center w-8 h-8 text-sm font-semibold rounded ${
                  roll === 20 && lastRoll.diceType === 'd20'
                    ? 'bg-green-100 text-green-800'
                    : roll === 1 && lastRoll.diceType === 'd20'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {roll}
              </span>
            ))}
            {lastRoll.discardedRolls && lastRoll.discardedRolls.length > 0 && (
              <>
                <span className="text-sm text-gray-400">Discarded:</span>
                {lastRoll.discardedRolls.map((roll, idx) => (
                  <span
                    key={`discarded-${idx}`}
                    className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold text-gray-400 bg-gray-50 rounded line-through"
                  >
                    {roll}
                  </span>
                ))}
              </>
            )}
          </div>

          {lastRoll.modifier !== 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Roll Total: {lastRoll.total} {lastRoll.modifier > 0 ? '+' : ''}
              {lastRoll.modifier} = {lastRoll.finalTotal}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
