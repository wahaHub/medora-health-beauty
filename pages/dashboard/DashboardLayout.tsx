import { Outlet, Link, useLocation } from 'react-router-dom';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientCases } from '../../hooks/usePatientCases';
import { LogOut, LayoutDashboard, FileText, MessageCircle, Ticket, ShoppingBag, MapPin, Sparkles } from 'lucide-react';

export default function DashboardLayout() {
  const { patient, logout } = usePatientAuth();
  const { data } = usePatientCases();
  const location = useLocation();

  const handleLogout = () => {
    // PatientAuthContext.logout() navigates to /login after clearing session
    void logout();
  };

  // Compute total unread count across all cases
  const totalUnread = (data?.cases ?? []).reduce(
    (sum: number, c: any) => sum + (c.unreadCount ?? 0),
    0,
  );

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 text-sm transition-colors ${
      isActive(path)
        ? 'text-gold-600 font-medium'
        : 'text-stone-600 hover:text-gold-600'
    }`;

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Top bar */}
      <header className="bg-white border-b border-sage-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-serif font-bold text-navy-900">
              Medora
            </Link>
            <nav className="flex items-center gap-4 overflow-x-auto">
              {/* Tab 1: Home */}
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <LayoutDashboard size={16} /> Home
              </Link>

              {/* Tab 2: Quotes */}
              <Link to="/dashboard/quotes" className={navLinkClass('/dashboard/quotes')}>
                <FileText size={16} /> Quotes
              </Link>

              {/* Tab 3: Messages — opens PatientMessagePanel */}
              <Link to="/dashboard/messages" className={navLinkClass('/dashboard/messages')}>
                <MessageCircle size={16} />
                Messages
                {totalUnread > 0 && (
                  <span className="ml-0.5 bg-gold-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </Link>

              {/* Tab 4: Support Tickets */}
              <Link to="/dashboard/tickets" className={navLinkClass('/dashboard/tickets')}>
                <Ticket size={16} /> Support
              </Link>

              {/* Tab 5: Orders */}
              <Link to="/dashboard/orders" className={navLinkClass('/dashboard/orders')}>
                <ShoppingBag size={16} /> Orders
              </Link>

              {/* Tab 6: Journey */}
              <Link to="/dashboard/journey" className={navLinkClass('/dashboard/journey')}>
                <MapPin size={16} /> Journey
              </Link>

              {/* Tab 7: AI Summary */}
              <Link to="/dashboard/ai-summary" className={navLinkClass('/dashboard/ai-summary')}>
                <Sparkles size={16} /> AI Summary
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-stone-500 hover:text-stone-700 flex items-center gap-1.5 text-sm"
          >
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
