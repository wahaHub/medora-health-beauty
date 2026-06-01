import { createContext, useContext, useState, type ReactNode } from 'react';

interface MessagePanelState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const MessagePanelContext = createContext<MessagePanelState | null>(null);

export function MessagePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MessagePanelContext.Provider value={{
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }}>
      {children}
    </MessagePanelContext.Provider>
  );
}

export function useMessagePanel() {
  const ctx = useContext(MessagePanelContext);
  if (!ctx) throw new Error('useMessagePanel must be used within MessagePanelProvider');
  return ctx;
}
