const RETURN_TO_STORAGE_KEY = 'medora.patient.returnTo';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function rememberPatientReturnTo(path: string): void {
  if (!isBrowser() || !path.startsWith('/')) {
    return;
  }

  window.localStorage.setItem(RETURN_TO_STORAGE_KEY, path);
}

export function readPatientReturnTo(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(RETURN_TO_STORAGE_KEY);
}

export function clearPatientReturnTo(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(RETURN_TO_STORAGE_KEY);
}
