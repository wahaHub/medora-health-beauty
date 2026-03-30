import { useContext } from 'react';
import { PatientEntryContext } from '../contexts/PatientEntryContext';

export function usePatientEntry() {
  const context = useContext(PatientEntryContext);

  if (!context) {
    throw new Error('usePatientEntry must be used within a PatientEntryProvider');
  }

  return context;
}
