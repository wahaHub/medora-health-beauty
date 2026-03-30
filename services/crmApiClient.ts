const BASE_URL = '/api/patient';

export const RESTORE_TOKEN_STORAGE_KEY = 'medora.patient.restoreToken';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredRestoreToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(RESTORE_TOKEN_STORAGE_KEY);
}

export function setStoredRestoreToken(token: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(RESTORE_TOKEN_STORAGE_KEY, token);
}

export function clearStoredRestoreToken(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(RESTORE_TOKEN_STORAGE_KEY);
}

export function shouldClearStoredRestoreToken(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 408 || error.status === 429) return false;
  return error.status >= 400 && error.status < 500;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers((options.headers as Record<string, string>) || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const rawBody = await res.text();
  let body: any = {};
  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = { message: rawBody };
    }
  }

  if (!res.ok) {
    throw new ApiError(body.error ?? body.message ?? `Request failed: ${res.status}`, res.status);
  }

  return body as T;
}

export type PatientSessionProfile = {
  id?: string;
  patientId?: string;
  caseId?: string;
  name?: string;
  email?: string;
  patientCode?: string | null;
  preferredLanguage?: string;
  restoreToken?: string;
  nextStep?: 'select-hospitals' | 'messages-ready';
};

export type VerifyTokenResponse = PatientSessionProfile & {
  patientId: string;
  caseId: string;
  restoreToken: string;
  nextStep: 'select-hospitals' | 'messages-ready';
};

export type PatientSessionBootstrap = VerifyTokenResponse;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface Conversation {
  id: string;
  caseId?: string;
  /** Discriminator: admin ↔ patient vs. hospital ↔ patient */
  type: 'patient-admin' | 'patient-hospital';
  /** Server-side category string, e.g. 'ADMIN_PATIENT' | 'HOSPITAL_PATIENT' */
  category?: string;
  hospitalId?: string;
  hospitalName?: string;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  /** Who sent the message */
  role: 'patient' | 'admin' | 'system';
  /** Maps to senderType used in MessageList component */
  senderType?: 'patient' | 'hospital' | 'system';
  content: string;
  createdAt: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

// ---------------------------------------------------------------------------
// Intake types
// ---------------------------------------------------------------------------

export interface IntakeQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'date' | 'file';
  label: string;
  required: boolean;
  options?: string[];
  hint?: string;
}

export interface IntakeSection {
  id: string;
  title: string;
  questions: IntakeQuestion[];
}

export interface IntakeTemplate {
  id: string;
  sections: IntakeSection[];
}

export interface IntakeResponse {
  caseId: string;
  status: 'not-started' | 'draft' | 'submitted';
  answers: Record<string, string | string[] | boolean | null>;
  submittedAt?: string;
}

// ---------------------------------------------------------------------------

export const crmApi = {
  // Public onboarding
  getProcedures: (category?: string) =>
    request<any>(`/procedures${category ? `?category=${category}` : ''}`),
  getDestinations: () => request<any>('/destinations'),
  initOnboarding: (data: { email: string; name: string; phone: string; disease?: string; destination?: string; preferredLanguage: string; captchaToken: string }) =>
    request<{
      patientId: string;
      caseId: string;
      restoreToken?: string;
      nextStep?: string;
      conversations?: Array<{ id: string; type: string }>;
    }>('/onboarding/init', { method: 'POST', body: JSON.stringify(data) }),
  matchHospitals: (data: { procedureId?: string; destination?: string; category?: string }) =>
    request<{ hospitals: any[] }>('/match-hospitals', { method: 'POST', body: JSON.stringify(data) }),

  // Auth
  getMe: () => request<PatientSessionProfile>('/me'),
  sendMagicLink: (email: string) =>
    request<{ ok: true }>('/magic-link', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyMagicLink: (token: string) =>
    request<VerifyTokenResponse>('/verify-token', { method: 'POST', body: JSON.stringify({ token }) }),
  restoreSession: (restoreToken: string) =>
    request<VerifyTokenResponse>('/session/restore', { method: 'POST', body: JSON.stringify({ restoreToken }) }),
  logout: () =>
    request<{ ok: true }>('/logout', { method: 'POST' }),
  setPassword: (password: string) =>
    request<{ ok: true }>('/set-password', { method: 'POST', body: JSON.stringify({ password }) }),

  // Authenticated
  selectHospitals: (data: { caseId: string; hospitalIds: string[] }) =>
    request<{ conversationIds: string[]; conversations?: Conversation[] }>('/select-hospitals', { method: 'POST', body: JSON.stringify(data) }),
  /**
   * Returns a typed list of conversations. The server may return them as an
   * array directly, or wrapped in `{ conversations: [...] }`.
   */
  getConversations: (): Promise<Conversation[]> =>
    request<Conversation[] | ConversationsResponse>('/conversations').then((raw) => {
      if (Array.isArray(raw)) return raw;
      return (raw as ConversationsResponse).conversations ?? [];
    }),
  getCases: () => request<any>('/cases'),
  getCaseDetail: (id: string) => request<any>(`/cases/${id}`),
  getMessages: (convId: string, params?: { cursor?: string; limit?: number; after?: string }) => {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set('cursor', params.cursor);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.after) qs.set('after', params.after);
    const query = qs.toString();
    return request<any>(`/conversations/${convId}/messages${query ? `?${query}` : ''}`);
  },
  sendMessage: (convId: string, content: string) =>
    request<any>(`/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  getQuote: (caseId: string) => request<any>(`/cases/${caseId}/quote`),
  acceptQuote: (caseId: string, quoteId: string) =>
    request<any>(`/cases/${caseId}/quote/accept`, { method: 'POST', body: JSON.stringify({ quoteId }) }),
  rejectQuote: (caseId: string, quoteId: string) =>
    request<any>(`/cases/${caseId}/quote/reject`, { method: 'POST', body: JSON.stringify({ quoteId }) }),
  // Intake (dynamic template contract)
  getIntakeTemplate: (caseId: string) =>
    request<IntakeTemplate>(`/cases/${caseId}/intake-template`),
  getIntakeResponse: (caseId: string) =>
    request<IntakeResponse>(`/cases/${caseId}/intake-response`),
  saveIntakeResponse: (
    caseId: string,
    data: { answers: Record<string, unknown>; status: 'draft' | 'submitted' },
  ) =>
    request<IntakeResponse>(`/cases/${caseId}/intake-response`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
