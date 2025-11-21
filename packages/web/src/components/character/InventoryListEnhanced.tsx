import { useState, useEffect } from 'react';
import type { InventoryItem, Item } from '@roll-with-it/shared';
import { Package, Trash2, Star, Check, Search, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useItemSearch, useItemsByIds } from '@/hooks/useItems';
import { getItemSlot } from '@/types/database';

interface InventoryListEnhancedProps {
  inventory: InventoryItem[] | null;
  onChange: (inventory: InventoryItem[]) => void;
  readOnly?: boolean;
}

const MAX_ATTUNEMENT = 3;

export function InventoryListEnhanced({ inventory, onChange, readOnly = false }: InventoryListEnhancedProps) {
  const [items, setItems] = useState<InventoryItem[]>(inventory || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [customQuantity, setCustomQuantity] = useState(1);

  // Sync with props
  useEffect(() => {
    setItems(inventory || []);
  }, [inventory]);

  // Fetch full item details for current inventory
  const itemIds = items.map(inv => inv.item_id);
  const { data: fullItems = [] } = useItemsByIds(itemIds);

  // Search items from database
  const { data: searchResults = [] } = useItemSearch(searchQuery);

  // Count attuned items
  const attunedCount = items.filter(item => item.attuned).length;

  // Calculate total weight
  const totalWeight = items.reduce((sum, invItem) => {
    const fullItem = fullItems.find(item => item.id === invItem.item_id);
    return sum + (fullItem?.weight || 0) * invItem.quantity;
  }, 0);

  const handleAddItem = (item: Item, quantity: number = 1) => {
    const newItem: InventoryItem = {
      item_id: item.id,
      quantity,
      equipped: false,
      attuned: false,
    };

    const updated = [...items, newItem];
    setItems(updated);
    onChange(updated);

    // Reset
    setSearchQuery('');
    setSelectedItem(null);
    setCustomQuantity(1);
    setShowSuggestions(false);
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
    const item = items[index];

    // Check attunement limit
    if (!item.attuned && attunedCount >= MAX_ATTUNEMENT) {
      alert(`You can only attune to ${MAX_ATTUNEMENT} items at a time. Un-attune another item first.`);
      return;
    }

    const updated = items.map((it, i) =>
      i === index ? { ...it, attuned: !it.attuned } : it
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

      {/* Attunement Counter */}
      {attunedCount > 0 && (
        <div className={`mb-4 p-3 rounded ${
          attunedCount >= MAX_ATTUNEMENT
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-sm font-semibold ${
            attunedCount >= MAX_ATTUNEMENT ? 'text-red-700' : 'text-blue-700'
          }`}>
            <Star className="w-4 h-4 inline mr-1" />
            Attuned Items: {attunedCount} / {MAX_ATTUNEMENT}
            {attunedCount >= MAX_ATTUNEMENT && ' (Maximum reached!)'}
          </p>
        </div>
      )}

      {/* Item Search & Add */}
      {!readOnly && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Item</h4>

          {/* Search */}
          <div className="relative mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search items... (e.g., 'longsword', 'leather armor')"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setSearchQuery(item.name);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.type} • {item.weight} lbs
                          {item.damage && ` • ${item.damage.dice} ${item.damage.type}`}
                          {item.armor_class && ` • AC ${item.armor_class}`}
                        </div>
                      </div>
                      {item.rarity && item.rarity !== 'common' && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                          item.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                          item.rarity === 'very rare' ? 'bg-purple-100 text-purple-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.rarity}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected item preview & add button */}
          {selectedItem && (
            <div className="p-3 bg-white border border-gray-300 rounded mb-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{selectedItem.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedItem.type} • {selectedItem.weight} lbs
                    {selectedItem.requires_attunement && ' • Requires Attunement'}
                  </div>
                </div>
                <input
                  type="number"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                  min="1"
                />
              </div>
              {selectedItem.description && (
                <p className="text-xs text-gray-600 mb-2">{selectedItem.description}</p>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => handleAddItem(selectedItem, customQuantity)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Inventory
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No items in inventory</p>
          {!readOnly && <p className="text-sm">Search for an item above to add it</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((invItem, index) => {
            const fullItem = fullItems.find(item => item.id === invItem.item_id);
            if (!fullItem) return null; // Skip if item not loaded yet

            const slot = getItemSlot(fullItem);

            return (
              <div
                key={`${invItem.item_id}-${index}`}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {/* Equipped/Attuned indicators */}
                {!readOnly && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleToggleEquipped(index)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        invItem.equipped
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      title="Toggle equipped"
                    >
                      {invItem.equipped && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <button
                      onClick={() => handleToggleAttuned(index)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        invItem.attuned
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-gray-300 hover:border-purple-400'
                      }`}
                      title="Toggle attuned"
                    >
                      {invItem.attuned && <Star className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                )}

                {/* Item details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {fullItem.name}
                    </span>
                    {invItem.equipped && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Equipped
                      </span>
                    )}
                    {invItem.attuned && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        Attuned
                      </span>
                    )}
                    {slot && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {slot}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {fullItem.weight !== null && fullItem.weight !== undefined && fullItem.weight > 0 && (
                      <span>
                        {fullItem.weight} lbs × {invItem.quantity} = {(fullItem.weight * invItem.quantity).toFixed(1)} lbs
                      </span>
                    )}
                    {fullItem.damage && <span className="ml-2">• {fullItem.damage.dice} {fullItem.damage.type}</span>}
                    {fullItem.armor_class && <span className="ml-2">• AC {fullItem.armor_class}</span>}
                  </div>
                  {fullItem.description && (
                    <div className="text-xs text-gray-600 mt-1">{fullItem.description}</div>
                  )}
                </div>

                {/* Quantity control */}
                {!readOnly && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={invItem.quantity}
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
                    Qty: {invItem.quantity}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Search D&D 5e SRD items:</strong> Weapons, armor, gear, potions, and magic items available.
          Max {MAX_ATTUNEMENT} attuned items.
        </p>
      </div>
    </div>
  );
}
