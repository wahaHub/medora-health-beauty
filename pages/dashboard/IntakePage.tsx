import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { crmApi } from '../../services/crmApiClient';
import { CheckCircle } from 'lucide-react';

export default function IntakePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [template, setTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) {
      crmApi.getIntakeTemplate(caseId)
        .then(t => setTemplate(t))
        .catch(() => setTemplate({ questions: [] }))
        .finally(() => setLoading(false));
    }
  }, [caseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = Object.entries(responses).map(([questionId, answer]) => ({ questionId, answer }));
    await crmApi.submitIntake(caseId!, formatted);
    setSubmitted(true);
  };

  if (loading) return <div className="text-center py-20 text-stone-400">Loading...</div>;

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-lg mx-auto">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold text-navy-900 mb-2">Intake Complete</h2>
        <p className="text-stone-500">Thank you! Your medical intake form has been submitted.</p>
      </div>
    );
  }

  const questions = template?.questions ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif font-bold text-navy-900 mb-6">Medical Intake Form</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-6">
        {questions.length === 0 ? (
          <p className="text-stone-400 text-center py-8">No intake questions available for this case.</p>
        ) : (
          questions.map((q: any) => (
            <div key={q.id}>
              <label className="block text-sm font-medium text-stone-700 mb-1">{q.text}</label>
              <textarea
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                rows={3}
                value={(responses[q.id] as string) || ''}
                onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
              />
            </div>
          ))
        )}
        <button type="submit"
          className="w-full bg-gold-600 hover:bg-gold-700 text-white py-2.5 rounded-xl font-medium transition-colors">
          Submit
        </button>
      </form>
    </div>
  );
}
