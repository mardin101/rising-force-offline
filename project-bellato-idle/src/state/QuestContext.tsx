import { createContext, useContext, type ReactNode } from 'react';
import { useQuest, type UseQuestReturn } from '../hooks/useQuest';
import { useGameState } from './GameStateContext';

const QuestContext = createContext<UseQuestReturn | null>(null);

export interface QuestProviderProps {
  children: ReactNode;
}

export function QuestProvider({ children }: QuestProviderProps) {
  const { gameState, updateCharacter, updateInventoryGrid } = useGameState();
  
  // Only create quest state if character exists
  const questState = useQuest({
    character: gameState.character!,
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
