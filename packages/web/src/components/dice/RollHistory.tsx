import { Trash2 } from 'lucide-react';
import { useDiceRoller } from '../../contexts/DiceRollerContext';
import { RollResult } from '../../utils/dice';

interface RollHistoryProps {
  limit?: number;
}

export function RollHistory({ limit }: RollHistoryProps) {
  const { rollHistory, clearHistory } = useDiceRoller();

  const displayedHistory = limit ? rollHistory.slice(0, limit) : rollHistory;

  if (rollHistory.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white border rounded-lg shadow-sm">
        No rolls yet. Start rolling some dice!
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Roll History</h3>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 transition-colors hover:text-red-700 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedHistory.map((roll, idx) => (
          <RollHistoryItem key={idx} roll={roll} />
        ))}
      </div>

      {limit && rollHistory.length > limit && (
        <div className="mt-2 text-sm text-center text-gray-500">
          Showing {limit} of {rollHistory.length} rolls
        </div>
      )}
    </div>
  );
}

interface RollHistoryItemProps {
  roll: RollResult;
}

function RollHistoryItem({ roll }: RollHistoryItemProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleTimeString();
  };

  const getRollLabel = () => {
    let label = `${roll.numDice}${roll.diceType}`;
    if (roll.modifier !== 0) {
      label += roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier;
    }
    return label;
  };

  const getRollModeLabel = () => {
    if (roll.isAdvantage) return '(Adv)';
    if (roll.isDisadvantage) return '(Dis)';
    return '';
  };

  return (
    <div className="flex items-center justify-between p-3 transition-colors bg-gray-50 rounded-lg hover:bg-gray-100">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">
            {getRollLabel()} {getRollModeLabel()}
          </span>
          {roll.description && (
            <span className="text-sm text-gray-600">• {roll.description}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-1">
          {roll.rolls.map((value, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded ${
                value === 20 && roll.diceType === 'd20'
                  ? 'bg-green-100 text-green-800'
                  : value === 1 && roll.diceType === 'd20'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {value}
            </span>
          ))}
          {roll.discardedRolls && roll.discardedRolls.length > 0 && (
            <>
              {roll.discardedRolls.map((value, idx) => (
                <span
                  key={`discarded-${idx}`}
                  className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-gray-400 bg-gray-200 border border-gray-300 rounded line-through"
                >
                  {value}
                </span>
              ))}
            </>
          )}
        </div>

        <div className="mt-1 text-xs text-gray-500">{formatTime(roll.timestamp)}</div>
      </div>

      <div className="ml-4 text-right">
        <div className="text-2xl font-bold text-indigo-600">{roll.finalTotal}</div>
        {roll.modifier !== 0 && (
          <div className="text-xs text-gray-500">
            ({roll.total} {roll.modifier > 0 ? '+' : ''}
            {roll.modifier})
          </div>
        )}
      </div>
    </div>
  );
}
