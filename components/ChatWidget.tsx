import { usePatientEntry } from '../hooks/usePatientEntry';
import { ChatBubble } from './chat/ChatBubble';
import { ChatWindow } from './chat/ChatWindow';

export default function ChatWidget() {
  const { isWidgetOpen, openWidget, closeWidget, toggleWidget } = usePatientEntry();

  return (
    <>
      <ChatBubble isOpen={isWidgetOpen} onClick={toggleWidget} />
      {isWidgetOpen && <ChatWindow onClose={closeWidget} />}
    </>
  );
}
