const HIDDEN_PATTERNS = ['/login'];

export function isDashboardPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

export function shouldShowFloatingPatientEntry(pathname: string, isAuthenticated: boolean) {
  const isHiddenPath = HIDDEN_PATTERNS.some((pattern) =>
    pathname === pattern || pathname.startsWith(`${pattern}/`),
  );

  return !isHiddenPath && !(isDashboardPath(pathname) && !isAuthenticated);
}
