import { useState } from 'react';
import { GameMenu } from '../components/ui';
import { useGameState } from '../state/GameStateContext';

export default function CharacterSheet() {
  const { gameState } = useGameState();
  const character = gameState.character;
  const [isStatsMenuOpen, setIsStatsMenuOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const handleCloseStats = () => {
    setIsStatsMenuOpen(false);
  };

  const handleOpenStats = () => {
    setIsStatsMenuOpen(true);
  };

  const handleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Handle case when no character has been created yet
  if (!character) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Character Sheet</h1>
        <p className="text-gray-300 mb-6">
          No character has been created yet. Please create a character first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">Character Sheet</h1>
      <p className="text-gray-300 mb-6">
        View and manage your character's stats, equipment, skills, and proficiency levels.
      </p>

      {/* Toggle button to show stats menu if closed */}
      {!isStatsMenuOpen && (
        <button
          onClick={handleOpenStats}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Open Stats Menu
        </button>
      )}

      {/* Stats Menu using GameMenu component */}
      <div className="flex flex-wrap gap-4">
        <GameMenu
          title="Character Stats"
          isOpen={isStatsMenuOpen}
          onClose={handleCloseStats}
          onInfo={handleInfo}
          width={300}
        >
          {showInfo && (
            <div className="game-menu-row bg-blue-900/30 p-2 mb-2 rounded text-xs">
              <span className="text-blue-300">
                💡 This menu displays your character's current stats and proficiency levels.
              </span>
            </div>
          )}

          {/* Character Info Section */}
          <div className="game-menu-section-title">Character Info</div>
          <div className="game-menu-row">
            <span className="game-menu-label">Name</span>
            <span className="game-menu-value">{character.name}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Level</span>
            <span className="game-menu-value-highlight">{character.level}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Class</span>
            <span className="game-menu-value">{character.class}</span>
          </div>

          <div className="game-menu-divider"></div>

          {/* Vitals Section */}
          <div className="game-menu-section-title">Vitals</div>
          <div className="game-menu-row">
            <span className="game-menu-label">HP</span>
            <span className="game-menu-value">
              <span className="text-green-400">{character.hp}</span>
              <span className="text-gray-500">/{character.maxHp}</span>
            </span>
          </div>

          <div className="game-menu-divider"></div>

          {/* Combat Stats */}
          <div className="game-menu-section-title">Combat Stats</div>
          <div className="game-menu-row">
            <span className="game-menu-label">Attack</span>
            <span className="game-menu-value text-red-400">{character.attack}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Defense</span>
            <span className="game-menu-value text-blue-300">{character.defense}</span>
          </div>

          <div className="game-menu-divider"></div>

          {/* Resources Section */}
          <div className="game-menu-section-title">Resources</div>
          <div className="game-menu-row">
            <span className="game-menu-label">Gold</span>
            <span className="game-menu-value text-yellow-400">{character.gold}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Experience</span>
            <span className="game-menu-value text-purple-400">{character.experience}</span>
          </div>
        </GameMenu>
      </div>
    </div>
  );
}
