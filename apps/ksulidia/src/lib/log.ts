/**
 * Pencatat error sisi-server terpusat. Detail teknis HANYA masuk ke log server
 * dan tidak pernah dikirim ke client. Ini satu-satunya titik yang perlu diubah
 * bila ingin mengirim ke layanan logging eksternal (Sentry, Datadog, dll.).
 */
export function logError(
  context: string,
  error: unknown,
  meta?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const detail =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { value: String(error) };
  console.error(`[error] ${timestamp} ${context}`, { ...detail, ...meta });
}

/** Catatan peringatan (kondisi tak ideal tapi sudah ditangani). */
export function logWarn(context: string, meta?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  console.warn(`[warn] ${timestamp} ${context}`, meta ?? {});
}
