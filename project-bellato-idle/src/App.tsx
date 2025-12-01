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

  return (
    <QuestProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Navigation Bar */}
        <nav className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-amber-400">Project Bellato Idle</h1>
              <span className="text-gray-400 text-sm">
                {gameState.character.name} - Lv.{gameState.character.level} {gameState.character.class}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage('town')}
                className={`px-4 py-2 rounded transition-colors ${
                  currentPage === 'town'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Town
              </button>
              <button
                onClick={() => setCurrentPage('battle')}
                className={`px-4 py-2 rounded transition-colors ${
                  currentPage === 'battle'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Battle
              </button>
              <button
                onClick={() => setCurrentPage('character')}
                className={`px-4 py-2 rounded transition-colors ${
                  currentPage === 'character'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Character
              </button>
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white transition-colors text-sm"
                title="Reset game and create new character"
              >
                Reset
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto mt-6">
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
