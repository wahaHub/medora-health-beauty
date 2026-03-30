import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePatientAuth } from '../contexts/PatientAuthContext';
import { rememberPatientReturnTo } from '../services/patientRouteMemory';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = usePatientAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex items-center justify-center h-screen text-stone-500">Loading...</div>;
  if (!isAuthenticated) {
    rememberPatientReturnTo(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
