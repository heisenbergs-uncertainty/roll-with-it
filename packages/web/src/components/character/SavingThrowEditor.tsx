import { useState, useEffect } from 'react';
import type { SavingThrows } from '@roll-with-it/shared';

interface SavingThrowEditorProps {
  savingThrows: SavingThrows | null;
  onChange: (savingThrows: SavingThrows) => void;
}

const abilities = [
  { key: 'str' as const, label: 'Strength' },
  { key: 'dex' as const, label: 'Dexterity' },
  { key: 'con' as const, label: 'Constitution' },
  { key: 'int' as const, label: 'Intelligence' },
  { key: 'wis' as const, label: 'Wisdom' },
  { key: 'cha' as const, label: 'Charisma' },
];

const defaultSave = { proficient: false, bonus: 0 };

export function SavingThrowEditor({ savingThrows, onChange }: SavingThrowEditorProps) {
  const [localSaves, setLocalSaves] = useState<SavingThrows>(
    savingThrows || {
      str: defaultSave,
      dex: defaultSave,
      con: defaultSave,
      int: defaultSave,
      wis: defaultSave,
      cha: defaultSave,
    }
  );

  useEffect(() => {
    if (savingThrows) {
      setLocalSaves(savingThrows);
    }
  }, [savingThrows]);

  const handleSaveChange = (
    ability: keyof SavingThrows,
    proficient: boolean
  ) => {
    const updatedSaves = {
      ...localSaves,
      [ability]: {
        ...localSaves[ability],
        proficient,
      },
    };
    setLocalSaves(updatedSaves);
    onChange(updatedSaves);
  };

  const proficientCount = Object.values(localSaves).filter(
    (save) => save.proficient
  ).length;

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Saving Throw Proficiencies
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Most classes grant proficiency in 2 saving throws. Select which saves your character is proficient in.
      </p>

      <div className="space-y-2 mb-4">
        {abilities.map(({ key, label }) => {
          const save = localSaves[key] || defaultSave;

          return (
            <div
              key={key}
              className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
            >
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={save.proficient}
                  onChange={(e) => handleSaveChange(key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">
                  {label}
                </span>
                <span className="text-xs text-gray-500 uppercase">
                  {key}
                </span>
              </label>

              {save.proficient && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Proficient
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={`p-3 border rounded ${
        proficientCount === 2
          ? 'bg-green-50 border-green-200'
          : proficientCount > 2
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <p className={`text-sm ${
          proficientCount === 2
            ? 'text-green-800'
            : proficientCount > 2
            ? 'text-yellow-800'
            : 'text-gray-700'
        }`}>
          <strong>Proficiencies selected:</strong> {proficientCount} / 2
          {proficientCount > 2 && ' (More than typical - ensure this is correct)'}
          {proficientCount === 2 && ' ✓'}
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Common proficiencies by class:</strong>
        </p>
        <ul className="text-xs text-blue-700 mt-2 space-y-1">
          <li>• Fighter: STR, CON</li>
          <li>• Wizard: INT, WIS</li>
          <li>• Rogue: DEX, INT</li>
          <li>• Cleric: WIS, CHA</li>
        </ul>
      </div>
    </div>
  );
}
