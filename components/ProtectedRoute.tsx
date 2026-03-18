import { useEffect } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { usePatientAuth } from '../contexts/PatientAuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login } = usePatientAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token && !isAuthenticated && !isLoading) {
      login(token).catch(() => {});
    }
  }, [token, isAuthenticated, isLoading, login]);

  if (isLoading) return <div className="flex items-center justify-center h-screen text-stone-500">Loading...</div>;
  if (!isAuthenticated && !token) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}
