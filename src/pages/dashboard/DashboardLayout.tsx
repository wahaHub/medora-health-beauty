import type { ComponentType, ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  FileText,
  Home,
  LifeBuoy,
  LogOut,
  MessageSquareMore,
  Route,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import DashboardHome from './DashboardHome';
import QuotesPage from './QuotesPage';
import MessagesPage from './MessagesPage';
import TicketsPage from './TicketsPage';
import OrdersPage from './OrdersPage';
import JourneyPage from './JourneyPage';
import AiSummaryPage from './AiSummaryPage';

type DashboardTab = 'home' | 'quotes' | 'messages' | 'tickets' | 'orders' | 'journey' | 'ai-summary';

const VALID_TABS: DashboardTab[] = [
  'home',
  'quotes',
  'messages',
  'tickets',
  'orders',
  'journey',
  'ai-summary',
];

const LEGACY_PATH_TO_TAB: Record<string, DashboardTab> = {
  '/dashboard/quotes': 'quotes',
  '/dashboard/messages': 'messages',
  '/dashboard/tickets': 'tickets',
  '/dashboard/orders': 'orders',
  '/dashboard/journey': 'journey',
  '/dashboard/ai-summary': 'ai-summary',
};

const NAV_ITEMS: Array<{
  value: DashboardTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'quotes', label: 'Quotes', icon: FileText },
  { value: 'messages', label: 'Messages', icon: MessageSquareMore },
  { value: 'tickets', label: 'Tickets', icon: LifeBuoy },
  { value: 'orders', label: 'Orders', icon: ShoppingBag },
  { value: 'journey', label: 'Journey', icon: Route },
  { value: 'ai-summary', label: 'AI Summary', icon: Sparkles },
];

function resolveTab(pathname: string, search: string): DashboardTab {
  const legacyTab = LEGACY_PATH_TO_TAB[pathname];
  if (legacyTab) {
    return legacyTab;
  }

  const requested = new URLSearchParams(search).get('tab');
  if (requested && VALID_TABS.includes(requested as DashboardTab)) {
    return requested as DashboardTab;
  }

  return 'home';
}

function renderQueryTabContent(tab: DashboardTab): ReactNode {
  switch (tab) {
    case 'quotes':
      return <QuotesPage />;
    case 'messages':
      return <MessagesPage />;
    case 'tickets':
      return <TicketsPage />;
    case 'orders':
      return <OrdersPage />;
    case 'journey':
      return <JourneyPage />;
    case 'ai-summary':
      return <AiSummaryPage />;
    case 'home':
    default:
      return <DashboardHome />;
  }
}

function getNavHref(tab: DashboardTab) {
  return `/dashboard?tab=${tab}`;
}

export default function DashboardLayout() {
  const { patient, logout } = usePatientAuth();
  const location = useLocation();
  const activeTab = resolveTab(location.pathname, location.search);
  const usesLegacyNestedRoute = location.pathname !== '/dashboard' && location.pathname !== '/dashboard/';
  const patientLabel = patient?.name || patient?.email || patient?.id || 'Patient';

  return (
    <div
      data-testid="patient-dashboard-shell"
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.13),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef8f7_100%)]"
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white/90 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-5 px-4 py-4 lg:px-5 lg:py-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  Medora Beauty
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800 lg:hidden">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  CRM v2
                </span>
              </div>
              <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 lg:text-2xl">
                {patientLabel}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Beauty case workspace
              </p>
            </div>

            <nav
              aria-label="Patient dashboard"
              className="-mx-1 flex gap-2 overflow-x-auto pb-1 lg:mx-0 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;

                return (
                  <Link
                    key={item.value}
                    to={getNavHref(item.value)}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors lg:w-full lg:justify-start ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/10'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto" />

            <Link
              to="/"
              className="inline-flex h-10 items-center justify-start gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:w-full"
            >
              <Home className="h-4 w-4" />
              Back Home
            </Link>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-start gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:w-full"
              onClick={() => void logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="px-4 py-5 sm:px-6 lg:px-6">
            {usesLegacyNestedRoute ? <Outlet /> : renderQueryTabContent(activeTab)}
          </div>
        </main>
      </div>
    </div>
  );
}
