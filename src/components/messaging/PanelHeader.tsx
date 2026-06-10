import { X } from 'lucide-react';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';

interface PanelHeaderProps {
  onClose: () => void;
}

export function PanelHeader({ onClose }: PanelHeaderProps) {
  const { dt } = useDashboardTranslation();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 shrink-0">
      <h2 className="text-stone-800 font-serif text-xl tracking-wide">{dt('messagesTitle')}</h2>
      <button
        onClick={onClose}
        className="text-stone-400 hover:text-stone-600 transition-colors p-1"
        aria-label={dt('close')}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
