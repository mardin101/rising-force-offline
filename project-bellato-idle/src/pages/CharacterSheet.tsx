import { useState } from 'react';
import { GameMenu, InventoryModal, MacroModal } from '../components/ui';
import { useGameState } from '../state/GameStateContext';
import { getMaxPtForLevel } from '../state/gameStateSlice';

// Stats category tabs
type StatsTab = 'general' | 'status' | 'ability' | 'element';

export default function CharacterSheet() {
  const { gameState, swapInventoryItems, equipItem, unequipItem, useItem, updateMacroState } = useGameState();
  const character = gameState.character;
  const [isStatsMenuOpen, setIsStatsMenuOpen] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isMacroOpen, setIsMacroOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StatsTab>('general');

  const handleCloseStats = () => {
    setIsStatsMenuOpen(false);
  };

  const handleOpenStats = () => {
    setIsStatsMenuOpen(true);
  };

  const handleInfo = () => {
    setShowInfo(!showInfo);
  };

  const handleOpenInventory = () => {
    setIsInventoryOpen(true);
  };

  const handleCloseInventory = () => {
    setIsInventoryOpen(false);
  };

  const handleOpenMacro = () => {
    setIsMacroOpen(true);
  };

  const handleCloseMacro = () => {
    setIsMacroOpen(false);
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

  const { generalInfo, statusInfo, abilityInfo, elementResistInfo } = character;
  const maxPt = getMaxPtForLevel(character.level);

  // Tab configuration
  const tabs: { id: StatsTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'status', label: 'Status' },
    { id: 'ability', label: 'Ability' },
    { id: 'element', label: 'Elem. Resist' },
  ];

  // Render PT stat with experience bar
  const renderPtStat = (label: string, pt: number, exp: number) => (
    <div className="game-menu-row flex-col items-start">
      <div className="flex justify-between w-full">
        <span className="game-menu-label">{label}</span>
        <span className="game-menu-value">
          <span className="text-cyan-400">{pt}</span>
          <span className="text-gray-500"> / {maxPt} Pt</span>
        </span>
      </div>
      <div className="w-full mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500 transition-all duration-300"
          style={{ width: `${Math.min(exp * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  // Render General Info tab content
  const renderGeneralInfo = () => (
    <>
      <div className="game-menu-row">
        <span className="game-menu-label">Name</span>
        <span className="game-menu-value">{generalInfo.name}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Race</span>
        <span className="game-menu-value">{generalInfo.race}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Sex</span>
        <span className="game-menu-value">{generalInfo.sex}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Class</span>
        <span className="game-menu-value">{generalInfo.class}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Class Propensity</span>
        <span className="game-menu-value text-xs">{generalInfo.classPropensity}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Grade</span>
        <span className="game-menu-value-highlight">{generalInfo.grade}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">CP</span>
        <span className="game-menu-value text-amber-400">{generalInfo.cp}</span>
      </div>
      <div className="game-menu-divider"></div>
      <div className="game-menu-row">
        <span className="game-menu-label">Level</span>
        <span className="game-menu-value-highlight">{character.level}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Gold</span>
        <span className="game-menu-value text-yellow-400">{character.gold}</span>
      </div>
    </>
  );

  // Render Status Info tab content
  const renderStatusInfo = () => (
    <>
      <div className="game-menu-row">
        <span className="game-menu-label">HP</span>
        <span className="game-menu-value">
          <span className="text-green-400">{statusInfo.hp}</span>
          <span className="text-gray-500">/{statusInfo.maxHp}</span>
        </span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">FP</span>
        <span className="game-menu-value">
          <span className="text-blue-400">{statusInfo.fp}</span>
          <span className="text-gray-500">/{statusInfo.maxFp}</span>
        </span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">SP</span>
        <span className="game-menu-value">
          <span className="text-yellow-300">{statusInfo.sp}</span>
          <span className="text-gray-500">/{statusInfo.maxSp}</span>
        </span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Def. Gauge</span>
        <span className="game-menu-value">
          <span className="text-purple-400">{statusInfo.defGauge}</span>
          <span className="text-gray-500">/{statusInfo.maxDefGauge}</span>
        </span>
      </div>
      <div className="game-menu-divider"></div>
      <div className="game-menu-row flex-col items-start">
        <div className="flex justify-between w-full">
          <span className="game-menu-label">Experience</span>
          <span className="game-menu-value text-purple-400">
            {(statusInfo.expPoints * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${Math.min(statusInfo.expPoints * 100, 100)}%` }}
          />
        </div>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Gen. Attack</span>
        <span className="game-menu-value text-red-400">{statusInfo.genAttack}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Force Attack</span>
        <span className="game-menu-value text-indigo-400">{statusInfo.forceAttack}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Avg. Def. Pwr</span>
        <span className="game-menu-value text-blue-300">{statusInfo.avgDefPwr}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Avg. Def. Range</span>
        <span className="game-menu-value text-blue-300">{statusInfo.avgDefRange}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Avg. Def. Rate</span>
        <span className="game-menu-value text-blue-300">{statusInfo.avgDefRate}%</span>
      </div>
      <div className="game-menu-divider"></div>
      <div className="game-menu-row">
        <span className="game-menu-label">Attack Speed</span>
        <span className="game-menu-value">{statusInfo.attackSpeed}</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Accuracy</span>
        <span className="game-menu-value">{statusInfo.accuracy}%</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">Dodge</span>
        <span className="game-menu-value">{statusInfo.dodge}%</span>
      </div>
    </>
  );

  // Render Ability Info tab content
  const renderAbilityInfo = () => (
    <>
      <div className="game-menu-section-title">Proficiency Points (Pt)</div>
      <p className="text-xs text-gray-400 mb-3">
        Max Pt at Level {character.level}: {maxPt}
      </p>
      {renderPtStat('Melee', abilityInfo.melee, abilityInfo.meleeExp)}
      {renderPtStat('Range', abilityInfo.range, abilityInfo.rangeExp)}
      {renderPtStat('UNIT', abilityInfo.unit, abilityInfo.unitExp)}
      {renderPtStat('Force', abilityInfo.force, abilityInfo.forceExp)}
      {renderPtStat('Shield', abilityInfo.shield, abilityInfo.shieldExp)}
      {renderPtStat('Defense', abilityInfo.defense, abilityInfo.defenseExp)}
    </>
  );

  // Render Element Resist Info tab content
  const renderElementResistInfo = () => (
    <>
      <div className="game-menu-section-title">Elemental Resistances</div>
      <div className="game-menu-row">
        <span className="game-menu-label">🔥 Fire</span>
        <span className="game-menu-value text-orange-400">{elementResistInfo.fire}%</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">💧 Aqua</span>
        <span className="game-menu-value text-blue-400">{elementResistInfo.aqua}%</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">🌍 Terra</span>
        <span className="game-menu-value text-amber-600">{elementResistInfo.terra}%</span>
      </div>
      <div className="game-menu-row">
        <span className="game-menu-label">💨 Wind</span>
        <span className="game-menu-value text-green-400">{elementResistInfo.wind}%</span>
      </div>
    </>
  );

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralInfo();
      case 'status':
        return renderStatusInfo();
      case 'ability':
        return renderAbilityInfo();
      case 'element':
        return renderElementResistInfo();
      default:
        return renderGeneralInfo();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">Character Sheet</h1>
      <p className="text-gray-300 mb-6">
        View and manage your character's stats, equipment, skills, and proficiency levels.
      </p>

      {/* Action buttons row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Toggle button to show stats menu if closed */}
        {!isStatsMenuOpen && (
          <button
            onClick={handleOpenStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Open Stats Menu
          </button>
        )}
        
        {/* Bag/Inventory button */}
        <button
          onClick={handleOpenInventory}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          aria-label="Open inventory"
        >
          <span className="text-xl">🎒</span>
          <span>Inventory</span>
        </button>

        {/* Macro button */}
        <button
          onClick={handleOpenMacro}
          className={`flex items-center gap-2 px-4 py-2 text-white rounded transition-colors ${
            gameState.macroState.enabled 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
          aria-label="Open macro settings"
        >
          <span className="text-xl">⚗️</span>
          <span>Macro</span>
          {gameState.macroState.enabled && (
            <span className="text-xs bg-green-800 px-1.5 py-0.5 rounded">ON</span>
          )}
        </button>
      </div>

      {/* Stats Menu using GameMenu component */}
      <div className="flex flex-wrap gap-4">
        <GameMenu
          title="Character Stats"
          isOpen={isStatsMenuOpen}
          onClose={handleCloseStats}
          onInfo={handleInfo}
          width={320}
        >
          {showInfo && (
            <div className="game-menu-row bg-blue-900/30 p-2 mb-2 rounded text-xs">
              <span className="text-blue-300">
                💡 Use the tabs below to view different stat categories. PT increases through combat actions.
              </span>
            </div>
          )}

          {/* Category Tabs */}
          <div className="stats-tabs flex mb-3 rounded overflow-hidden border border-blue-500/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`stats-tab flex-1 py-2 px-1 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/60 text-blue-100 shadow-inner'
                    : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-gray-300'
                }`}
                aria-pressed={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </GameMenu>
      </div>

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={handleCloseInventory}
        grid={gameState.inventoryGrid}
        equippedItems={gameState.equippedItems}
        onSwapItems={swapInventoryItems}
        onEquipItem={equipItem}
        onUnequipItem={unequipItem}
        onUseItem={useItem}
      />

      {/* Macro Modal */}
      <MacroModal
        isOpen={isMacroOpen}
        onClose={handleCloseMacro}
        macroState={gameState.macroState}
        inventoryGrid={gameState.inventoryGrid}
        maxHp={statusInfo.maxHp}
        currentHp={statusInfo.hp}
        onUpdateMacro={updateMacroState}
      />
    </div>
  );
}
