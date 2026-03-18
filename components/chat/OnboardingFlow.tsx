import { useReducer } from 'react';
import { ChevronLeft } from 'lucide-react';
import { CategoryStep } from './CategoryStep';
import { ProcedureStep } from './ProcedureStep';
import { DestinationStep } from './DestinationStep';
import { ContactInfoStep } from './ContactInfoStep';
import { HospitalCards } from './HospitalCards';
import { OnboardingSummary } from './OnboardingSummary';

type Step = 'category' | 'procedure' | 'destination' | 'contact' | 'hospitals' | 'summary';

interface OnboardingState {
  step: Step;
  category: string;
  procedureId: string;
  procedureName: string;
  destination: string;
  caseId: string;
}

type Action =
  | { type: 'SELECT_CATEGORY'; category: string }
  | { type: 'SELECT_PROCEDURE'; procedureId: string; procedureName: string }
  | { type: 'SELECT_DESTINATION'; destination: string }
  | { type: 'SUBMIT_CONTACT'; caseId: string }
  | { type: 'SELECT_HOSPITALS' }
  | { type: 'BACK' };

const STEPS: Step[] = ['category', 'procedure', 'destination', 'contact', 'hospitals', 'summary'];

function reducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      return { ...state, step: 'procedure', category: action.category };
    case 'SELECT_PROCEDURE':
      return { ...state, step: 'destination', procedureId: action.procedureId, procedureName: action.procedureName };
    case 'SELECT_DESTINATION':
      return { ...state, step: 'contact', destination: action.destination };
    case 'SUBMIT_CONTACT':
      return { ...state, step: 'hospitals', caseId: action.caseId };
    case 'SELECT_HOSPITALS':
      return { ...state, step: 'summary' };
    case 'BACK': {
      const idx = STEPS.indexOf(state.step);
      if (idx <= 0) return state;
      return { ...state, step: STEPS[idx - 1] };
    }
    default:
      return state;
  }
}

const initialState: OnboardingState = {
  step: 'category',
  category: '',
  procedureId: '',
  procedureName: '',
  destination: '',
  caseId: '',
};

export function OnboardingFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stepIndex = STEPS.indexOf(state.step);
  const showBack = stepIndex > 0 && state.step !== 'summary';

  return (
    <div className="flex flex-col h-full">
      {/* Progress + Back */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-3 shrink-0">
        {showBack && (
          <button
            onClick={() => dispatch({ type: 'BACK' })}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 flex gap-1">
          {STEPS.slice(0, -1).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-gold-600' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        {state.step === 'category' && (
          <CategoryStep onSelect={(cat) => dispatch({ type: 'SELECT_CATEGORY', category: cat })} />
        )}
        {state.step === 'procedure' && (
          <ProcedureStep
            category={state.category}
            onSelect={(id, name) => dispatch({ type: 'SELECT_PROCEDURE', procedureId: id, procedureName: name })}
          />
        )}
        {state.step === 'destination' && (
          <DestinationStep onSelect={(dest) => dispatch({ type: 'SELECT_DESTINATION', destination: dest })} />
        )}
        {state.step === 'contact' && (
          <ContactInfoStep onSubmit={(caseId) => dispatch({ type: 'SUBMIT_CONTACT', caseId })} />
        )}
        {state.step === 'hospitals' && (
          <HospitalCards
            category={state.category}
            procedureId={state.procedureId || undefined}
            destination={state.destination || undefined}
            caseId={state.caseId}
            onSubmit={() => dispatch({ type: 'SELECT_HOSPITALS' })}
          />
        )}
        {state.step === 'summary' && <OnboardingSummary />}
      </div>
    </div>
  );
}
