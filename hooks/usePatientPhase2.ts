import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePatientAuth } from '../contexts/PatientAuthContext';
import {
  patientPhase2Api,
  type CreatePatientOrderInput,
  type CreatePatientTicketInput,
  type PatientTicketStatus,
  type PatientTicketType,
  type ReplyToPatientTicketInput,
} from '../services/patientPhase2Api';

// ─── Patient-scoped query keys ─────────────────────────────────────────────────

export const patientPhase2Keys = {
  all: (patientId: string) => ['patient-phase2', patientId] as const,
  tickets: (patientId: string) => [...patientPhase2Keys.all(patientId), 'tickets'] as const,
  ticketList: (
    patientId: string,
    p: { page?: number; limit?: number; status?: PatientTicketStatus; type?: PatientTicketType },
  ) => [...patientPhase2Keys.tickets(patientId), 'list', p.page ?? 1, p.limit ?? 20, p.status ?? 'all', p.type ?? 'all'] as const,
  ticketDetail: (patientId: string, ticketId: string) =>
    [...patientPhase2Keys.tickets(patientId), 'detail', ticketId] as const,
  orders: (patientId: string) => [...patientPhase2Keys.all(patientId), 'orders'] as const,
  orderList: (patientId: string, page = 1, limit = 50) =>
    [...patientPhase2Keys.orders(patientId), 'list', page, limit] as const,
  orderDetail: (patientId: string, orderId: string) =>
    [...patientPhase2Keys.orders(patientId), 'detail', orderId] as const,
  packages: (patientId: string) => [...patientPhase2Keys.all(patientId), 'packages'] as const,
  packageList: (patientId: string, page = 1, limit = 50) =>
    [...patientPhase2Keys.packages(patientId), 'list', page, limit] as const,
  packageDetail: (patientId: string, packageId: string) =>
    [...patientPhase2Keys.packages(patientId), 'detail', packageId] as const,
  journey: (patientId: string, caseId: string) =>
    [...patientPhase2Keys.all(patientId), 'journey', caseId] as const,
  milestones: (patientId: string, caseId: string) =>
    [...patientPhase2Keys.all(patientId), 'milestones', caseId] as const,
  aiSummary: (patientId: string, caseId: string) =>
    [...patientPhase2Keys.all(patientId), 'ai-summary', caseId] as const,
};

function usePatientScope() {
  const { patient } = usePatientAuth();
  return patient?.id ?? 'anonymous';
}

// ─── Tickets ───────────────────────────────────────────────────────────────────

export function usePatientTickets(
  p: { page?: number; limit?: number; status?: PatientTicketStatus; type?: PatientTicketType } = {},
) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: patientPhase2Keys.ticketList(scope, p),
    queryFn: () => patientPhase2Api.listTickets(p),
    enabled: scope !== 'anonymous',
  });
}

export function usePatientTicket(ticketId: string | null) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: ticketId
      ? patientPhase2Keys.ticketDetail(scope, ticketId)
      : [...patientPhase2Keys.tickets(scope), 'detail', 'idle'],
    queryFn: () => patientPhase2Api.getTicket(ticketId!),
    enabled: !!ticketId && scope !== 'anonymous',
  });
}

export function useCreatePatientTicket() {
  const scope = usePatientScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientTicketInput) => patientPhase2Api.createTicket(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: patientPhase2Keys.tickets(scope) }),
  });
}

export function useReplyToPatientTicket() {
  const scope = usePatientScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReplyToPatientTicketInput) => patientPhase2Api.replyTicket(data),
    onSuccess: (_r, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: patientPhase2Keys.ticketDetail(scope, ticketId) });
    },
  });
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export function usePatientOrders(page = 1, limit = 50) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: patientPhase2Keys.orderList(scope, page, limit),
    queryFn: () => patientPhase2Api.listOrders({ page, limit }),
    enabled: scope !== 'anonymous',
  });
}

export function usePatientOrder(orderId: string | null) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: orderId
      ? patientPhase2Keys.orderDetail(scope, orderId)
      : [...patientPhase2Keys.orders(scope), 'detail', 'idle'],
    queryFn: () => patientPhase2Api.getOrder(orderId!),
    enabled: !!orderId && scope !== 'anonymous',
  });
}

export function useCreatePatientOrder() {
  const scope = usePatientScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientOrderInput) => patientPhase2Api.createOrder(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: patientPhase2Keys.orders(scope) }),
  });
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (orderId: string) => patientPhase2Api.createPaymentIntent(orderId),
  });
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export function usePatientPackages(page = 1, limit = 50) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: patientPhase2Keys.packageList(scope, page, limit),
    queryFn: () => patientPhase2Api.listPackages({ page, limit }),
  });
}

export function usePatientPackage(packageId: string | null) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: packageId
      ? patientPhase2Keys.packageDetail(scope, packageId)
      : [...patientPhase2Keys.packages(scope), 'detail', 'idle'],
    queryFn: () => patientPhase2Api.getPackage(packageId!),
    enabled: !!packageId,
  });
}

// ─── Journey ──────────────────────────────────────────────────────────────────

export function usePatientJourney(caseId: string | null) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: caseId
      ? patientPhase2Keys.journey(scope, caseId)
      : [...patientPhase2Keys.all(scope), 'journey', 'idle'],
    queryFn: () => patientPhase2Api.getJourney(caseId!),
    enabled: !!caseId && scope !== 'anonymous',
  });
}

export function usePatientMilestones(caseId: string | null) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: caseId
      ? patientPhase2Keys.milestones(scope, caseId)
      : [...patientPhase2Keys.all(scope), 'milestones', 'idle'],
    queryFn: () => patientPhase2Api.listMilestones(caseId!),
    enabled: !!caseId && scope !== 'anonymous',
  });
}

// ─── AI Summary ───────────────────────────────────────────────────────────────

export function usePatientAiSummary(caseId: string | null) {
  const scope = usePatientScope();
  return useQuery({
    queryKey: caseId
      ? patientPhase2Keys.aiSummary(scope, caseId)
      : [...patientPhase2Keys.all(scope), 'ai-summary', 'idle'],
    queryFn: () => patientPhase2Api.getAiSummary(caseId!),
    enabled: !!caseId && scope !== 'anonymous',
    refetchInterval: (query) => {
      // Poll every 10s while PENDING
      const data = query.state.data;
      return data?.status === 'PENDING' ? 10_000 : false;
    },
  });
}
