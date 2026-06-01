export const PENDING_ORDER_KEY_PREFIX = 'medora:pending-order:';

export const pendingOrderKey = (patientId: string, packageId: string) =>
  `${PENDING_ORDER_KEY_PREFIX}${patientId}:${packageId}`;
