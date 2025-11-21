import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SpellSlot {
  level: number;
  total: number;
  used: number;
}

interface SpellSlotTrackerProps {
  slots: SpellSlot[];
  onSlotsChange: (slots: SpellSlot[]) => void;
  className?: string;
}

export function SpellSlotTracker({ slots, onSlotsChange, className }: SpellSlotTrackerProps) {
  const [localSlots, setLocalSlots] = useState<SpellSlot[]>(slots);

  useEffect(() => {
    setLocalSlots(slots);
  }, [slots]);

  const handleToggleSlot = (level: number, slotIndex: number) => {
    const updatedSlots = localSlots.map((slot) => {
      if (slot.level === level) {
        // Toggle: if clicking on an unused slot, mark it as used
        // If clicking on a used slot, mark it as unused
        const newUsed = slotIndex < slot.used ? slot.used - 1 : slotIndex + 1;
        return { ...slot, used: Math.max(0, Math.min(newUsed, slot.total)) };
      }
      return slot;
    });
    setLocalSlots(updatedSlots);
    onSlotsChange(updatedSlots);
  };

  const handleLongRest = () => {
    const restoredSlots = localSlots.map((slot) => ({ ...slot, used: 0 }));
    setLocalSlots(restoredSlots);
    onSlotsChange(restoredSlots);
  };

  const totalSlotsUsed = localSlots.reduce((sum, slot) => sum + slot.used, 0);
  const totalSlotsAvailable = localSlots.reduce((sum, slot) => sum + slot.total, 0);

  // Filter out levels with no slots
  const activeSlots = localSlots.filter((slot) => slot.total > 0);

  if (activeSlots.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spell Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This character does not have any spell slots. Spell slots are granted by spellcasting classes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spell Slots</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalSlotsAvailable - totalSlotsUsed}/{totalSlotsAvailable} Available
          </span>
          <Button variant="outline" size="sm" onClick={handleLongRest}>
            Long Rest
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSlots.map((slot) => (
            <div key={slot.level} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Level {slot.level}
                </span>
                <span className="text-sm text-muted-foreground">
                  {slot.total - slot.used}/{slot.total}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: slot.total }).map((_, index) => {
                  const isUsed = index < slot.used;
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggleSlot(slot.level, index)}
                      className={cn(
                        'w-8 h-8 rounded border-2 transition-colors',
                        isUsed
                          ? 'bg-muted border-muted-foreground/20'
                          : 'bg-primary border-primary hover:bg-primary/80'
                      )}
                      title={isUsed ? 'Click to restore' : 'Click to use'}
                    >
                      {!isUsed && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
