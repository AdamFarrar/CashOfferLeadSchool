import { describe, it, expect } from "vitest";
import { isUrlBlocked, SSRF_DENY_PATTERNS } from "../src/executors/ssrf";

// =============================================================================
// SSRF Protection Unit Tests
// =============================================================================

describe("isUrlBlocked", () => {
    // ── Blocked URLs ──

    it("should block localhost", () => {
        expect(isUrlBlocked("http://localhost/api")).toBe(true);
        expect(isUrlBlocked("https://localhost:8080/path")).toBe(true);
        expect(isUrlBlocked("http://LOCALHOST/path")).toBe(true);
    });

    it("should block IPv4 loopback (127.x)", () => {
        expect(isUrlBlocked("http://127.0.0.1")).toBe(true);
        expect(isUrlBlocked("http://127.0.0.1:3000/webhook")).toBe(true);
        expect(isUrlBlocked("https://127.255.255.255")).toBe(true);
    });

    it("should block private class A (10.x)", () => {
        expect(isUrlBlocked("http://10.0.0.1")).toBe(true);
        expect(isUrlBlocked("http://10.255.255.255/api")).toBe(true);
    });

    it("should block private class B (172.16-31.x)", () => {
        expect(isUrlBlocked("http://172.16.0.1")).toBe(true);
        expect(isUrlBlocked("http://172.31.255.255")).toBe(true);
    });

    it("should NOT block non-private 172.x ranges", () => {
        expect(isUrlBlocked("http://172.15.0.1")).toBe(false);
        expect(isUrlBlocked("http://172.32.0.1")).toBe(false);
    });

    it("should block private class C (192.168.x)", () => {
        expect(isUrlBlocked("http://192.168.0.1")).toBe(true);
        expect(isUrlBlocked("http://192.168.1.100/webhook")).toBe(true);
    });

    it("should block link-local (169.254.x)", () => {
        expect(isUrlBlocked("http://169.254.169.254")).toBe(true);
        expect(isUrlBlocked("http://169.254.169.254/latest/meta-data/")).toBe(true);
    });

    it("should block 0.x addresses", () => {
        expect(isUrlBlocked("http://0.0.0.0")).toBe(true);
        expect(isUrlBlocked("http://0.0.0.0:8080")).toBe(true);
    });

    it("should block IPv6 loopback", () => {
        expect(isUrlBlocked("http://[::1]")).toBe(true);
        expect(isUrlBlocked("http://[::1]:8080/api")).toBe(true);
    });

    it("should block IPv6 ULA (fc/fd)", () => {
        expect(isUrlBlocked("http://[fc00::1]")).toBe(true);
        expect(isUrlBlocked("http://[fd12:3456::1]")).toBe(true);
    });

    it("should block IPv6 link-local (fe80)", () => {
        expect(isUrlBlocked("http://[fe80::1]")).toBe(true);
    });

    // ── Allowed URLs ──

    it("should allow valid external URLs", () => {
        expect(isUrlBlocked("https://webhook.site/test")).toBe(false);
        expect(isUrlBlocked("https://api.example.com/webhooks")).toBe(false);
        expect(isUrlBlocked("https://hooks.slack.com/services/T00/B00/xxx")).toBe(false);
    });

    it("should allow public IPs", () => {
        expect(isUrlBlocked("https://8.8.8.8/api")).toBe(false);
        expect(isUrlBlocked("https://1.1.1.1")).toBe(false);
        expect(isUrlBlocked("https://203.0.113.1/webhook")).toBe(false);
    });

    // ── Pattern count ──

    it("should have at least 11 deny patterns", () => {
        expect(SSRF_DENY_PATTERNS.length).toBeGreaterThanOrEqual(11);
    });
});
