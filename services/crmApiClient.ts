const BASE_URL = '/api/patient';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers as Record<string, string> },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const crmApi = {
  // Public onboarding
  getProcedures: (category?: string) =>
    request<any>(`/procedures${category ? `?category=${category}` : ''}`),
  getDestinations: () => request<any>('/destinations'),
  initOnboarding: (data: { email: string; name: string; phone: string; preferredLanguage: string; captchaToken: string }) =>
    request<{ patientId: string; caseId: string }>('/onboarding/init', { method: 'POST', body: JSON.stringify(data) }),
  matchHospitals: (data: { procedureId?: string; destination?: string; category?: string }) =>
    request<{ hospitals: any[] }>('/match-hospitals', { method: 'POST', body: JSON.stringify(data) }),

  // Auth
  getMe: () => request<{ id: string; patientCode: string | null; preferredLanguage: string }>('/me'),
  sendMagicLink: (email: string) =>
    request<{ ok: true }>('/magic-link', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyToken: (token: string) =>
    request<{ patientId: string }>('/verify-token', { method: 'POST', body: JSON.stringify({ token }) }),
  setPassword: (password: string) =>
    request<{ ok: true }>('/set-password', { method: 'POST', body: JSON.stringify({ password }) }),

  // Authenticated
  selectHospitals: (data: { caseId: string; hospitalIds: string[] }) =>
    request<{ conversationIds: string[] }>('/select-hospitals', { method: 'POST', body: JSON.stringify(data) }),
  getConversations: () => request<any>('/conversations'),
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
  getIntakeTemplate: (caseId: string) => request<any>(`/intake/${caseId}/template`),
  submitIntake: (caseId: string, responses: any[]) =>
    request<any>(`/intake/${caseId}`, { method: 'POST', body: JSON.stringify({ responses }) }),
};
