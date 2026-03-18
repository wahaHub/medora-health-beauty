import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { crmApi } from '../services/crmApiClient';

interface PatientProfile {
  id: string;
  name?: string;
  email?: string;
}

interface PatientAuthState {
  isAuthenticated: boolean;
  patient: PatientProfile | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  loginWithOnboarding: (profile: PatientProfile) => void;
  logout: () => void;
}

const PatientAuthContext = createContext<PatientAuthState | null>(null);

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    crmApi.getMe()
      .then((profile) => setPatient({ id: profile.id }))
      .catch(() => setPatient(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (token: string) => {
    const result = await crmApi.verifyToken(token);
    setPatient({ id: result.patientId });
  }, []);

  const loginWithOnboarding = useCallback((profile: PatientProfile) => {
    setPatient(profile);
  }, []);

  const logout = useCallback(() => {
    setPatient(null);
  }, []);

  return (
    <PatientAuthContext.Provider value={{
      isAuthenticated: !!patient,
      patient,
      isLoading,
      login,
      loginWithOnboarding,
      logout,
    }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error('usePatientAuth must be used within PatientAuthProvider');
  return ctx;
}
