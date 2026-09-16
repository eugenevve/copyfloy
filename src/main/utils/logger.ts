export const Logger = {
  info(scope: string, message: string, details?: unknown): void {
    console.info(`[${scope}] ${message}`, details ?? "");
  },

  warn(scope: string, message: string, details?: unknown): void {
    console.warn(`[${scope}] ${message}`, details ?? "");
  },

  error(scope: string, message: string, details?: unknown): void {
    console.error(`[${scope}] ${message}`, details ?? "");
  },
};
