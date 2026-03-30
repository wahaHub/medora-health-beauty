import type { ReactNode } from 'react';
import { MapPin, Calendar, Plane, Hotel, Car, Heart, FileText } from 'lucide-react';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientJourney, usePatientMilestones } from '../../hooks/usePatientPhase2';

const SECTION_ICONS: Record<string, ReactNode> = {
  visa: <FileText size={16} />,
  insurance: <Heart size={16} />,
  accommodation: <Hotel size={16} />,
  transportation: <Car size={16} />,
  postCare: <Heart size={16} />,
};

const SECTION_LABELS: Record<string, string> = {
  visa: 'Visa',
  insurance: 'Insurance',
  accommodation: 'Accommodation',
  transportation: 'Transportation',
  postCare: 'Post-Operative Care',
};

export default function JourneyPage() {
  const { patient } = usePatientAuth();
  const caseId = patient?.caseId ?? null;

  const { data: journey, isLoading: journeyLoading } = usePatientJourney(caseId);
  const { data: milestones, isLoading: milestonesLoading } = usePatientMilestones(caseId);

  const isLoading = journeyLoading || milestonesLoading;

  if (!caseId) {
    return (
      <div className="text-center py-20">
        <Plane className="mx-auto text-stone-300 mb-3" size={40} />
        <p className="text-stone-400">No active case found.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-20 text-stone-400">Loading journey…</div>;
  }

  const journeySections = journey
    ? (['visa', 'insurance', 'accommodation', 'transportation', 'postCare'] as const).filter(
        (k) => (journey as any)[k] != null,
      )
    : [];

  const visibleMilestones = (milestones ?? []).filter((m) => m.isVisibleToPatient);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif font-bold text-navy-900">My Journey</h1>

      {/* Journey sections */}
      {journeySections.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-stone-700">Travel Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {journeySections.map((key) => {
              const data = (journey as any)[key];
              return (
                <div key={key} className="bg-white rounded-2xl p-5 border border-stone-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gold-600">{SECTION_ICONS[key]}</span>
                    <h3 className="text-sm font-semibold text-stone-800">{SECTION_LABELS[key]}</h3>
                  </div>
                  {typeof data === 'object' ? (
                    <ul className="space-y-1">
                      {Object.entries(data as Record<string, unknown>)
                        .filter(([, v]) => v != null && v !== '')
                        .map(([k, v]) => (
                          <li key={k} className="flex justify-between text-sm">
                            <span className="text-stone-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-stone-700 font-medium">{String(v)}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-stone-600">{String(data)}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Milestones timeline */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-stone-700">Timeline</h2>
        {visibleMilestones.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Calendar className="mx-auto text-stone-300 mb-3" size={40} />
            <p className="text-stone-400">No milestones yet. Your coordinator will update your journey here.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-stone-100" />
            <ul className="space-y-4">
              {visibleMilestones
                .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                .map((m) => (
                  <li key={m.id} className="relative pl-10">
                    {/* Dot */}
                    <div className="absolute left-2 top-3 w-4 h-4 rounded-full bg-gold-500 border-2 border-white shadow" />
                    <div className="bg-white rounded-2xl p-4 border border-stone-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-stone-800">{m.eventType.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-stone-400">
                          {new Date(m.eventDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {m.note && <p className="text-sm text-stone-500">{m.note}</p>}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </section>

      {/* Empty state when no journey at all */}
      {!journey && visibleMilestones.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <MapPin className="mx-auto text-stone-300 mb-3" size={40} />
          <p className="text-stone-500 font-medium mb-1">Your journey starts here</p>
          <p className="text-stone-400 text-sm">Travel arrangements and your treatment timeline will appear once your case is confirmed.</p>
        </div>
      )}
    </div>
  );
}
