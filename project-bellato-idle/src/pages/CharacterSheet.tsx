import { useState } from 'react';
import { GameMenu } from '../components/ui';

// Demo player stats data
const playerStats = {
  name: 'Bellato Knight',
  level: 42,
  class: 'Myrmidon',
  hp: { current: 1250, max: 1500 },
  sp: { current: 380, max: 400 },
  fp: { current: 50, max: 100 },
  attack: 245,
  defense: 180,
  meleePT: 35,
  rangePT: 12,
  forcePT: 8,
};

export default function CharacterSheet() {
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
            <span className="game-menu-value">{playerStats.name}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Level</span>
            <span className="game-menu-value-highlight">{playerStats.level}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Class</span>
            <span className="game-menu-value">{playerStats.class}</span>
          </div>

          <div className="game-menu-divider"></div>

          {/* Vitals Section */}
          <div className="game-menu-section-title">Vitals</div>
          <div className="game-menu-row">
            <span className="game-menu-label">HP</span>
            <span className="game-menu-value">
              <span className="text-green-400">{playerStats.hp.current}</span>
              <span className="text-gray-500">/{playerStats.hp.max}</span>
            </span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">SP</span>
            <span className="game-menu-value">
              <span className="text-blue-400">{playerStats.sp.current}</span>
              <span className="text-gray-500">/{playerStats.sp.max}</span>
            </span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">FP</span>
            <span className="game-menu-value">
              <span className="text-yellow-400">{playerStats.fp.current}</span>
              <span className="text-gray-500">/{playerStats.fp.max}</span>
            </span>
          </div>

          <div className="game-menu-divider"></div>

          {/* Combat Stats */}
          <div className="game-menu-section-title">Combat Stats</div>
          <div className="game-menu-row">
            <span className="game-menu-label">Attack</span>
            <span className="game-menu-value text-red-400">{playerStats.attack}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Defense</span>
            <span className="game-menu-value text-blue-300">{playerStats.defense}</span>
          </div>

          <div className="game-menu-divider"></div>

          {/* Proficiency Section */}
          <div className="game-menu-section-title">Proficiency (PT)</div>
          <div className="game-menu-row">
            <span className="game-menu-label">Melee PT</span>
            <span className="game-menu-value">{playerStats.meleePT}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Range PT</span>
            <span className="game-menu-value">{playerStats.rangePT}</span>
          </div>
          <div className="game-menu-row">
            <span className="game-menu-label">Force PT</span>
            <span className="game-menu-value">{playerStats.forcePT}</span>
          </div>
        </GameMenu>
      </div>
    </div>
  );
}
