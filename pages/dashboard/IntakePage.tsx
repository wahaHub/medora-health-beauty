import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Save } from 'lucide-react';
import {
  useIntakeTemplate,
  useIntakeResponse,
  useSaveIntakeResponse,
} from '../../hooks/usePatientIntake';
import { usePatientCases } from '../../hooks/usePatientCases';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import type { IntakeQuestion } from '../../services/crmApiClient';

// ---------------------------------------------------------------------------
// Question renderer
// ---------------------------------------------------------------------------

interface QuestionFieldProps {
  question: IntakeQuestion;
  value: string | string[] | boolean | null | undefined;
  onChange: (id: string, value: string | string[] | boolean) => void;
  readOnly: boolean;
}

function QuestionField({ question, value, onChange, readOnly }: QuestionFieldProps) {
  const baseInput =
    'w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:bg-stone-50 disabled:text-stone-500';

  switch (question.type) {
    case 'textarea':
      return (
        <textarea
          className={`${baseInput} resize-none`}
          rows={4}
          disabled={readOnly}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      );

    case 'select':
      return (
        <select
          className={baseInput}
          disabled={readOnly}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(question.id, e.target.value)}
        >
          <option value="">Select an option…</option>
          {(question.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'multiselect': {
      const selected = (value as string[]) ?? [];
      return (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={selected.includes(opt)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt]
                    : selected.filter((s) => s !== opt);
                  onChange(question.id, next);
                }}
                className="rounded border-stone-300 text-gold-600 focus:ring-gold-500/50"
              />
              <span className="text-sm text-stone-700">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    case 'boolean': {
      const boolVal = value as boolean | null | undefined;
      return (
        <div className="flex gap-4">
          {(['Yes', 'No'] as const).map((label) => {
            const isYes = label === 'Yes';
            const active = boolVal === isYes;
            return (
              <button
                key={label}
                type="button"
                disabled={readOnly}
                onClick={() => onChange(question.id, isYes)}
                className={`px-5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gold-600 border-gold-600 text-white'
                    : 'border-stone-200 text-stone-600 hover:border-gold-400'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            );
          })}
        </div>
      );
    }

    case 'date':
      return (
        <input
          type="date"
          className={baseInput}
          disabled={readOnly}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      );

    case 'file':
      if (readOnly) {
        return (
          <p className="text-sm text-stone-500 italic">
            {value ? String(value) : 'No file uploaded'}
          </p>
        );
      }
      return (
        <input
          type="file"
          className="text-sm text-stone-600"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(question.id, file.name);
          }}
        />
      );

    // 'text' and default
    default:
      return (
        <input
          type="text"
          className={baseInput}
          disabled={readOnly}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(question.id, e.target.value)}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function IntakePage() {
  const [searchParams] = useSearchParams();
  const { patient } = usePatientAuth();
  const { data: casesData, isLoading: casesLoading } = usePatientCases();
  const requestedCaseId = searchParams.get('caseId') ?? undefined;
  const cases = Array.isArray(casesData) ? casesData : (casesData?.cases ?? []);
  const fallbackCaseId = patient?.caseId ?? cases[0]?.id;
  const caseId = requestedCaseId ?? fallbackCaseId;

  const {
    data: template,
    isLoading: templateLoading,
    isError: templateError,
  } = useIntakeTemplate(caseId);

  const {
    data: intakeResponse,
    isLoading: responseLoading,
  } = useIntakeResponse(caseId);

  const saveMutation = useSaveIntakeResponse(caseId);

  // Local answers state — seeded from server response once loaded
  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean | null>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (intakeResponse?.answers) {
      setAnswers(intakeResponse.answers);
    }
  }, [intakeResponse]);

  const isLoading = casesLoading || templateLoading || responseLoading;
  const isSubmitted = intakeResponse?.status === 'submitted';

  const handleChange = (id: string, value: string | string[] | boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (status: 'draft' | 'submitted') => {
    setSaveError(null);
    try {
      await saveMutation.mutateAsync({ answers, status });
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    }
  };

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <div className="text-center py-20 text-stone-400">Loading intake form…</div>;
  }

  if (templateError || !template) {
    if (!caseId) {
      return (
        <div className="text-center py-20 text-stone-400">
          No case is available for intake yet.
        </div>
      );
    }

    return (
      <div className="text-center py-20 text-red-400">
        Unable to load intake form. Please try again later.
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-xl font-serif font-bold text-navy-900 mb-2">Intake Submitted</h2>
          <p className="text-stone-500 mb-6">
            Your medical intake form has been submitted
            {intakeResponse?.submittedAt
              ? ` on ${new Date(intakeResponse.submittedAt).toLocaleDateString()}`
              : ''}
            .
          </p>
          <div className="text-left space-y-8">
            {template.sections.map((section) => (
              <div key={section.id}>
                <h3 className="text-base font-semibold text-stone-700 border-b border-stone-100 pb-2 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-4">
                  {section.questions.map((q) => {
                    const val = answers[q.id];
                    const display = Array.isArray(val)
                      ? val.join(', ')
                      : val === true
                      ? 'Yes'
                      : val === false
                      ? 'No'
                      : (val as string) ?? '—';
                    return (
                      <div key={q.id}>
                        <p className="text-xs text-stone-400 mb-0.5">{q.label}</p>
                        <p className="text-sm text-stone-700">{display || '—'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Editable form (not-started or draft)
  const isSaving = saveMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy-900">Medical Intake Form</h1>
        {intakeResponse?.status === 'draft' && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
            Draft saved
          </span>
        )}
      </div>

      {template.sections.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-stone-400">
          No intake questions available for this case.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave('submitted');
          }}
          className="space-y-8"
        >
          {template.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl p-6">
              <h2 className="text-base font-semibold text-stone-700 border-b border-stone-100 pb-3 mb-5">
                {section.title}
              </h2>
              <div className="space-y-5">
                {section.questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      {q.label}
                      {q.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {q.hint && <p className="text-xs text-stone-400 mb-1.5">{q.hint}</p>}
                    <QuestionField
                      question={q}
                      value={answers[q.id]}
                      onChange={handleChange}
                      readOnly={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {saveError && (
            <p className="text-sm text-red-500 text-center">{saveError}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('draft')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:border-stone-300 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
