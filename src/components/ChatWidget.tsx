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
        <div className="fixed bottom-6 right-6 z-[9998]">
          <button
            type="button"
            onClick={openPanel}
            aria-label={dt('chatOpen')}
            className="inline-flex h-14 items-center gap-2 rounded-full bg-teal-600 px-5 text-sm font-semibold text-white shadow-xl shadow-teal-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700"
          >
            <MessageCircleMore className="h-5 w-5" />
            {dt('chatWidgetLabel')}
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
