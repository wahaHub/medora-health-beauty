import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePatientEntry } from '../hooks/usePatientEntry';
import { ChatBubble } from './chat/ChatBubble';
import { ChatWindow, type ChatWindowDisplayMode } from './chat/ChatWindow';

const HIDDEN_PATTERNS = ['/login', '/dashboard'];
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
  const { isWidgetOpen, openWidget, closeWidget } = usePatientEntry();
  const [isMobileViewport, setIsMobileViewport] = useState(() => readIsMobileViewport());
  const [desktopDisplayMode, setDesktopDisplayMode] = useState<Exclude<ChatWindowDisplayMode, 'mobile-panel'>>('panel');

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

  if (shouldHideWidget(location.pathname)) {
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
      {!isWidgetOpen && <ChatBubble isOpen={false} onClick={openPanel} />}
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
