import { X } from 'lucide-react';

interface PanelHeaderProps {
  onClose: () => void;
}

export function PanelHeader({ onClose }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 shrink-0">
      <h2 className="text-stone-800 font-serif text-xl tracking-wide">Messages</h2>
      <button
        onClick={onClose}
        className="text-stone-400 hover:text-stone-600 transition-colors p-1"
        aria-label="Close messages"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
