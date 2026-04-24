import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientCases } from '../../hooks/usePatientCases';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';
import {
  MessageCircle,
  FileText,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Briefcase,
  Ticket,
  ShoppingBag,
  AlertCircle,
  Sparkles,
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

  const cases = Array.isArray(data) ? data : (data?.cases ?? []);
  const activeCase = cases[0];

  const totalUnread = cases.reduce((sum: number, c: any) => sum + (c.unreadCount ?? 0), 0);
  const pendingQuotesCount = cases.reduce(
    (sum: number, c: any) =>
      sum + (c.quotes ?? []).filter((q: any) => q.status === 'PENDING').length,
    0,
  );
  const openTicketsCount = cases.reduce(
    (sum: number, c: any) =>
      sum + (c.tickets ?? []).filter((t: any) => t.status === 'OPEN').length,
    0,
  );
  const ordersCount = cases.reduce(
    (sum: number, c: any) => sum + (c.orders ?? []).length,
    0,
  );

  const hasPendingIntake = cases.some(
    (c: any) => c.assignmentStatus !== 'ASSIGNED' && !c.intakeCompleted,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Active case + Action items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Case */}
          {activeCase && (
            <section className="bg-white rounded-2xl p-6 border border-stone-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-800">Active Case</h2>
                <span className="text-xs font-mono text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
                  {activeCase.caseNumber}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-stone-700 font-medium">
                    {activeCase.primaryDiagnosis || 'General Consultation'}
                  </p>
                  {activeCase.hospitalName && (
                    <p className="text-stone-500 text-sm mt-0.5">
                      {activeCase.hospitalName}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={activeCase.assignmentStatus} />
                    {activeCase.treatmentPhase && (
                      <span className="text-xs text-stone-400">
                        Phase: {activeCase.treatmentPhase}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {!activeCase.intakeCompleted ? (
                    <button
                      onClick={() => navigate(`/dashboard/intake?caseId=${activeCase.id}`)}
                      className="text-xs bg-gold-600 text-white px-3 py-1.5 rounded-lg hover:bg-gold-700 transition-colors whitespace-nowrap"
                    >
                      Continue Intake
                    </button>
                  ) : pendingQuotesCount > 0 ? (
                    <button
                      onClick={() => navigate('/dashboard/quotes')}
                      className="text-xs bg-gold-600 text-white px-3 py-1.5 rounded-lg hover:bg-gold-700 transition-colors whitespace-nowrap"
                    >
                      Review Quotes
                    </button>
                  ) : (
                    <button
                      onClick={openPanel}
                      className="text-xs bg-navy-900 text-white px-3 py-1.5 rounded-lg hover:bg-navy-800 transition-colors whitespace-nowrap"
                    >
                      Message Team
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Action Items */}
          {(hasPendingIntake || pendingQuotesCount > 0 || totalUnread > 0) && (
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
                {pendingQuotesCount > 0 && (
                  <ActionItem
                    icon={<FileText size={18} className="text-navy-700" />}
                    label={`${pendingQuotesCount} pending quote${pendingQuotesCount > 1 ? 's' : ''}`}
                    description="Review and accept or decline treatment offers."
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

          {/* Cases list */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              Your Cases
            </h2>
            {cases.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-100">
                <FileText className="mx-auto text-stone-300 mb-4" size={48} />
                <p className="text-stone-500 text-lg">No cases yet</p>
                <p className="text-stone-400 mt-2 text-sm">
                  Click the chat bubble to start finding hospitals.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((c: any) => (
                  <CaseCard key={c.id} caseData={c} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: Summary stats + Quick links */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <section className="grid grid-cols-2 gap-3">
            <SummaryCard
              icon={<Briefcase size={18} className="text-navy-700" />}
              value={cases.length}
              label="Cases"
              onClick={() => navigate('/dashboard')}
            />
            <SummaryCard
              icon={<FileText size={18} className="text-gold-600" />}
              value={pendingQuotesCount}
              label="Pending Quotes"
              onClick={() => navigate('/dashboard/quotes')}
              highlight={pendingQuotesCount > 0}
            />
            <SummaryCard
              icon={<Ticket size={18} className="text-stone-500" />}
              value={openTicketsCount}
              label="Open Tickets"
              onClick={() => navigate('/dashboard/tickets')}
            />
            <SummaryCard
              icon={<ShoppingBag size={18} className="text-green-600" />}
              value={ordersCount}
              label="Orders"
              onClick={() => navigate('/dashboard/orders')}
            />
          </section>

          {/* Next Steps */}
          <section className="bg-white rounded-2xl p-5 border border-stone-100">
            <h3 className="text-sm font-semibold text-stone-800 mb-4">Next Steps</h3>
            <div className="space-y-3">
              <NextStepItem
                icon={<MessageCircle size={16} className="text-gold-600" />}
                title="Message your coordinator"
                description="Ask questions about your treatment or next steps."
                onClick={openPanel}
              />
              <NextStepItem
                icon={<FileText size={16} className="text-navy-700" />}
                title="View all quotes"
                description="Compare treatment offers from matched hospitals."
                onClick={() => navigate('/dashboard/quotes')}
              />
              <NextStepItem
                icon={<Sparkles size={16} className="text-purple-500" />}
                title="AI Summary"
                description="Get an AI-generated overview of your case."
                onClick={() => navigate('/dashboard/ai-summary')}
              />
              <NextStepItem
                icon={<CheckCircle2 size={16} className="text-green-600" />}
                title="Track your journey"
                description="See where you are in the Medora care process."
                onClick={() => navigate('/dashboard/journey')}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  icon,
  value,
  label,
  onClick,
  highlight = false,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl p-4 text-left border transition-all hover:shadow-md ${
        highlight ? 'border-gold-200' : 'border-stone-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        {highlight && value > 0 && (
          <span className="w-2 h-2 bg-gold-500 rounded-full" />
        )}
      </div>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </button>
  );
}

function NextStepItem({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 text-left w-full group"
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 group-hover:text-gold-700 transition-colors">
          {title}
        </p>
        <p className="text-xs text-stone-500 mt-0.5">{description}</p>
      </div>
      <ChevronRight
        size={14}
        className="shrink-0 text-stone-300 mt-1 group-hover:text-gold-600 transition-colors"
      />
    </button>
  );
}

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
      className={`flex items-center gap-4 rounded-xl p-4 border ${
        urgent ? 'border-gold-200 bg-gold-50/50' : 'border-stone-100 bg-white'
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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; className: string }> = {
    ASSIGNED: { text: 'In Progress', className: 'bg-green-50 text-green-700' },
    PENDING: { text: 'Pending', className: 'bg-gold-50 text-gold-700' },
    OPEN: { text: 'Open', className: 'bg-blue-50 text-blue-700' },
    CLOSED: { text: 'Closed', className: 'bg-stone-100 text-stone-500' },
  };
  const { text, className } = config[status] ?? {
    text: status,
    className: 'bg-stone-100 text-stone-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
      {text}
    </span>
  );
}

function CaseCard({ caseData: c }: { caseData: any }) {
  const navigate = useNavigate();
  const { openPanel } = usePatientEntry();

  return (
    <div className="bg-white rounded-xl p-5 border border-stone-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-stone-400">{c.caseNumber}</span>
            <StatusBadge status={c.assignmentStatus} />
          </div>
          <p className="text-stone-700 font-medium truncate">
            {c.primaryDiagnosis || 'General Consultation'}
          </p>
          {c.hospitalName && (
            <p className="text-stone-500 text-sm">{c.hospitalName}</p>
          )}
          <p className="text-stone-400 text-xs mt-1">
            Created {new Date(c.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {c.unreadCount > 0 && (
            <span className="flex items-center gap-1 text-gold-600 text-sm font-medium">
              <MessageCircle size={14} />
              {c.unreadCount}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={openPanel}
              className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:border-gold-300 hover:text-gold-700 transition-colors"
            >
              Messages
            </button>
            {!c.intakeCompleted ? (
              <button
                onClick={() => navigate(`/dashboard/intake?caseId=${c.id}`)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gold-600 text-white hover:bg-gold-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard/quotes')}
                className="text-xs px-3 py-1.5 rounded-lg bg-gold-600 text-white hover:bg-gold-700 transition-colors"
              >
                Quotes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
