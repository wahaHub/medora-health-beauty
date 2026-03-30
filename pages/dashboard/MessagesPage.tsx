/**
 * MessagesPage
 *
 * Phase 1: This page delegates all messaging to PatientMessagePanel.
 * On mount it calls openPanel() which opens the full-screen panel.
 * The page itself is intentionally minimal — the panel IS the messaging
 * workspace and owns all conversation UI.
 */

import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { usePatientEntry } from '../../hooks/usePatientEntry';

export default function MessagesPage() {
  const { openPanel, phase, isPanelOpen } = usePatientEntry();

  useEffect(() => {
    // Only open the panel when the patient is in the messages-ready phase.
    // If they are not yet there (e.g. still onboarding) openPanel will still
    // open the panel shell; the panel itself handles the appropriate state.
    openPanel();
    // Run only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mb-4">
        <MessageCircle size={28} className="text-gold-600" />
      </div>
      <h2 className="text-lg font-serif font-semibold text-navy-900 mb-2">
        {isPanelOpen ? 'Messages panel is open' : 'Opening your messages…'}
      </h2>
      <p className="text-stone-500 text-sm max-w-xs">
        {phase === 'messages-ready'
          ? 'Your messages panel is loading. If it did not open automatically, click the button below.'
          : 'Complete your onboarding to start messaging your care coordinator and hospitals.'}
      </p>
      {!isPanelOpen && (
        <button
          onClick={openPanel}
          className="mt-6 px-5 py-2.5 bg-gold-600 text-white rounded-xl text-sm font-medium hover:bg-gold-700 transition-colors"
        >
          Open Messages
        </button>
      )}
    </div>
  );
}
