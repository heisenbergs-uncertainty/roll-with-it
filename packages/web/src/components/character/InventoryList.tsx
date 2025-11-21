import { useState } from 'react';
import type { InventoryItem } from '@roll-with-it/shared';
import { Package, Trash2, Star, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface InventoryListProps {
  inventory: InventoryItem[] | null;
  onChange: (inventory: InventoryItem[]) => void;
  readOnly?: boolean;
}

interface InventoryItemWithDetails extends InventoryItem {
  name?: string;
  weight?: number;
  description?: string;
}

export function InventoryList({ inventory, onChange, readOnly = false }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItemWithDetails[]>(inventory || []);
  const [newItemName, setNewItemName] = useState('');
  const [newItemWeight, setNewItemWeight] = useState(0);
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: InventoryItemWithDetails = {
      item_id: `temp_${Date.now()}`, // Temporary ID for custom items
      name: newItemName,
      weight: newItemWeight,
      quantity: newItemQuantity,
      equipped: false,
      attuned: false,
    };

    const updated = [...items, newItem];
    setItems(updated);
    onChange(updated);

    // Reset form
    setNewItemName('');
    setNewItemWeight(0);
    setNewItemQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated);
  };

  const handleToggleEquipped = (index: number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, equipped: !item.equipped } : item
    );
    setItems(updated);
    onChange(updated);
  };

  const handleToggleAttuned = (index: number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, attuned: !item.attuned } : item
    );
    setItems(updated);
    onChange(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const updated = items.map((item, i) =>
      i === index ? { ...item, quantity } : item
    );
    setItems(updated);
    onChange(updated);
  };

  const totalWeight = items.reduce(
    (sum, item) => sum + (item.weight || 0) * item.quantity,
    0
  );

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-700" />
          <h3 className="text-xl font-bold text-gray-900">Inventory</h3>
        </div>
        <div className="text-sm text-gray-600">
          Total Weight: <span className="font-semibold">{totalWeight.toFixed(1)} lbs</span>
        </div>
      </div>

      {/* Add Item Form */}
      {!readOnly && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Item</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="number"
                value={newItemWeight}
                onChange={(e) => setNewItemWeight(parseFloat(e.target.value) || 0)}
                placeholder="Weight"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                placeholder="Qty"
                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <Button type="button" size="sm" onClick={handleAddItem}>
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No items in inventory</p>
          {!readOnly && <p className="text-sm">Add your first item above</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item.item_id}-${index}`}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {/* Equipped/Attuned indicators */}
              {!readOnly && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleToggleEquipped(index)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      item.equipped
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    title="Toggle equipped"
                  >
                    {item.equipped && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <button
                    onClick={() => handleToggleAttuned(index)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      item.attuned
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                    title="Toggle attuned"
                  >
                    {item.attuned && <Star className="w-4 h-4 text-white" />}
                  </button>
                </div>
              )}

              {/* Item details */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {item.name || 'Unknown Item'}
                  </span>
                  {item.equipped && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Equipped
                    </span>
                  )}
                  {item.attuned && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Attuned
                    </span>
                  )}
                </div>
                {item.weight !== undefined && item.weight > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Weight: {item.weight} lbs × {item.quantity} ={' '}
                    {(item.weight * item.quantity).toFixed(1)} lbs
                  </div>
                )}
              </div>

              {/* Quantity control */}
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value) || 1)
                    }
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                    min="1"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {readOnly && (
                <div className="text-sm text-gray-600">
                  Qty: {item.quantity}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Top button = Equipped, Bottom button = Attuned (for magic items)
        </p>
      </div>
    </div>
  );
}
