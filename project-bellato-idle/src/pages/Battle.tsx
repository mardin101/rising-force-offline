import { useState } from 'react';
import zones from '../data/zones.json';
import monsters from '../data/monsters.json';

interface Zone {
  id: string;
  name: string;
  levelRequirement: number;
  monsters: string[];
  description: string;
}

interface Monster {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldDrop: number[];
  levelRange: number[];
  materialDropId: string;
  materialDropRate: number;
}

export default function Battle() {
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    setIsPortalOpen(false);
  };

  const getMonstersByZone = (zone: Zone): Monster[] => {
    return (monsters as Monster[]).filter((monster) => zone.monsters.includes(monster.id));
  };

  return (
    <div className="p-6 relative">
      {/* Portal Button - Top Right Corner */}
      <button
        onClick={() => setIsPortalOpen(!isPortalOpen)}
        className="absolute top-0 right-0 w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 border-4 border-purple-400 shadow-lg shadow-purple-500/50 flex items-center justify-center transition-all hover:scale-105 text-white font-bold text-xs"
        title="Open Portal"
      >
        Portal
      </button>

      {/* Portal Region Selection Modal */}
      {isPortalOpen && (
        <div className="absolute top-20 right-0 w-72 bg-gray-800 border border-purple-500 rounded-lg shadow-xl z-10">
          <div className="p-4 border-b border-purple-500">
            <h3 className="text-lg font-bold text-purple-400">Select Region</h3>
          </div>
          <ul className="p-2 max-h-64 overflow-y-auto">
            {(zones as Zone[]).map((zone) => (
              <li key={zone.id}>
                <button
                  onClick={() => handleZoneSelect(zone)}
                  className={`w-full text-left p-3 rounded hover:bg-purple-900/50 transition-colors ${
                    selectedZone?.id === zone.id ? 'bg-purple-900/70 border-l-4 border-purple-400' : ''
                  }`}
                >
                  <span className="text-white font-medium">{zone.name}</span>
                  <span className="block text-xs text-gray-400">Lvl {zone.levelRequirement}+</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h1 className="text-3xl font-bold text-red-500 mb-4">Battle Arena</h1>
      <p className="text-gray-300 mb-6">
        Select a zone and begin your idle battle against monsters.
        Auto-battle will continue until your character is defeated.
      </p>

      {/* Selected Zone Info */}
      {selectedZone ? (
        <div className="mt-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
            <h2 className="text-xl font-bold text-purple-400 mb-2">{selectedZone.name}</h2>
            <p className="text-gray-400 text-sm mb-2">{selectedZone.description}</p>
            <span className="text-xs text-amber-400">Required Level: {selectedZone.levelRequirement}</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-200 mb-3">Available Monsters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getMonstersByZone(selectedZone).map((monster) => (
              <div
                key={monster.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition-colors"
              >
                <h4 className="text-lg font-bold text-red-400 mb-2">{monster.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">HP:</span> {monster.hp}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">ATK:</span> {monster.attack}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">DEF:</span> {monster.defense}
                  </p>
                  <p className="text-amber-400">
                    <span className="text-gray-500">EXP:</span> {(monster.expReward * 100).toFixed(1)}%
                  </p>
                  <p className="text-yellow-400">
                    <span className="text-gray-500">Gold:</span> {monster.goldDrop[0]}-{monster.goldDrop[1]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center p-8 bg-gray-800/50 rounded-lg border border-dashed border-gray-600">
          <p className="text-gray-400">Click the <span className="text-purple-400 font-bold">Portal</span> button to select a region</p>
        </div>
      )}
    </div>
  );
}
