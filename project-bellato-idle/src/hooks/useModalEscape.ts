import { useCallback, useEffect } from 'react';

/**
 * Custom hook for handling modal escape key press and body overflow management.
 * This consolidates the common pattern of:
 * - Listening for Escape key to close modal
 * - Managing body overflow when modal is open
 * - Cleaning up event listeners and styles when modal closes
 * 
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback function to close the modal
 */
export function useModalEscape(isOpen: boolean, onClose: () => void): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);
}
