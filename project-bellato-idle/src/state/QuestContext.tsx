import { createContext, useContext, type ReactNode } from 'react';
import { useQuest, type UseQuestReturn } from '../hooks/useQuest';

const QuestContext = createContext<UseQuestReturn | null>(null);

export interface QuestProviderProps {
  children: ReactNode;
}

export function QuestProvider({ children }: QuestProviderProps) {
  const questState = useQuest();
  
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
