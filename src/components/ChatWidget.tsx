import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircleMore } from 'lucide-react';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';
import { ChatWindow, type ChatWindowDisplayMode } from './chat/ChatWindow';

const HIDDEN_PATTERNS = ['/login'];
const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

function shouldHideWidget(pathname: string) {
  return HIDDEN_PATTERNS.some((pattern) =>
    pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

function readIsMobileViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export default function ChatWidget() {
  const location = useLocation();
  const { dt } = useDashboardTranslation();
  const { isAuthenticated } = usePatientAuth();
  const { isWidgetOpen, openWidget, closeWidget } = usePatientEntry();
  const [isMobileViewport, setIsMobileViewport] = useState(() => readIsMobileViewport());
  const [desktopDisplayMode, setDesktopDisplayMode] = useState<Exclude<ChatWindowDisplayMode, 'mobile-panel'>>('panel');
  const isDashboardPath = location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    setIsMobileViewport(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (isMobileViewport) {
      setDesktopDisplayMode('panel');
    }
  }, [isMobileViewport]);

  if (shouldHideWidget(location.pathname) || (isDashboardPath && !isAuthenticated)) {
    return null;
  }

  const openPanel = () => {
    setDesktopDisplayMode('panel');
    openWidget();
  };

  const closeToBubble = () => {
    setDesktopDisplayMode('panel');
    closeWidget();
  };

  const activeDisplayMode: ChatWindowDisplayMode = isMobileViewport
    ? 'mobile-panel'
    : desktopDisplayMode;

  return (
    <>
      {!isWidgetOpen && (
        <div className="fixed bottom-5 right-4 z-[9998] sm:bottom-6 sm:right-6">
          <button
            type="button"
            onClick={openPanel}
            aria-label={dt('chatOpen')}
            className="inline-flex h-16 w-[calc(100vw-2rem)] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-teal-600 to-teal-500 px-8 text-base font-bold text-white shadow-2xl shadow-teal-950/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-teal-500 hover:to-teal-600 sm:w-72"
          >
            <MessageCircleMore className="h-6 w-6" />
            {dt('chatWidgetCta')}
          </button>
        </div>
      )}
      {isWidgetOpen && (
        <ChatWindow
          displayMode={activeDisplayMode}
          onClose={closeToBubble}
          onMaximize={!isMobileViewport ? () => setDesktopDisplayMode('modal') : undefined}
          onMinimize={!isMobileViewport ? () => setDesktopDisplayMode('panel') : undefined}
        />
      )}
    </>
  );
}
