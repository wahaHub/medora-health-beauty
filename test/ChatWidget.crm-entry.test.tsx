import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import ChatWidget from '@/components/ChatWidget';
import { LanguageProvider } from '@/contexts/LanguageContext';

const patientEntryState = vi.hoisted(() => ({
  isWidgetOpen: false,
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

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: () => patientEntryState,
}));

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => patientAuthState,
}));

vi.mock('@/hooks/usePatientConversations', () => ({
  usePatientConversations: () => conversationsState,
}));

vi.mock('@/hooks/useMessages', () => ({
  useMessages: () => messagesState,
}));

vi.mock('@/components/chat/OnboardingFlow', () => ({
  OnboardingFlow: () => <div data-testid="onboarding-shell">Onboarding shell</div>,
}));

describe('ChatWidget CRM-backed entry shell', () => {
  function renderWidget(path = '/') {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <ChatWidget />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  const desktopMatchMedia = (matches = false) => vi.fn().mockImplementation(() => ({
    matches,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    patientEntryState.isWidgetOpen = false;
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
    window.matchMedia = desktopMatchMedia(false);
    patientEntryState.openWidget.mockImplementation(() => {
      patientEntryState.isWidgetOpen = true;
    });
    patientEntryState.closeWidget.mockImplementation(() => {
      patientEntryState.isWidgetOpen = false;
    });
    patientEntryState.setActiveConversationId.mockImplementation((id: string | null) => {
      patientEntryState.activeConversationId = id;
    });
  });

  it('hides the floating widget on /login', () => {
    renderWidget('/login');

    expect(screen.queryByLabelText(/close chat/i)).toBeNull();
    expect(screen.queryByTestId('onboarding-shell')).toBeNull();
  });

  it('keeps the floating widget available on the authenticated dashboard workspace', () => {
    patientAuthState.isAuthenticated = true;

    renderWidget('/dashboard');

    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
  });

  it('hides the floating widget on the unauthenticated dashboard workspace', () => {
    patientAuthState.isAuthenticated = false;

    renderWidget('/dashboard');

    expect(screen.queryByRole('button', { name: /open chat/i })).toBeNull();
  });

  it.each(['collect-profile', 'select-hospitals', 'bootstrap-error'] as const)(
    'keeps the onboarding shell for %s',
    (phase) => {
      patientEntryState.phase = phase;
      patientEntryState.isWidgetOpen = true;

      renderWidget();

      expect(screen.getByTestId('onboarding-shell')).toBeInTheDocument();
    },
  );

  it('renders the CRM-backed conversation surface inline for messages-ready', () => {
    patientEntryState.phase = 'messages-ready';
    patientEntryState.isWidgetOpen = true;
    conversationsState.data = [
      {
        id: 'hospital-conv',
        caseId: 'case-1',
        type: 'patient-hospital',
        hospitalName: 'Beijing United',
        unreadCount: 0,
        updatedAt: '2026-04-18T00:00:00.000Z',
        lastMessage: { content: 'Hospital follow-up', createdAt: '2026-04-18T00:00:00.000Z' },
      },
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

    renderWidget();

    expect(screen.getByTestId('compact-session-switcher')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar-session-list')).toBeNull();
    expect(patientEntryState.setActiveConversationId).toHaveBeenCalledWith('hospital-conv');
    expect(screen.getByRole('button', { name: /beijing united/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /medora support/i })).toBeInTheDocument();
    expect(screen.getAllByText('Latest CRM message').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /full workspace/i })).toHaveAttribute('href', '/dashboard/messages');
    expect(screen.queryByRole('button', { name: /open messages/i })).toBeNull();
    expect(screen.queryByTestId('onboarding-shell')).toBeNull();
  });

  it('uses dashboard translations for the floating chat shell', () => {
    window.localStorage.setItem('medora-language', 'zh');
    patientAuthState.isAuthenticated = true;
    patientEntryState.phase = 'messages-ready';
    conversationsState.data = [];
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const view = render(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <ChatWidget />
          </MemoryRouter>
        </LanguageProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开聊天' }));
    patientEntryState.isWidgetOpen = true;
    view.rerender(
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <ChatWidget />
          </MemoryRouter>
        </LanguageProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('dialog', { name: 'Medora Beauty 聊天' })).toBeInTheDocument();
    expect(screen.getByText('消息')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '完整工作台' })).toHaveAttribute('href', '/dashboard/messages');
    expect(screen.getByText('消息会显示在这里')).toBeInTheDocument();
    expect(screen.queryByText('Messages will appear here')).toBeNull();
  });

  it('renders the enlarged floating chat label', () => {
    patientAuthState.isAuthenticated = true;

    renderWidget('/dashboard');

    expect(screen.getByRole('button', { name: /open chat/i })).toHaveTextContent('Chat with Us');
  });

  it('keeps the localized chat aria label while showing the updated button copy', () => {
    window.localStorage.setItem('medora-language', 'ru');
    patientAuthState.isAuthenticated = true;

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <LanguageProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <ChatWidget />
          </MemoryRouter>
        </LanguageProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('button', { name: 'Открыть чат' })).toHaveTextContent('Chat with Us');
  });

  it('opens as a larger panel, can maximize to modal, then minimize back to panel', () => {
    patientEntryState.phase = 'messages-ready';
    conversationsState.data = [
      {
        id: 'hospital-conv',
        caseId: 'case-1',
        type: 'patient-hospital',
        hospitalName: 'Shanghai Ninth',
        unreadCount: 0,
        updatedAt: '2026-04-18T00:00:00.000Z',
        lastMessage: { content: 'Hospital follow-up', createdAt: '2026-04-18T00:00:00.000Z' },
      },
      {
        id: 'admin-conv',
        caseId: 'case-1',
        type: 'patient-admin',
        unreadCount: 0,
        lastMessage: { content: 'Latest CRM message', createdAt: '2026-04-17T00:00:00.000Z' },
      },
    ];

    const view = renderWidget();

    fireEvent.click(screen.getByRole('button', { name: /open chat/i }));
    view.rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={['/']}>
          <ChatWidget />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('chat-window')).toHaveAttribute('data-chat-display-mode', 'panel');
    expect(screen.getByRole('button', { name: /maximize chat/i })).toBeInTheDocument();
    expect(screen.getByTestId('compact-session-switcher')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar-session-list')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /maximize chat/i }));
    expect(screen.getByTestId('chat-window')).toHaveAttribute('data-chat-display-mode', 'modal');
    expect(screen.getByRole('button', { name: /minimize chat/i })).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-session-list')).toBeInTheDocument();
    expect(screen.queryByTestId('compact-session-switcher')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /minimize chat/i }));
    expect(screen.getByTestId('chat-window')).toHaveAttribute('data-chat-display-mode', 'panel');
    expect(screen.getByTestId('compact-session-switcher')).toBeInTheDocument();
  });

  it('uses the mobile two-state shell without a maximize button', () => {
    window.matchMedia = desktopMatchMedia(true);
    patientEntryState.phase = 'messages-ready';
    patientEntryState.isWidgetOpen = true;
    conversationsState.data = [
      {
        id: 'admin-conv',
        caseId: 'case-1',
        type: 'patient-admin',
        unreadCount: 0,
      },
    ];

    renderWidget();

    expect(screen.getByTestId('chat-window')).toHaveAttribute('data-chat-display-mode', 'mobile-panel');
    expect(screen.queryByRole('button', { name: /maximize chat/i })).toBeNull();
  });
});
