import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConsultationContextType {
  isOpen: boolean;
  openConsultation: (procedureName?: string, surgeonName?: string) => void;
  closeConsultation: () => void;
  preselectedProcedure: string;
  preselectedSurgeon: string;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preselectedProcedure, setPreselectedProcedure] = useState('');
  const [preselectedSurgeon, setPreselectedSurgeon] = useState('');

  const openConsultation = (procedureName?: string, surgeonName?: string) => {
    setPreselectedProcedure(procedureName || '');
    setPreselectedSurgeon(surgeonName || '');
    setIsOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeConsultation = () => {
    setIsOpen(false);
    setPreselectedProcedure('');
    setPreselectedSurgeon('');
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  return (
    <ConsultationContext.Provider value={{
      isOpen,
      openConsultation,
      closeConsultation,
      preselectedProcedure,
      preselectedSurgeon
    }}>
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = (): ConsultationContextType => {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
