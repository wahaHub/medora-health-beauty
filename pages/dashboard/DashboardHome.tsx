import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientCases } from '../../hooks/usePatientCases';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import {
  MessageCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardHome() {
  const { patient } = usePatientAuth();
  const { data, isLoading } = usePatientCases();
  const { openPanel } = usePatientEntry();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-stone-400">
        Loading your cases...
      </div>
    );
  }

  const cases = data?.cases ?? [];
  const totalUnread = cases.reduce((sum: number, c: any) => sum + (c.unreadCount ?? 0), 0);
  const hasPendingIntake = cases.some(
    (c: any) => c.assignmentStatus !== 'ASSIGNED' && !c.intakeCompleted,
  );
  const hasPendingQuotes = cases.some((c: any) =>
    (c.quotes ?? []).some((q: any) => q.status === 'PENDING'),
  );

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-navy-900">
          Welcome back{patient?.name ? `, ${patient.name}` : ''}
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Here's what needs your attention today.
        </p>
      </div>

      {/* ---- Action Items ---- */}
      {(hasPendingIntake || hasPendingQuotes || totalUnread > 0) && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
            Action Items
          </h2>
          <div className="space-y-2">
            {hasPendingIntake && (
              <ActionItem
                icon={<ClipboardList size={18} className="text-gold-600" />}
                label="Complete your intake form"
                description="Help your care coordinator match you with the right hospitals."
                cta="Start intake"
                onClick={() => {
                  const c = cases.find(
                    (c: any) => c.assignmentStatus !== 'ASSIGNED' && !c.intakeCompleted,
                  );
                  if (c) navigate(`/dashboard/intake?caseId=${c.id}`);
                }}
              />
            )}
            {hasPendingQuotes && (
              <ActionItem
                icon={<FileText size={18} className="text-navy-700" />}
                label="Review your quote"
                description="A hospital has sent you a treatment quote. Accept or decline."
                cta="View quotes"
                onClick={() => navigate('/dashboard/quotes')}
              />
            )}
            {totalUnread > 0 && (
              <ActionItem
                icon={<MessageCircle size={18} className="text-gold-600" />}
                label={`${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`}
                description="Your coordinator or a hospital has sent you a new message."
                cta="Open messages"
                onClick={openPanel}
                urgent
              />
            )}
          </div>
        </section>
      )}

      {/* ---- Cases / Case Context ---- */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
          Your Cases
        </h2>

        {cases.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <FileText className="mx-auto text-stone-300 mb-4" size={48} />
            <p className="text-stone-500 text-lg">No cases yet</p>
            <p className="text-stone-400 mt-2 text-sm">
              Click the chat bubble to start finding hospitals.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.map((c: any) => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        )}
      </section>

      {/* ---- Next-Step CTA Blocks ---- */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CTABlock
            icon={<MessageCircle size={20} className="text-gold-600" />}
            title="Message your coordinator"
            description="Ask questions about your treatment or next steps."
            onClick={openPanel}
          />
          <CTABlock
            icon={<FileText size={20} className="text-navy-700" />}
            title="View all quotes"
            description="Compare treatment offers from matched hospitals."
            onClick={() => navigate('/dashboard/quotes')}
          />
          <CTABlock
            icon={<CheckCircle2 size={20} className="text-green-600" />}
            title="Track your journey"
            description="See where you are in the Medora care process."
            onClick={() => {/* Phase 2 */}}
            disabled
          />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActionItem({
  icon,
  label,
  description,
  cta,
  onClick,
  urgent = false,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  cta: string;
  onClick: () => void;
  urgent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 bg-white rounded-xl p-4 border ${
        urgent ? 'border-gold-300 bg-gold-50' : 'border-transparent'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5 truncate">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="shrink-0 text-xs font-medium text-gold-600 hover:text-gold-700 flex items-center gap-0.5"
      >
        {cta} <ChevronRight size={14} />
      </button>
    </div>
  );
}

function CaseCard({ caseData: c }: { caseData: any }) {
  const navigate = useNavigate();
  const { openPanel } = usePatientEntry();
  const statusLabel =
    c.assignmentStatus === 'ASSIGNED' ? 'In Progress' : 'Awaiting Quotes';
  const statusClass =
    c.assignmentStatus === 'ASSIGNED'
      ? 'bg-green-100 text-green-700'
      : 'bg-gold-100 text-gold-700';

  return (
    <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-mono text-stone-400">{c.caseNumber}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
        <p className="text-stone-700">{c.primaryDiagnosis || 'General Consultation'}</p>
        {c.hospitalName && (
          <p className="text-stone-500 text-sm mt-0.5">{c.hospitalName}</p>
        )}
        <p className="text-stone-400 text-sm mt-1">
          Created {new Date(c.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {c.unreadCount > 0 && (
          <span className="flex items-center gap-1 text-gold-600">
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{c.unreadCount}</span>
          </span>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={openPanel}
            className="rounded-xl border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-gold-300 hover:text-gold-700"
          >
            Messages
          </button>
          {!c.intakeCompleted ? (
            <button
              onClick={() => navigate(`/dashboard/intake?caseId=${c.id}`)}
              className="rounded-xl bg-gold-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-700"
            >
              Continue Intake
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/quotes')}
              className="rounded-xl bg-gold-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gold-700"
            >
              View Quotes
            </button>
          )}
          <ChevronRight size={16} className="text-stone-300" />
        </div>
      </div>
    </div>
  );
}

function CTABlock({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white rounded-2xl p-5 text-left hover:shadow-md transition-shadow w-full ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-medium text-stone-800">{title}</p>
      <p className="text-xs text-stone-500 mt-1">{description}</p>
      {disabled && (
        <span className="text-xs text-stone-400 mt-2 inline-block">Coming soon</span>
      )}
    </button>
  );
}
