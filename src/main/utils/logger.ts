export const Logger = {
  info(scope: string, message: string, details?: unknown) {
    console.info(`[${scope}] ${message}`, details ?? "");
  },

  warn(scope: string, message: string, details?: unknown) {
    console.warn(`[${scope}] ${message}`, details ?? "");
  },

  error(scope: string, message: string, details?: unknown) {
    console.error(`[${scope}] ${message}`, details ?? "");
  },
};
