/* eslint-disable no-console */
const severities = ['debug', 'info', 'warn', 'error'] as const;
type Severity = (typeof severities)[number];

const consoleMethods: Record<Severity, (...args: unknown[]) => void> = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

export function createLogger(module: string) {
    return Object.fromEntries(
        severities.map((sev) => [
            sev,
            (message: string) => consoleMethods[sev](`[${new Date().toISOString()}][${module}][${sev}]: ${message}`),
        ]),
    ) as Record<Severity, (message: string) => void>;
}
