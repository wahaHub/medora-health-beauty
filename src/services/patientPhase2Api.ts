import { request } from './crmApiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PatientTicketType =
  | 'GENERAL_SUPPORT'
  | 'MEDICAL_QUESTION'
  | 'QUOTE_PRICING'
  | 'PACKAGE_ORDER'
  | 'PAYMENT_REFUND'
  | 'TRAVEL_JOURNEY'
  | 'ACCOUNT_TECHNICAL';

export type PatientTicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type PatientTicketStatus =
  | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_INFO' | 'RESOLVED' | 'CLOSED';

export type PatientTicket = {
  id: string; ticketNumber: string; caseId: string | null;
  type: PatientTicketType; source: string; priority: PatientTicketPriority;
  status: PatientTicketStatus; subject: string | null; description: string;
  sourcePage: string | null; resolvedAt: string | null;
  createdAt: string; updatedAt: string;
};

export type PatientTicketReply = {
  id: string; ticketId: string; authorRole: string;
  content: string; attachments: unknown; createdAt: string;
};

export type PatientTicketDetail = { ticket: PatientTicket; replies: PatientTicketReply[] };

export type CreatePatientTicketInput = {
  type: PatientTicketType; subject: string; description: string; caseId?: string;
};

export type ReplyToPatientTicketInput = { ticketId: string; content: string };

export type PatientOrder = {
  id: string; orderNumber: string; caseId: string | null; packageId: string | null;
  type: string; amount: string; currency: string; status: string;
  paymentMethod: string | null; paidAt: string | null; completedAt: string | null;
  createdAt: string; updatedAt: string;
};

export type CreatePatientOrderInput = { packageId: string; caseId?: string };

export type PaymentIntentResult = { clientSecret: string; orderId: string };

export type PatientPackage = {
  id: string; nameEn: string; nameZh: string | null; type: string;
  price: string; currency: string;
  descriptionEn: string | null; descriptionZh: string | null;
  inclusions: unknown; coverImageUrl: string | null;
};

export type PatientJourney = {
  id: string; caseId: string;
  visa: unknown | null; insurance: unknown | null; accommodation: unknown | null;
  transportation: unknown | null; postCare: unknown | null;
  createdAt: string; updatedAt: string;
} | null;

export type PatientJourneyMilestone = {
  id: string; caseId: string; eventType: string; eventDate: string;
  note: string | null; isVisibleToPatient: boolean; createdAt: string; updatedAt: string;
};

export type PatientAiSummary = {
  caseId: string; status: 'EMPTY' | 'PENDING' | 'READY' | 'FAILED';
  summary: string | null; language: string | null; updatedAt: string | null;
};

export type PaginatedResult<T> = {
  data: T[]; total: number; page: number; limit: number; totalPages: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toQueryString(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  return params.toString();
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const patientPhase2Api = {
  // Tickets
  listTickets: (p: { page?: number; limit?: number; status?: PatientTicketStatus; type?: PatientTicketType } = {}) => {
    const qs = toQueryString(p as Record<string, string | number | undefined>);
    return request<PaginatedResult<PatientTicket>>(`/tickets${qs ? `?${qs}` : ''}`);
  },
  getTicket: (ticketId: string) => request<PatientTicketDetail>(`/tickets/${ticketId}`),
  createTicket: (data: CreatePatientTicketInput) =>
    request<PatientTicket>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  replyTicket: ({ ticketId, content }: ReplyToPatientTicketInput) =>
    request<PatientTicketReply>(`/tickets/${ticketId}/replies`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Orders
  listOrders: (p: { page?: number; limit?: number } = {}) => {
    const qs = toQueryString(p as Record<string, number | undefined>);
    return request<PaginatedResult<PatientOrder>>(`/orders${qs ? `?${qs}` : ''}`);
  },
  getOrder: (orderId: string) => request<PatientOrder>(`/orders/${orderId}`),
  createOrder: (data: CreatePatientOrderInput) =>
    request<PatientOrder>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  createPaymentIntent: (orderId: string) =>
    request<PaymentIntentResult>(`/orders/${orderId}/payment-intents`, { method: 'POST' }),

  // Packages
  listPackages: (p: { page?: number; limit?: number } = {}) => {
    const qs = toQueryString(p as Record<string, number | undefined>);
    return request<PaginatedResult<PatientPackage>>(`/packages${qs ? `?${qs}` : ''}`);
  },
  getPackage: (packageId: string) => request<PatientPackage>(`/packages/${packageId}`),

  // Journey
  getJourney: (caseId: string) => request<PatientJourney>(`/cases/${caseId}/journey`),
  listMilestones: (caseId: string) => request<PatientJourneyMilestone[]>(`/cases/${caseId}/milestones`),

  // AI Summary
  getAiSummary: (caseId: string) => request<PatientAiSummary>(`/cases/${caseId}/ai-summary`),
};
