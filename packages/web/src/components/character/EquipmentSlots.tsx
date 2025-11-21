import type { InventoryItem } from '@roll-with-it/shared';
import { Shield, Sword, User2, Hand, Users, Footprints } from 'lucide-react';
import { useItemsByIds } from '@/hooks/useItems';
import { getItemSlot, getItemBonus } from '@/types/database';

interface EquipmentSlotsProps {
  inventory: InventoryItem[] | null;
}

interface SlotInfo {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const EQUIPMENT_SLOTS: SlotInfo[] = [
  { id: 'head', label: 'Head', icon: <User2 className="w-5 h-5" />, description: 'Helmet, hat, circlet' },
  { id: 'neck', label: 'Neck', icon: <Users className="w-5 h-5" />, description: 'Amulet, necklace' },
  { id: 'body', label: 'Body', icon: <Shield className="w-5 h-5" />, description: 'Armor, robe, shirt' },
  { id: 'back', label: 'Back', icon: <Shield className="w-5 h-5" />, description: 'Cloak, cape' },
  { id: 'hands', label: 'Hands', icon: <Hand className="w-5 h-5" />, description: 'Gloves, gauntlets' },
  { id: 'ring', label: 'Rings', icon: <Hand className="w-5 h-5" />, description: 'Up to 2 rings' },
  { id: 'feet', label: 'Feet', icon: <Footprints className="w-5 h-5" />, description: 'Boots, shoes' },
  { id: 'weapon', label: 'Weapon', icon: <Sword className="w-5 h-5" />, description: 'Main hand weapon' },
  { id: 'shield', label: 'Shield/Off-hand', icon: <Shield className="w-5 h-5" />, description: 'Shield or second weapon' },
];

export function EquipmentSlots({ inventory }: EquipmentSlotsProps) {
  const invItems = inventory || [];
  const equippedItems = invItems.filter(item => item.equipped);

  // Fetch full item details for equipped items
  const itemIds = equippedItems.map(inv => inv.item_id);
  const { data: fullItems = [] } = useItemsByIds(itemIds);

  const getItemsInSlot = (slotId: string) => {
    return equippedItems
      .map(invItem => {
        const fullItem = fullItems.find(item => item.id === invItem.item_id);
        if (!fullItem) return null;
        const itemSlot = getItemSlot(fullItem);
        if (itemSlot !== slotId) return null;
        return { invItem, fullItem };
      })
      .filter((item): item is { invItem: InventoryItem; fullItem: any } => item !== null);
  };

  const calculateTotalACBonus = (): number => {
    return equippedItems.reduce((total, invItem) => {
      const fullItem = fullItems.find(item => item.id === invItem.item_id);
      if (!fullItem) return total;

      const bonus = getItemBonus(fullItem);
      if (bonus?.ac) {
        return total + bonus.ac;
      }

      // For armor/shields, use the armorClass value
      const slot = getItemSlot(fullItem);
      if (slot === 'body' && fullItem.armor_class) {
        return total + fullItem.armor_class;
      }
      if (slot === 'shield' && fullItem.armor_class) {
        return total + fullItem.armor_class;
      }

      return total;
    }, 0);
  };

  const totalACBonus = calculateTotalACBonus();
  const equippedCount = equippedItems.length;

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Equipment Slots</h3>
        <div className="text-sm text-gray-600">
          {equippedCount} item{equippedCount !== 1 ? 's' : ''} equipped
        </div>
      </div>

      {/* AC Bonus Summary */}
      {totalACBonus > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold text-blue-800">
            Total AC from Equipment: +{totalACBonus}
          </p>
        </div>
      )}

      {/* Equipment Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EQUIPMENT_SLOTS.map((slot) => {
          const slotItems = getItemsInSlot(slot.id);
          const hasItem = slotItems.length > 0;
          const isRingSlot = slot.id === 'ring';
          const maxItems = isRingSlot ? 2 : 1;

          return (
            <div
              key={slot.id}
              className={`p-3 border-2 rounded-lg transition-colors ${
                hasItem
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${
                  hasItem ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {slot.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-gray-900">{slot.label}</h4>
                    {isRingSlot && (
                      <span className="text-xs text-gray-500">
                        {slotItems.length}/{maxItems}
                      </span>
                    )}
                  </div>

                  {hasItem ? (
                    <div className="space-y-1">
                      {slotItems.map(({ fullItem }, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="font-medium text-gray-900 truncate">
                            {fullItem.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {fullItem.damage && `${fullItem.damage.dice} ${fullItem.damage.type}`}
                            {fullItem.armor_class && `AC ${fullItem.armor_class}`}
                            {(() => {
                              const bonus = getItemBonus(fullItem);
                              return (
                                <>
                                  {bonus?.ac && ` (+${bonus.ac} AC)`}
                                  {bonus?.attack && ` (+${bonus.attack} ATK)`}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {slot.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {equippedCount === 0 && (
        <div className="mt-4 text-center text-gray-500 py-6">
          <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No equipment currently equipped</p>
          <p className="text-xs mt-1">Mark items as equipped in your inventory</p>
        </div>
      )}

      {/* Helper text */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
        <p className="text-xs text-gray-600">
          <strong>Tip:</strong> Equipment bonuses automatically apply when items are equipped.
          You can wear up to 2 rings.
        </p>
      </div>
    </div>
  );
}
