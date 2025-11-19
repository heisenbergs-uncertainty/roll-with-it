export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Roll With It
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your comprehensive D&D management application for creating and managing campaigns,
          characters, and game content across different rulesets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl mb-4">⚔️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Characters</h2>
          <p className="text-gray-600">
            Create and manage characters with ruleset-specific content. Track stats, spells,
            inventory, and progression.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl mb-4">🎲</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaigns</h2>
          <p className="text-gray-600">
            Run campaigns with shared access for DMs and players. Track sessions, manage the party,
            and keep notes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Library</h2>
          <p className="text-gray-600">
            Browse official D&D content from various sources. Create homebrew content and filter by
            ruleset.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Multi-Ruleset Support</h3>
        <p className="text-blue-800">
          Roll With It supports multiple D&D editions and rulesets. All content is properly tagged
          and filtered, so your characters and campaigns only see relevant material.
        </p>
      </div>

      <div className="bg-gray-100 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Ruleset-specific content filtering</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Source book tracking</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Character creation and management</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Campaign collaboration</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Homebrew content support</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Real-time synchronization</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
