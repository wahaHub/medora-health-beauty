/**
 * Patient entry pre-bootstrap history storage.
 * All writes go to sessionStorage so data is scoped to the browser tab
 * and does not persist across sessions by default.
 * Anonymous (pre-login) history uses a fixed key; after the patient id and
 * case id are known the history is migrated to a scoped key.
 */

export type PreBootstrapMessage = {
  clientId: string;
  role: 'patient' | 'assistant/system-ui';
  content: string;
  createdAt: string;
};

export const ANONYMOUS_HISTORY_KEY = 'patient-entry:anonymous:history';

const OPENING_MESSAGE_CONTENT = "Hello! I'm here to help you find the right hospital and procedure. Tell me a bit about yourself to get started.";

type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function getStorage(): BrowserStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage quota exceeded — silently ignore
  }
}

function removeItem(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(key);
}

function generateStableId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pe-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// --- Key helpers ---

export function getScopedHistoryKey(patientId: string, caseId: string): string {
  return `patient-entry:patient:${patientId}:case:${caseId}:history`;
}

export function getImportCompleteKey(patientId: string, caseId: string, importKey: string): string {
  return `patient-entry:patient:${patientId}:case:${caseId}:import:${importKey}`;
}

export function getActiveImportKeyKey(patientId: string, caseId: string): string {
  return `patient-entry:patient:${patientId}:case:${caseId}:active-import-key`;
}

export function getBootstrapErrorKey(patientId: string, caseId: string): string {
  return `patient-entry:patient:${patientId}:case:${caseId}:bootstrap-error`;
}

// --- Opening message ---

export function createOpeningMessage(createdAt = new Date().toISOString()): PreBootstrapMessage {
  return {
    clientId: `opening-${generateStableId()}`,
    role: 'assistant/system-ui',
    content: OPENING_MESSAGE_CONTENT,
    createdAt,
  };
}

export function ensureOpeningMessageSeeded(
  messages: PreBootstrapMessage[],
  createdAt = new Date().toISOString(),
): PreBootstrapMessage[] {
  const alreadySeeded = messages.some(
    (m) => m.role === 'assistant/system-ui' && m.content === OPENING_MESSAGE_CONTENT,
  );
  if (alreadySeeded) return messages;
  return [createOpeningMessage(createdAt), ...messages];
}

// --- Anonymous history ---

export function readAnonymousHistory(): PreBootstrapMessage[] {
  return readJson<PreBootstrapMessage[]>(ANONYMOUS_HISTORY_KEY, []);
}

export function writeAnonymousHistory(messages: PreBootstrapMessage[]): PreBootstrapMessage[] {
  writeJson(ANONYMOUS_HISTORY_KEY, messages);
  return messages;
}

export function clearAnonymousHistory(): void {
  removeItem(ANONYMOUS_HISTORY_KEY);
}

// --- Scoped history ---

export function readScopedHistory(patientId: string, caseId: string): PreBootstrapMessage[] {
  return readJson<PreBootstrapMessage[]>(getScopedHistoryKey(patientId, caseId), []);
}

export function writeScopedHistory(
  patientId: string,
  caseId: string,
  messages: PreBootstrapMessage[],
): PreBootstrapMessage[] {
  writeJson(getScopedHistoryKey(patientId, caseId), messages);
  return messages;
}

export function clearScopedHistory(patientId: string, caseId: string): void {
  removeItem(getScopedHistoryKey(patientId, caseId));
}

function mergePreBootstrapHistory(
  scopedHistory: PreBootstrapMessage[],
  anonymousHistory: PreBootstrapMessage[],
): PreBootstrapMessage[] {
  const seen = new Set<string>();
  const merged = [...scopedHistory, ...anonymousHistory]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .filter((m) => {
      const key =
        m.role === 'assistant/system-ui' && m.content === OPENING_MESSAGE_CONTENT
          ? 'opening-message'
          : m.clientId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return ensureOpeningMessageSeeded(merged);
}

export function migrateAnonymousHistoryToScoped(
  patientId: string,
  caseId: string,
): PreBootstrapMessage[] {
  const anonymousHistory = readAnonymousHistory();
  const scopedHistory = readScopedHistory(patientId, caseId);
  const merged = writeScopedHistory(
    patientId,
    caseId,
    mergePreBootstrapHistory(scopedHistory, anonymousHistory),
  );
  clearAnonymousHistory();
  return merged;
}

// --- Import key ---

export function getActiveImportKey(patientId: string, caseId: string): string | null {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(getActiveImportKeyKey(patientId, caseId));
}

export function getOrCreateActiveImportKey(patientId: string, caseId: string): string {
  const existing = getActiveImportKey(patientId, caseId);
  if (existing) return existing;
  const nextKey = generateStableId();
  const storage = getStorage();
  if (storage) storage.setItem(getActiveImportKeyKey(patientId, caseId), nextKey);
  return nextKey;
}

export function clearActiveImportKey(patientId: string, caseId: string): void {
  removeItem(getActiveImportKeyKey(patientId, caseId));
}

export function isImportComplete(patientId: string, caseId: string, importKey: string): boolean {
  const storage = getStorage();
  if (!storage) return false;
  return storage.getItem(getImportCompleteKey(patientId, caseId, importKey)) === '1';
}

export function markImportComplete(patientId: string, caseId: string, importKey: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(getImportCompleteKey(patientId, caseId, importKey), '1');
}

export function clearHistoryAfterSuccessfulImport(
  patientId: string,
  caseId: string,
  importKey: string,
): void {
  markImportComplete(patientId, caseId, importKey);
  clearScopedHistory(patientId, caseId);
  clearAnonymousHistory();
  clearActiveImportKey(patientId, caseId);
}

// --- Bootstrap error marker ---

export function readBootstrapErrorMarker(patientId: string, caseId: string): string | null {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(getBootstrapErrorKey(patientId, caseId));
}

export function writeBootstrapErrorMarker(patientId: string, caseId: string, reason: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(getBootstrapErrorKey(patientId, caseId), reason);
}

export function clearBootstrapErrorMarker(patientId: string, caseId: string): void {
  removeItem(getBootstrapErrorKey(patientId, caseId));
}
