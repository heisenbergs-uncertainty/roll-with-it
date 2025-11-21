import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Plus, Trash2 } from 'lucide-react';

interface SpellSlot {
  level: number;
  total: number;
  used: number;
}

interface SpellSlotEditorProps {
  slots: SpellSlot[];
  onChange: (slots: SpellSlot[]) => void;
}

export function SpellSlotEditor({ slots, onChange }: SpellSlotEditorProps) {
  const [editingSlots, setEditingSlots] = useState<SpellSlot[]>(slots);

  const handleAddLevel = (level: number) => {
    const existing = editingSlots.find(s => s.level === level);
    if (existing) {
      // Increment existing
      const updated = editingSlots.map(s =>
        s.level === level ? { ...s, total: s.total + 1 } : s
      );
      setEditingSlots(updated);
      onChange(updated);
    } else {
      // Add new level
      const updated = [...editingSlots, { level, total: 1, used: 0 }].sort((a, b) => a.level - b.level);
      setEditingSlots(updated);
      onChange(updated);
    }
  };

  const handleRemoveLevel = (level: number) => {
    const existing = editingSlots.find(s => s.level === level);
    if (!existing) return;

    if (existing.total > 1) {
      // Decrement
      const updated = editingSlots.map(s =>
        s.level === level ? { ...s, total: s.total - 1 } : s
      );
      setEditingSlots(updated);
      onChange(updated);
    } else {
      // Remove entirely
      const updated = editingSlots.filter(s => s.level !== level);
      setEditingSlots(updated);
      onChange(updated);
    }
  };

  const handleSetTotal = (level: number, total: number) => {
    if (total <= 0) {
      handleRemoveLevel(level);
      return;
    }

    const updated = editingSlots.map(s =>
      s.level === level ? { ...s, total, used: Math.min(s.used, total) } : s
    );
    setEditingSlots(updated);
    onChange(updated);
  };

  const quickSetWizard = (characterLevel: number) => {
    // Standard wizard spell slot progression
    const wizardSlots: Record<number, number[]> = {
      1: [2],
      2: [3],
      3: [4, 2],
      4: [4, 3],
      5: [4, 3, 2],
      6: [4, 3, 3],
      7: [4, 3, 3, 1],
      8: [4, 3, 3, 2],
      9: [4, 3, 3, 3, 1],
      10: [4, 3, 3, 3, 2],
      11: [4, 3, 3, 3, 2, 1],
      12: [4, 3, 3, 3, 2, 1],
      13: [4, 3, 3, 3, 2, 1, 1],
      14: [4, 3, 3, 3, 2, 1, 1],
      15: [4, 3, 3, 3, 2, 1, 1, 1],
      16: [4, 3, 3, 3, 2, 1, 1, 1],
      17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
      18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
      19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
      20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
    };

    const slotsForLevel = wizardSlots[characterLevel];
    if (!slotsForLevel) return;

    const newSlots: SpellSlot[] = slotsForLevel.map((total, index) => ({
      level: index + 1,
      total,
      used: 0,
    }));

    setEditingSlots(newSlots);
    onChange(newSlots);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Spell Slots Configuration</h3>
        <div className="flex gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level > 0) {
                quickSetWizard(level);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="">Quick Set (Wizard)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(lvl => (
              <option key={lvl} value={lvl}>Level {lvl} Wizard</option>
            ))}
          </select>
        </div>
      </div>

      {/* Spell Level Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
          const slot = editingSlots.find(s => s.level === level);
          const count = slot?.total || 0;

          return (
            <div key={level} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Level {level}</span>
                <span className="text-sm text-gray-600">{count} slots</span>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveLevel(level)}
                  disabled={count === 0}
                  className="flex-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <input
                  type="number"
                  min="0"
                  max="9"
                  value={count}
                  onChange={(e) => handleSetTotal(level, parseInt(e.target.value) || 0)}
                  className="w-12 text-center border rounded px-1 py-1 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddLevel(level)}
                  className="flex-1"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {editingSlots.length === 0 && (
        <div className="text-center py-6 text-sm text-gray-600">
          No spell slots configured. Add spell slots above or use Quick Set for your character level.
        </div>
      )}
    </div>
  );
}
