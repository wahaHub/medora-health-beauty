import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

const crmApiState = vi.hoisted(() => ({
  getMessages: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useOptionalLanguage: () => languageState,
}));

vi.mock('@/services/crmApiClient', async () => {
  const actual = await vi.importActual<typeof import('@/services/crmApiClient')>('@/services/crmApiClient');
  return {
    ...actual,
    crmApi: {
      ...actual.crmApi,
      getMessages: crmApiState.getMessages,
    },
  };
});

describe('OnboardingFlow beauty upload prompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    languageState.currentLanguage = 'en';
    crmApiState.getMessages.mockReset();
    crmApiState.getMessages.mockResolvedValue({ messages: [] });
    conversationsState.data = [
      {
        id: 'admin-conversation-1',
        caseId: 'case-1',
        type: 'patient-admin',
        unreadCount: 0,
      },
    ];
  });

  it('shows the five-view upload next step instead of medical material collection', () => {
    render(<OnboardingFlow />);

    expect(screen.getByText('Next: upload your 5 views')).toBeInTheDocument();
    expect(screen.getByText(/prepare your online consultation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload 5 views/i })).toBeInTheDocument();
    expect(screen.queryByText('Please confirm our service rules')).toBeNull();
  });

  it('uses the currently selected language for the five-view upload prompt', () => {
    languageState.currentLanguage = 'zh';

    render(<OnboardingFlow />);

    expect(screen.getByText('下一步：上传您的 5 视图')).toBeInTheDocument();
    expect(screen.getByText(/安排线上问诊/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /上传 5 视图/i })).toBeInTheDocument();
  });

  it('shows the submitted five-view message and CRM input after upload completion', async () => {
    languageState.currentLanguage = 'zh';
    crmApiState.getMessages.mockResolvedValue({
      messages: [
        {
          id: 'msg-1',
          role: 'patient',
          content: '[Beauty Consultation Upload]\nCase ID: case-1',
          createdAt: '2026-06-17T00:00:00.000Z',
        },
      ],
    });

    render(<OnboardingFlow />);

    expect(await screen.findByText('您的 5 视图已经安全提交')).toBeInTheDocument();
    expect(screen.getByText(/24 小时内回复/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /上传 5 视图/i })).not.toBeInTheDocument();
  });
});
