// =============================================================================
// Dev-Only Logger — Security Hardening
// =============================================================================
// Prevents debug/info logs from leaking internal schema in production.
// console.error and console.warn are kept — those are operational.
// =============================================================================

/* eslint-disable no-console */

const isProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";

export const devLog = {
    info: (...args: unknown[]): void => {
        if (!isProd) console.info(...args);
    },
    warn: (...args: unknown[]): void => {
        if (!isProd) console.warn(...args);
    },
};
