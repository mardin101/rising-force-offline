import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  type GameState,
  type Character,
  type CharacterClass,
  initialGameState,
  createCharacter,
  GAME_STATE_STORAGE_KEY,
} from './gameStateSlice';

export interface GameStateContextValue {
  gameState: GameState;
  createNewCharacter: (name: string, characterClass: CharacterClass) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  resetGame: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export interface GameStateProviderProps {
  children: ReactNode;
}

// Load game state from localStorage
function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return initialGameState;
}

// Save game state to localStorage
function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  // Use lazy initialization to load saved state on first render
  const [gameState, setGameState] = useState<GameState>(loadGameState);

  // Save state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const createNewCharacter = useCallback((name: string, characterClass: CharacterClass) => {
    const newCharacter = createCharacter(name, characterClass);
    setGameState((prev) => ({
      ...prev,
      character: newCharacter,
      hasStartedGame: true,
    }));
  }, []);

  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setGameState((prev) => {
      if (!prev.character) return prev;
      return {
        ...prev,
        character: {
          ...prev.character,
          ...updates,
        },
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    setGameState(initialGameState);
  }, []);

  const value: GameStateContextValue = {
    gameState,
    createNewCharacter,
    updateCharacter,
    resetGame,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGameState(): GameStateContextValue {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
