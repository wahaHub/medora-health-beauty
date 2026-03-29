import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { crmApi } from '../../services/crmApiClient';
import { usePatientAuth } from '../../contexts/PatientAuthContext';

interface ContactInfoStepProps {
  onSubmit: (caseId: string) => void;
}

export function ContactInfoStep({ onSubmit }: ContactInfoStepProps) {
  const { bootstrapSession } = usePatientAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguage: 'en',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = form.name.trim() && form.email.trim();

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await crmApi.initOnboarding({
        ...form,
        captchaToken: 'dev-bypass',
      });
      bootstrapSession({ patientId: result.patientId, caseId: result.caseId, name: form.name, email: form.email, restoreToken: (result as any).restoreToken ?? '', nextStep: (result as any).nextStep ?? 'select-hospitals' });
      onSubmit(result.caseId);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h4 className="text-stone-800 font-serif text-lg mb-1">Your Contact Info</h4>
      <p className="text-stone-500 text-sm mb-4">We will match you with the best hospitals.</p>

      <div className="space-y-3 flex-1">
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-stone-50"
          />
        </div>
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-stone-50"
          />
        </div>
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-stone-50"
          />
        </div>
        <div>
          <label className="text-stone-600 text-xs font-medium mb-1 block">Preferred Language</label>
          <select
            value={form.preferredLanguage}
            onChange={(e) => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}
            className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-gold-500 transition-colors bg-stone-50"
          >
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="ko">Korean</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-4 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-stone-300 text-white py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Find My Hospitals
      </button>
    </div>
  );
}
