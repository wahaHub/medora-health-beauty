import { Navigate, useLocation } from 'react-router-dom';
import { usePatientAuth } from '../contexts/PatientAuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = usePatientAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex items-center justify-center h-screen text-stone-500">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
