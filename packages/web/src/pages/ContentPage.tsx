import { useState } from 'react';

const CONTENT_TYPES = [
  { id: 'races', label: 'Races', icon: '👥' },
  { id: 'classes', label: 'Classes', icon: '⚔️' },
  { id: 'spells', label: 'Spells', icon: '✨' },
  { id: 'items', label: 'Items', icon: '🎒' },
  { id: 'abilities', label: 'Abilities', icon: '💪' },
  { id: 'backgrounds', label: 'Backgrounds', icon: '📜' },
];

export default function ContentPage() {
  const [selectedType, setSelectedType] = useState('races');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
        <p className="text-gray-600 mt-2">Browse D&D content by ruleset and source</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Content Types</h2>
            <nav className="space-y-1">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Filter by Ruleset</h3>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>All Rulesets</option>
                <option>D&D 5e (2014)</option>
                <option>D&D 5e (2024)</option>
              </select>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Filter by Source</h3>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>All Sources</option>
                <option>SRD</option>
                <option>Player's Handbook</option>
                <option>Xanathar's Guide</option>
                <option>Tasha's Cauldron</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Coming Soon</h2>
            <p className="text-gray-600">
              Browse and manage D&D content filtered by ruleset and source
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
