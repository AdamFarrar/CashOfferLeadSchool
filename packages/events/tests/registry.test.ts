import { describe, it, expect, beforeEach } from "vitest";
import {
    registerListener,
    registerListenerAll,
    getListeners,
    clearAllListeners,
} from "../src/registry";

// =============================================================================
// Event Registry Tests
// =============================================================================

describe("Event Listener Registry", () => {
    beforeEach(() => {
        clearAllListeners();
    });

    describe("registerListener", () => {
        it("registers a listener for a specific event", () => {
            const fn = async () => {};
            registerListener("user_registered", fn);
            const listeners = getListeners("user_registered");
            expect(listeners).toContain(fn);
        });

        it("supports multiple listeners for same event", () => {
            const fn1 = async () => {};
            const fn2 = async () => {};
            registerListener("user_registered", fn1);
            registerListener("user_registered", fn2);
            const listeners = getListeners("user_registered");
            expect(listeners).toHaveLength(2);
        });

        it("keeps listeners separate across events", () => {
            const fn1 = async () => {};
            const fn2 = async () => {};
            registerListener("user_registered", fn1);
            registerListener("feedback_submitted", fn2);
            expect(getListeners("user_registered")).toHaveLength(1);
            expect(getListeners("feedback_submitted")).toHaveLength(1);
        });
    });

    describe("registerListenerAll", () => {
        it("registers a wildcard listener", () => {
            const fn = async () => {};
            registerListenerAll(fn);
            // Wildcard appears in all event listeners
            const listeners = getListeners("user_registered");
            expect(listeners).toContain(fn);
        });

        it("wildcard listener appears for any event key", () => {
            const fn = async () => {};
            registerListenerAll(fn);
            expect(getListeners("feedback_submitted")).toContain(fn);
            expect(getListeners("enrollment_completed")).toContain(fn);
        });
    });

    describe("getListeners", () => {
        it("returns empty array for events with no listeners", () => {
            expect(getListeners("user_registered")).toEqual([]);
        });

        it("combines specific and wildcard listeners", () => {
            const specific = async () => {};
            const wildcard = async () => {};
            registerListener("user_registered", specific);
            registerListenerAll(wildcard);
            const listeners = getListeners("user_registered");
            expect(listeners).toHaveLength(2);
            expect(listeners).toContain(specific);
            expect(listeners).toContain(wildcard);
        });
    });

    describe("clearAllListeners", () => {
        it("removes all specific listeners", () => {
            registerListener("user_registered", async () => {});
            registerListener("feedback_submitted", async () => {});
            clearAllListeners();
            expect(getListeners("user_registered")).toEqual([]);
            expect(getListeners("feedback_submitted")).toEqual([]);
        });

        it("removes all wildcard listeners", () => {
            registerListenerAll(async () => {});
            clearAllListeners();
            expect(getListeners("user_registered")).toEqual([]);
        });
    });
});
