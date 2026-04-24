import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { Loader2 } from 'lucide-react';

interface DashboardRouteProps {
  children: React.ReactNode;
}

export default function DashboardRoute({ children }: DashboardRouteProps) {
  const { isAuthenticated, isLoading, error } = usePatientAuth();
  const [gracePeriod, setGracePeriod] = useState(true);

  // 给状态更新一点时间（token 验证后 navigate 到这里时，patient 可能还没同步）
  useEffect(() => {
    const timer = setTimeout(() => setGracePeriod(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 调试日志
  useEffect(() => {
    console.log('DashboardRoute:', { isAuthenticated, isLoading, error, gracePeriod });
  }, [isAuthenticated, isLoading, error, gracePeriod]);

  if (isLoading || gracePeriod) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-gold-600 animate-spin mx-auto" />
          <p className="text-stone-500 text-sm">Restoring your session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-sm border border-stone-100">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">
            Session Error
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            {error}
          </p>
          <a
            href="/login"
            className="inline-block bg-gold-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gold-700 transition-colors"
          >
            Sign in again
          </a>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('DashboardRoute: 未认证，重定向到 /login');
    return <Navigate to="/login" replace />;
  }

  console.log('DashboardRoute: 已认证，显示 Dashboard');
  return <>{children}</>;
}
