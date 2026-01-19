import { useCallback, useEffect } from 'react';

/**
 * Custom hook for handling escape key press.
 * Useful for components that need to close on Escape but don't manage body overflow.
 * 
 * @param onEscape - Callback function to execute when Escape is pressed
 */
export function useEscapeKey(onEscape: () => void): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    },
    [onEscape]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
