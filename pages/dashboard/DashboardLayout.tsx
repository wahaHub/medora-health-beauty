import { Outlet, Link, useNavigate } from 'react-router-dom';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import { LogOut, LayoutDashboard, User, MessageCircle } from 'lucide-react';

export default function DashboardLayout() {
  const { patient, logout } = usePatientAuth();
  const { openPanel: openMessages } = usePatientEntry();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Top bar */}
      <header className="bg-white border-b border-sage-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-serif font-bold text-navy-900">
              Medora
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/dashboard" className="text-stone-600 hover:text-gold-600 flex items-center gap-1.5 text-sm">
                <LayoutDashboard size={16} /> My Cases
              </Link>
              <button onClick={openMessages} className="text-stone-600 hover:text-gold-600 flex items-center gap-1.5 text-sm">
                <MessageCircle size={16} /> Messages
              </button>
              <Link to="/dashboard/account" className="text-stone-600 hover:text-gold-600 flex items-center gap-1.5 text-sm">
                <User size={16} /> Account
              </Link>
            </nav>
          </div>
          <button onClick={handleLogout} className="text-stone-500 hover:text-stone-700 flex items-center gap-1.5 text-sm">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
