import { useLocation } from 'react-router-dom';
import { usePatientEntry } from '../hooks/usePatientEntry';
import { ChatBubble } from './chat/ChatBubble';
import { ChatWindow } from './chat/ChatWindow';

const HIDDEN_PATTERNS = ['/login', '/dashboard'];

function shouldHideWidget(pathname: string) {
  return HIDDEN_PATTERNS.some((pattern) =>
    pathname === pattern || pathname.startsWith(`${pattern}/`),
  );
}

export default function ChatWidget() {
  const location = useLocation();
  const { isWidgetOpen, closeWidget, toggleWidget } = usePatientEntry();

  if (shouldHideWidget(location.pathname)) {
    return null;
  }

  return (
    <>
      <ChatBubble isOpen={isWidgetOpen} onClick={toggleWidget} />
      {isWidgetOpen && <ChatWindow onClose={closeWidget} />}
    </>
  );
}
