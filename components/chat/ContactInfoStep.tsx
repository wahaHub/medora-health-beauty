import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { usePatientEntry } from '../../hooks/usePatientEntry';

export function ContactInfoStep() {
  const { bootstrapSession } = usePatientAuth();
  const { profileDraft, patchProfileDraft, applyOnboardingResult } = usePatientEntry();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    profileDraft.name.trim() !== '' && profileDraft.email.trim() !== '';

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await crmApi.initOnboarding({
        name: profileDraft.name,
        email: profileDraft.email,
        phone: profileDraft.phone,
        disease: profileDraft.disease,
        destination: profileDraft.destination,
        preferredLanguage: 'en',
        captchaToken: 'dev-bypass', // TODO: replace with real captcha token before production
      });

      const nextStep: 'select-hospitals' | 'messages-ready' =
        (result.nextStep as 'select-hospitals' | 'messages-ready') ?? 'select-hospitals';

      bootstrapSession({
        patientId: result.patientId,
        caseId: result.caseId,
        name: profileDraft.name,
        email: profileDraft.email,
        restoreToken: result.restoreToken ?? '',
        nextStep,
      });

      applyOnboardingResult({
        patientId: result.patientId,
        caseId: result.caseId,
        nextStep,
        conversations: result.conversations,
      });
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-3 my-2 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
      <h4 className="text-stone-800 font-serif text-base mb-0.5">Your Info</h4>
      <p className="text-stone-500 text-xs mb-3">We'll match you with the best hospitals.</p>

      <div className="space-y-2.5">
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Name *</label>
          <input
            type="text"
            value={profileDraft.name}
            onChange={(e) => patchProfileDraft({ name: e.target.value })}
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Email *</label>
          <input
            type="email"
            value={profileDraft.email}
            onChange={(e) => patchProfileDraft({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Phone</label>
          <input
            type="tel"
            value={profileDraft.phone}
            onChange={(e) => patchProfileDraft({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Condition / Procedure</label>
          <input
            type="text"
            value={profileDraft.disease}
            onChange={(e) => patchProfileDraft({ disease: e.target.value })}
            placeholder="e.g. rhinoplasty, hair transplant"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Destination</label>
          <input
            type="text"
            value={profileDraft.destination}
            onChange={(e) => patchProfileDraft({ destination: e.target.value })}
            placeholder="e.g. South Korea, Thailand"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-white"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-3 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-stone-300 text-white py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Find My Hospitals
      </button>
    </div>
  );
}
