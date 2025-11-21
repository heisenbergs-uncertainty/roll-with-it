import { useState } from 'react';
import type { Currency } from '@roll-with-it/shared';
import { Coins } from 'lucide-react';

interface CurrencyEditorProps {
  currency: Currency | null;
  onChange: (currency: Currency) => void;
  readOnly?: boolean;
}

const currencyTypes = [
  { key: 'pp' as const, label: 'Platinum', abbr: 'PP', color: 'text-gray-400' },
  { key: 'gp' as const, label: 'Gold', abbr: 'GP', color: 'text-yellow-600' },
  { key: 'sp' as const, label: 'Silver', abbr: 'SP', color: 'text-gray-500' },
  { key: 'cp' as const, label: 'Copper', abbr: 'CP', color: 'text-orange-700' },
];

export function CurrencyEditor({ currency, onChange, readOnly = false }: CurrencyEditorProps) {
  const [localCurrency, setLocalCurrency] = useState<Currency>(
    currency || { cp: 0, sp: 0, gp: 0, pp: 0 }
  );

  const handleChange = (type: keyof Currency, value: number) => {
    const updated = { ...localCurrency, [type]: value };
    setLocalCurrency(updated);
    onChange(updated);
  };

  const totalInGold =
    localCurrency.pp * 10 +
    localCurrency.gp +
    localCurrency.sp / 10 +
    localCurrency.cp / 100;

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-900">Currency</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {currencyTypes.map(({ key, label, abbr, color }) => (
          <div key={key} className="flex flex-col">
            <label className={`text-sm font-medium mb-1 ${color}`}>
              {label} ({abbr})
            </label>
            <input
              type="number"
              value={localCurrency[key]}
              onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
              disabled={readOnly}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              min="0"
            />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total value in gold pieces:</span>
          <span className="text-lg font-bold text-yellow-600">
            {totalInGold.toFixed(2)} GP
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Conversion rates:</strong> 1 PP = 10 GP, 1 GP = 10 SP, 1 SP = 10 CP
        </p>
      </div>
    </div>
  );
}
