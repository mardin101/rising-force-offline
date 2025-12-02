import { createContext, useContext, type ReactNode } from 'react';
import { useQuest, type UseQuestReturn } from '../hooks/useQuest';
import { useGameState } from './GameStateContext';
import { createCharacter, CHARACTER_CLASSES } from './gameStateSlice';

const QuestContext = createContext<UseQuestReturn | null>(null);

export interface QuestProviderProps {
  children: ReactNode;
}

export function QuestProvider({ children }: QuestProviderProps) {
  const { gameState, updateCharacter, updateInventoryGrid } = useGameState();
  
  // Fallback character in case gameState.character is null (should not happen in practice)
  // since QuestProvider is only rendered after character creation
  const character = gameState.character ?? createCharacter('Default', CHARACTER_CLASSES.WARRIOR);
  
  const questState = useQuest({
    character,
    updateCharacter,
    inventoryGrid: gameState.inventoryGrid,
    updateInventoryGrid,
    initialActiveQuest: gameState.activeQuest,
    initialCompletedQuestIds: gameState.completedQuestIds,
    initialMaterials: gameState.materials,
  });
  
  return (
    <QuestContext.Provider value={questState}>
      {children}
    </QuestContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuestContext(): UseQuestReturn {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuestContext must be used within a QuestProvider');
  }
  return context;
}
