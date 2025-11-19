export default function CharactersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Characters</h1>
        <p className="text-gray-600 mt-2">Manage your D&D characters</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">⚔️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Characters Yet</h2>
        <p className="text-gray-600 mb-4">Create your first character to get started</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create Character
        </button>
      </div>
    </div>
  );
}
