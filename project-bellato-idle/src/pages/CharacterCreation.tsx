import { useState, type FormEvent } from 'react';
import { useGameState } from '../state/GameStateContext';
import {
  CHARACTER_CLASSES,
  CLASS_BASE_STATS,
  CHARACTER_NAME_MAX_LENGTH,
  validateCharacterName,
  type CharacterClass,
} from '../state/gameStateSlice';

const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  [CHARACTER_CLASSES.WARRIOR]: 'A stalwart frontline fighter with high HP and balanced offensive and defensive capabilities.',
  [CHARACTER_CLASSES.RANGER]: 'A swift ranged combatant with high attack power but lower defenses.',
  [CHARACTER_CLASSES.SPIRITUALIST]: 'A master of force powers with devastating magical abilities.',
  [CHARACTER_CLASSES.SPECIALIST]: 'A versatile support class with balanced stats and utility skills.',
};

export default function CharacterCreation() {
  const { createNewCharacter } = useGameState();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>(CHARACTER_CLASSES.WARRIOR);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    const validation = validateCharacterName(trimmedName);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid character name');
      return;
    }

    createNewCharacter(trimmedName, selectedClass);
  };

  const classOptions = Object.values(CHARACTER_CLASSES);
  const selectedStats = CLASS_BASE_STATS[selectedClass];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">
            Create Your Character
          </h1>
          <p className="text-gray-400">
            Begin your journey in the Bellato Federation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Character Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Enter your character name"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              maxLength={CHARACTER_NAME_MAX_LENGTH}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Choose Your Class
            </label>
            <div className="grid grid-cols-2 gap-3">
              {classOptions.map((charClass) => (
                <button
                  key={charClass}
                  type="button"
                  onClick={() => setSelectedClass(charClass)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedClass === charClass
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium">{charClass}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Class Description */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-amber-400 font-medium mb-2">{selectedClass}</h3>
            <p className="text-gray-300 text-sm mb-3">
              {CLASS_DESCRIPTIONS[selectedClass]}
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <span className="text-gray-400 block">HP</span>
                <span className="text-green-400 font-medium">{selectedStats.hp}</span>
              </div>
              <div className="text-center">
                <span className="text-gray-400 block">Gen. Attack</span>
                <span className="text-red-400 font-medium">{selectedStats.genAttack}</span>
              </div>
              <div className="text-center">
                <span className="text-gray-400 block">Avg. Def.</span>
                <span className="text-blue-400 font-medium">{selectedStats.avgDefPwr}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Start Adventure
          </button>
        </form>
      </div>
    </div>
  );
}
