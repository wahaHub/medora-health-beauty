const BASE_URL = '/api/patient';
const CRM_API_BASE_URL = (import.meta.env.VITE_CRM_API_BASE_URL || '').replace(/\/+$/, '');

export const RESTORE_TOKEN_STORAGE_KEY = 'beauty.patient.restoreToken';

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

function buildRequestUrl(path: string): string {
  const relativePath = path.startsWith('/api/') ? path : `${BASE_URL}${path}`;
  return CRM_API_BASE_URL ? `${CRM_API_BASE_URL}${relativePath}` : relativePath;
}

export function getCrmApiOrigin(): string {
  if (CRM_API_BASE_URL) {
    try {
      return new URL(CRM_API_BASE_URL).origin;
    } catch {
      // Fall back to the current origin if the configured base URL is malformed.
    }
  }

  if (isBrowser()) {
    return window.location.origin;
  }

  return 'http://localhost';
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

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(buildRequestUrl(path), {
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
  widgetChatTarget?: {
    kind: 'CHATBOT_SESSION';
    sessionId: string;
  } | null;
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
  title?: string;
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
  /** Preserves the backend sender identity when available */
  senderRole?: string;
  content: string;
  createdAt: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  url?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

type ConversationLike = {
  id: string;
  caseId?: string;
  type?: string;
  category?: string;
  title?: string;
  hospitalId?: string;
  hospitalName?: string;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  lastMessagePreview?: string;
  lastMessageAt?: string;
  updatedAt?: string;
};

type MessageLike = {
  id: string;
  conversationId: string;
  role?: 'patient' | 'admin' | 'system';
  senderType?: 'patient' | 'hospital' | 'system';
  senderRole?: string;
  content: string;
  createdAt: string;
  attachments?: MessageAttachment[];
};

type MessageListResponse = {
  data?: MessageLike[];
  messages?: MessageLike[];
};

function normalizeConversationToken(value?: string | null): string | null {
  if (!value) return null;
  return value.trim().replace(/[\s-]+/g, '_').toUpperCase();
}

export function getPatientConversationType(
  conversation: Pick<ConversationLike, 'type' | 'category'>,
): Conversation['type'] | null {
  const normalizedType = normalizeConversationToken(conversation.type);
  if (
    normalizedType === 'PATIENT_ADMIN'
    || normalizedType === 'ADMIN_PATIENT'
  ) {
    return 'patient-admin';
  }

  if (
    normalizedType === 'PATIENT_HOSPITAL'
    || normalizedType === 'HOSPITAL_PATIENT'
  ) {
    return 'patient-hospital';
  }

  const normalizedCategory = normalizeConversationToken(conversation.category);
  if (
    normalizedCategory === 'PATIENT_ADMIN'
    || normalizedCategory === 'ADMIN_PATIENT'
  ) {
    return 'patient-admin';
  }

  if (
    normalizedCategory === 'PATIENT_HOSPITAL'
    || normalizedCategory === 'HOSPITAL_PATIENT'
  ) {
    return 'patient-hospital';
  }

  return null;
}

export function isAdminPatientConversation(
  conversation: Pick<ConversationLike, 'type' | 'category'>,
): boolean {
  return getPatientConversationType(conversation) === 'patient-admin';
}

export function isHospitalPatientConversation(
  conversation: Pick<ConversationLike, 'type' | 'category'>,
): boolean {
  return getPatientConversationType(conversation) === 'patient-hospital';
}

export function isFormalPatientConversation(
  conversation: Pick<ConversationLike, 'type' | 'category'>,
): boolean {
  return getPatientConversationType(conversation) !== null;
}

function getConversationUpdatedAtValue(
  conversation: Pick<ConversationLike, 'updatedAt'>,
): number {
  return conversation.updatedAt ? new Date(conversation.updatedAt).getTime() : 0;
}

export function sortPatientConversations<T extends ConversationLike>(conversations: T[]): T[] {
  return [...conversations].sort((left, right) => {
    const leftType = getPatientConversationType(left);
    const rightType = getPatientConversationType(right);

    if (leftType !== rightType) {
      if (leftType === 'patient-hospital') return -1;
      if (rightType === 'patient-hospital') return 1;
      if (leftType === 'patient-admin') return 1;
      if (rightType === 'patient-admin') return -1;
    }

    return getConversationUpdatedAtValue(right) - getConversationUpdatedAtValue(left);
  });
}

export function getPreferredPatientConversationId<T extends Pick<ConversationLike, 'id' | 'type' | 'category'>>(
  conversations: T[],
  activeConversationId?: string | null,
): string | null {
  if (
    activeConversationId
    && conversations.some((conversation) => conversation.id === activeConversationId)
  ) {
    return activeConversationId;
  }

  const hospitalConversation = conversations.find(isHospitalPatientConversation);
  if (hospitalConversation) {
    return hospitalConversation.id;
  }

  const adminConversation = conversations.find(isAdminPatientConversation);
  return adminConversation?.id ?? conversations[0]?.id ?? null;
}

export function getPatientConversationTitle(
  conversation: Pick<ConversationLike, 'type' | 'category' | 'hospitalName' | 'title'>,
): string {
  if (isAdminPatientConversation(conversation)) {
    return 'Medora Support';
  }

  return conversation.hospitalName ?? conversation.title ?? 'Hospital';
}

export function getPatientConversationThreadLabel(
  conversation: Pick<ConversationLike, 'type' | 'category'>,
): string {
  return isAdminPatientConversation(conversation) ? 'Admin thread' : 'Hospital thread';
}

function normalizeConversation(rawConversation: ConversationLike): Conversation | null {
  const type = getPatientConversationType(rawConversation);
  if (!type) {
    return null;
  }

  const lastMessage = rawConversation.lastMessage
    ?? (
      rawConversation.lastMessagePreview && rawConversation.lastMessageAt
        ? {
            content: rawConversation.lastMessagePreview,
            createdAt: rawConversation.lastMessageAt,
          }
        : undefined
    );

  return {
    id: rawConversation.id,
    caseId: rawConversation.caseId,
    type,
    category: normalizeConversationToken(rawConversation.category) ?? undefined,
    title: rawConversation.title,
    hospitalId: rawConversation.hospitalId,
    hospitalName: rawConversation.hospitalName ?? (isHospitalPatientConversation(rawConversation)
      ? rawConversation.title
      : undefined),
    unreadCount: rawConversation.unreadCount ?? 0,
    lastMessage,
    updatedAt: rawConversation.updatedAt ?? rawConversation.lastMessageAt,
  };
}

export function normalizePatientMessage(rawMessage: MessageLike): Message {
  const senderRole = normalizeConversationToken(rawMessage.senderRole);
  const role = rawMessage.role
    ?? (senderRole === 'PATIENT'
      ? 'patient'
      : senderRole === 'SYSTEM'
        ? 'system'
        : 'admin');
  const senderType = rawMessage.senderType
    ?? (senderRole === 'PATIENT'
      ? 'patient'
      : senderRole === 'SYSTEM'
        ? 'system'
        : senderRole === 'HOSPITAL'
          ? 'hospital'
          : undefined);

  return {
    id: rawMessage.id,
    conversationId: rawMessage.conversationId,
    role,
    senderType,
    senderRole: senderRole ?? undefined,
    content: rawMessage.content,
    createdAt: rawMessage.createdAt,
    attachments: rawMessage.attachments,
  };
}

function normalizePatientMessages(raw: MessageListResponse | MessageLike[]): { messages: Message[] } {
  const records = Array.isArray(raw)
    ? raw
    : raw.messages ?? raw.data ?? [];

  return {
    messages: records.map((message) => normalizePatientMessage(message)),
  };
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
  initOnboarding: (data: { email: string; name: string; phone: string; disease?: string; destination?: string; preferredLanguage?: string; captchaToken?: string }) =>
    request<{
      patientId: string;
      caseId: string;
      restoreToken?: string;
      nextStep?: string;
      widgetChatTarget?: {
        kind: 'CHATBOT_SESSION';
        sessionId: string;
      } | null;
      conversations?: Array<{ id: string; type: string }>;
    }>('/onboarding/init', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        ...(data.captchaToken ? { captchaToken: data.captchaToken } : {}),
        ...(data.preferredLanguage ? { preferredLanguage: data.preferredLanguage } : {}),
      }),
    }),
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
      const conversations = Array.isArray(raw)
        ? raw
        : (raw as ConversationsResponse).conversations ?? [];

      return conversations.flatMap((conversation) => {
        const normalized = normalizeConversation(conversation);
        return normalized ? [normalized] : [];
      });
    }),
  getCases: () => request<any>('/cases'),
  getCaseDetail: (id: string) => request<any>(`/cases/${id}`),
  getMessages: (convId: string, params?: { cursor?: string; limit?: number; after?: string }) => {
    const qs = new URLSearchParams();
    if (params?.cursor) qs.set('cursor', params.cursor);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.after) qs.set('after', params.after);
    const query = qs.toString();
    return request<MessageListResponse | MessageLike[]>(`/conversations/${convId}/messages${query ? `?${query}` : ''}`)
      .then((raw) => normalizePatientMessages(raw));
  },
  sendMessage: (
    convId: string,
    content: string,
    options?: {
      messageType?: 'TEXT' | 'IMAGE' | 'FILE';
      attachments?: Array<{
        fileName: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
      }>;
    },
  ) =>
    request<any>(`/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        ...(options?.messageType ? { messageType: options.messageType } : {}),
        ...(options?.attachments ? { attachments: options.attachments } : {}),
      }),
    }),
  initConversationAttachmentUpload: (data: {
    conversationId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) =>
    request<{
      upload: {
        uploadUrl: string;
        storageKey: string;
        expiresIn: number;
      };
      asset: {
        fileName: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
      };
    }>(`/conversations/${data.conversationId}/attachments/upload`, {
      method: 'POST',
      body: JSON.stringify({
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      }),
    }),
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
