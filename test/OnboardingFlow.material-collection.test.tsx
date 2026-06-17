import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { OnboardingFlow } from '@/components/chat/OnboardingFlow';

const patientEntryState = vi.hoisted(() => ({
  phase: 'select-hospitals',
  preBootstrapMessages: [],
  profileDraft: {
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '+15550100',
    disease: 'Lung nodule',
    destination: 'Shanghai',
    category: '',
    procedureId: '',
  },
  caseId: 'case-1',
  bootstrapError: null,
  clearBootstrapError: vi.fn(),
  openPanel: vi.fn(),
}));

const patientAuthState = vi.hoisted(() => ({
  patient: {
    id: 'patient-1',
    name: 'Test Patient',
    email: 'test@example.com',
    caseId: 'case-1',
    widgetChatTarget: {
      kind: 'CHATBOT_SESSION',
      sessionId: 'widget-session-1',
    },
  },
}));

const conversationsState = vi.hoisted(() => ({
  data: [
    {
      id: 'admin-conversation-1',
      caseId: 'case-1',
      type: 'patient-admin',
      unreadCount: 0,
    },
  ],
  isLoading: false,
}));

const languageState = vi.hoisted(() => ({
  currentLanguage: 'en',
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/usePatientConversations', () => ({
  usePatientConversations: () => conversationsState,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => languageState,
  useOptionalLanguage: () => languageState,
}));

vi.mock('@/components/messaging/MessageInput', () => ({
  MessageInput: ({ conversationId }: { conversationId: string }) => (
    <div data-testid="crm-message-input">CRM input for {conversationId}</div>
  ),
}));

describe('OnboardingFlow deterministic material collection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    languageState.currentLanguage = 'en';
    conversationsState.data = [
      {
        id: 'admin-conversation-1',
        caseId: 'case-1',
        type: 'patient-admin',
        unreadCount: 0,
      },
    ];
  });

  it('requires rules consent before showing the CRM-backed upload input', () => {
    render(<OnboardingFlow />);

    expect(screen.getByText('Please confirm our service rules')).toBeInTheDocument();
    expect(screen.getByText(/not an emergency service/i)).toBeInTheDocument();
    expect(screen.queryByTestId('crm-message-input')).toBeNull();

    fireEvent.click(screen.getByRole('checkbox', { name: /i understand and agree/i }));

    expect(screen.getByTestId('crm-message-input')).toHaveTextContent('admin-conversation-1');
    expect(screen.getByText(/Upload or describe any materials you already have/i)).toBeInTheDocument();
  });

  it('uses the currently selected language for the fixed questions', () => {
    languageState.currentLanguage = 'zh';

    render(<OnboardingFlow />);

    expect(screen.getByText('请先确认服务规则')).toBeInTheDocument();
    expect(screen.getByText(/不是急诊服务/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /我已理解并同意/ })).toBeInTheDocument();
  });
});
