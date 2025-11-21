import type { InventoryItem, AbilityScores } from '@roll-with-it/shared';
import { Weight } from 'lucide-react';

interface EncumbranceTrackerProps {
  inventory: InventoryItem[] | null;
  abilityScores: AbilityScores;
}

interface InventoryItemWithWeight extends InventoryItem {
  weight?: number;
}

export function EncumbranceTracker({ inventory, abilityScores }: EncumbranceTrackerProps) {
  const strScore = abilityScores.str;

  // D&D 5e encumbrance rules
  const carryingCapacity = strScore * 15;
  const encumberedAt = strScore * 5;
  const heavilyEncumberedAt = strScore * 10;

  // Calculate total weight
  const totalWeight = (inventory as InventoryItemWithWeight[] || []).reduce(
    (sum, item) => sum + (item.weight || 0) * item.quantity,
    0
  );

  // Determine encumbrance level
  let encumbranceLevel: 'normal' | 'encumbered' | 'heavily' | 'over';
  let encumbranceColor: string;
  let speedPenalty = 0;

  if (totalWeight > carryingCapacity) {
    encumbranceLevel = 'over';
    encumbranceColor = 'text-red-700 bg-red-100';
    speedPenalty = Infinity; // Can't move
  } else if (totalWeight > heavilyEncumberedAt) {
    encumbranceLevel = 'heavily';
    encumbranceColor = 'text-orange-700 bg-orange-100';
    speedPenalty = 20; // Speed -20 ft
  } else if (totalWeight > encumberedAt) {
    encumbranceLevel = 'encumbered';
    encumbranceColor = 'text-yellow-700 bg-yellow-100';
    speedPenalty = 10; // Speed -10 ft
  } else {
    encumbranceLevel = 'normal';
    encumbranceColor = 'text-green-700 bg-green-100';
  }

  const percentCarried = (totalWeight / carryingCapacity) * 100;

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Weight className="w-5 h-5 text-gray-700" />
        <h3 className="text-xl font-bold text-gray-900">Encumbrance</h3>
      </div>

      {/* Weight bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">
            Carrying: {totalWeight.toFixed(1)} / {carryingCapacity} lbs
          </span>
          <span className={`font-semibold ${encumbranceColor.split(' ')[0]}`}>
            {encumbranceLevel === 'normal' && 'Normal'}
            {encumbranceLevel === 'encumbered' && 'Encumbered'}
            {encumbranceLevel === 'heavily' && 'Heavily Encumbered'}
            {encumbranceLevel === 'over' && 'Over Capacity!'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              encumbranceLevel === 'normal'
                ? 'bg-green-500'
                : encumbranceLevel === 'encumbered'
                ? 'bg-yellow-500'
                : encumbranceLevel === 'heavily'
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentCarried, 100)}%` }}
          />
        </div>
      </div>

      {/* Encumbrance thresholds */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Encumbered threshold:</span>
          <span className="font-semibold">{encumberedAt} lbs</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Heavily encumbered threshold:</span>
          <span className="font-semibold">{heavilyEncumberedAt} lbs</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Max carrying capacity:</span>
          <span className="font-semibold">{carryingCapacity} lbs</span>
        </div>
      </div>

      {/* Status effects */}
      {(speedPenalty > 0 || encumbranceLevel === 'over') && (
        <div className={`p-3 rounded ${encumbranceColor}`}>
          <p className="text-sm font-semibold">
            {encumbranceLevel === 'over' && '❌ Cannot move! Drop items to continue.'}
            {encumbranceLevel === 'heavily' &&
              `⚠️ Speed reduced by ${speedPenalty} ft. Disadvantage on ability checks, attack rolls, and saving throws that use STR, DEX, or CON.`}
            {encumbranceLevel === 'encumbered' &&
              `⚠️ Speed reduced by ${speedPenalty} ft.`}
          </p>
        </div>
      )}

      {/* Rules reference */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>D&D 5e Encumbrance (Optional Rule):</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-2 space-y-1">
          <li>• Carrying capacity = STR × 15 lbs</li>
          <li>• Encumbered at STR × 5 lbs (speed -10 ft)</li>
          <li>• Heavily encumbered at STR × 10 lbs (speed -20 ft, disadvantage)</li>
        </ul>
      </div>
    </div>
  );
}
