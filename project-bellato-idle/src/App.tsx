import { useState } from 'react'
import './App.css'
import Town from './pages/Town'
import Battle from './pages/Battle'
import CharacterSheet from './pages/CharacterSheet'
import CharacterCreation from './pages/CharacterCreation'
import { QuestProvider } from './state/QuestContext'
import { GameStateProvider, useGameState } from './state/GameStateContext'

type Page = 'town' | 'battle' | 'character'

function GameContent() {
  const { gameState, resetGame } = useGameState()
  const [currentPage, setCurrentPage] = useState<Page>('town')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Show character creation if no character exists
  if (!gameState.hasStartedGame || !gameState.character) {
    return <CharacterCreation />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'town':
        return <Town />
      case 'battle':
        return <Battle />
      case 'character':
        return <CharacterSheet />
    }
  }

  const handleNavClick = (page: Page) => {
    setCurrentPage(page)
    setIsMenuOpen(false)
  }

  return (
    <QuestProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation Bar */}
        <nav className="bg-gray-800 border-b border-gray-700 p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            {/* Mobile and Desktop Header */}
            <div className="flex items-center justify-between">
              {/* Title and Character Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-amber-400 truncate">Project Bellato Idle</h1>
                <span className="text-gray-400 text-xs sm:text-sm truncate">
                  {gameState.character.generalInfo.name} - Lv.{gameState.character.level} {gameState.character.generalInfo.class}
                </span>
              </div>
              
              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden md:flex gap-2 lg:gap-4">
                <button
                  onClick={() => setCurrentPage('town')}
                  className={`px-3 lg:px-4 py-2 rounded transition-colors ${
                    currentPage === 'town'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Town
                </button>
                <button
                  onClick={() => setCurrentPage('battle')}
                  className={`px-3 lg:px-4 py-2 rounded transition-colors ${
                    currentPage === 'battle'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Battle
                </button>
                <button
                  onClick={() => setCurrentPage('character')}
                  className={`px-3 lg:px-4 py-2 rounded transition-colors ${
                    currentPage === 'character'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Character
                </button>
                <button
                  onClick={resetGame}
                  className="px-3 lg:px-4 py-2 rounded bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white transition-colors text-sm"
                  title="Reset game and create new character"
                >
                  Reset
                </button>
              </div>

              {/* Mobile Hamburger Button - Visible only on mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Menu - Collapsible */}
            {isMenuOpen && (
              <div className="md:hidden mt-3 pt-3 border-t border-gray-700">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleNavClick('town')}
                    aria-label="Town"
                    className={`px-4 py-3 rounded transition-colors text-left ${
                      currentPage === 'town'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span aria-hidden="true">🏠 </span>Town
                  </button>
                  <button
                    onClick={() => handleNavClick('battle')}
                    aria-label="Battle"
                    className={`px-4 py-3 rounded transition-colors text-left ${
                      currentPage === 'battle'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span aria-hidden="true">⚔️ </span>Battle
                  </button>
                  <button
                    onClick={() => handleNavClick('character')}
                    aria-label="Character"
                    className={`px-4 py-3 rounded transition-colors text-left ${
                      currentPage === 'character'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span aria-hidden="true">👤 </span>Character
                  </button>
                  <button
                    onClick={() => {
                      resetGame()
                      setIsMenuOpen(false)
                    }}
                    aria-label="Reset Game"
                    className="px-4 py-3 rounded bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white transition-colors text-left"
                    title="Reset game and create new character"
                  >
                    <span aria-hidden="true">🔄 </span>Reset Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto mt-4 sm:mt-6 px-3 sm:px-0">
          {renderPage()}
        </main>
      </div>
    </QuestProvider>
  )
}

function App() {
  return (
    <GameStateProvider>
      <GameContent />
    </GameStateProvider>
  )
}

export default App
