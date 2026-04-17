import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ChatWidget from '../components/ChatWidget';

const patientEntryState = vi.hoisted(() => ({
  isWidgetOpen: true,
  phase: 'collect-profile',
  activeConversationId: null,
  caseId: 'case-1',
  openWidget: vi.fn(),
  closeWidget: vi.fn(),
  toggleWidget: vi.fn(),
  setActiveConversationId: vi.fn(),
}));

const patientAuthState = vi.hoisted(() => ({
  isLoading: false,
  isAuthenticated: false,
}));

const conversationsState = vi.hoisted(() => ({
  data: [],
  isLoading: false,
}));

const messagesState = vi.hoisted(() => ({
  data: { messages: [] },
  isLoading: false,
  refetch: vi.fn(),
}));

vi.mock('../hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('../contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('../hooks/usePatientConversations', () => ({
  usePatientConversations: () => conversationsState,
}));

vi.mock('../hooks/useMessages', () => ({
  useMessages: () => messagesState,
}));

vi.mock('../components/chat/OnboardingFlow', () => ({
  OnboardingFlow: () => <div data-testid="onboarding-shell">Onboarding shell</div>,
}));

describe('ChatWidget CRM-backed entry shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientEntryState.isWidgetOpen = true;
    patientEntryState.phase = 'collect-profile';
    patientEntryState.activeConversationId = null;
    patientEntryState.caseId = 'case-1';
    patientAuthState.isLoading = false;
    patientAuthState.isAuthenticated = false;
    conversationsState.data = [];
    conversationsState.isLoading = false;
    messagesState.data = { messages: [] };
    messagesState.isLoading = false;
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('hides the floating widget on /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText(/close chat/i)).toBeNull();
    expect(screen.queryByTestId('onboarding-shell')).toBeNull();
  });

  it.each(['collect-profile', 'select-hospitals', 'bootstrap-error'] as const)(
    'keeps the onboarding shell for %s',
    (phase) => {
      patientEntryState.phase = phase;

      render(
        <MemoryRouter initialEntries={['/']}>
          <ChatWidget />
        </MemoryRouter>,
      );

      expect(screen.getByTestId('onboarding-shell')).toBeInTheDocument();
    },
  );

  it('renders the CRM-backed conversation surface inline for messages-ready', () => {
    patientEntryState.phase = 'messages-ready';
    conversationsState.data = [
      {
        id: 'admin-conv',
        caseId: 'case-1',
        type: 'patient-admin',
        unreadCount: 1,
        lastMessage: { content: 'Latest CRM message', createdAt: '2026-04-17T00:00:00.000Z' },
      },
    ];
    messagesState.data = {
      messages: [
        {
          id: 'msg-1',
          content: 'Latest CRM message',
          senderType: 'hospital',
          role: 'admin',
          createdAt: '2026-04-17T00:00:00.000Z',
        },
      ],
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Latest CRM message').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /full workspace/i })).toHaveAttribute('href', '/dashboard/messages');
    expect(screen.queryByRole('button', { name: /open messages/i })).toBeNull();
    expect(screen.queryByTestId('onboarding-shell')).toBeNull();
  });
});
