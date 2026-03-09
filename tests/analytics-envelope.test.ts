import { describe, it, expect } from "vitest";

// =============================================================================
// Analytics Envelope & Event Contract Integrity Tests
// =============================================================================
// Validates that all event contracts follow structural rules:
// - All 17 contracts exist and have required fields
// - No duplicate event names
// - All contracts use version 1
// - No PII fields in contract properties
// - EventEnvelope type has required fields
// =============================================================================

import * as contracts from "../packages/analytics/src/event-contracts/index";
import type { EventEnvelope } from "../packages/analytics/src/event-envelope";

const PII_FIELDS = ["email", "phone", "address", "ssn", "name", "first_name", "last_name", "ip_address"];

function getAllContracts(): Array<{ key: string; contract: { name: string; version: number; description: string; properties: Record<string, unknown> } }> {
    return Object.entries(contracts)
        .filter(([, v]) => typeof v === "object" && v !== null && "name" in v && "version" in v)
        .map(([key, contract]) => ({ key, contract: contract as { name: string; version: number; description: string; properties: Record<string, unknown> } }));
}

describe("Analytics Event Contract Integrity", () => {
    const allContracts = getAllContracts();

    it("should have at least 17 event contracts", () => {
        expect(allContracts.length).toBeGreaterThanOrEqual(17);
    });

    it("should have no duplicate event names", () => {
        const names = allContracts.map((c) => c.contract.name);
        const unique = new Set(names);
        expect(unique.size).toBe(names.length);
    });

    it("should use version 1 for all contracts", () => {
        for (const { key, contract } of allContracts) {
            expect(contract.version, `${key} should have version 1`).toBe(1);
        }
    });

    it("should not contain PII fields in any contract properties", () => {
        for (const { key, contract } of allContracts) {
            const propKeys = Object.keys(contract.properties);
            for (const piiField of PII_FIELDS) {
                expect(
                    propKeys.includes(piiField),
                    `${key} contains PII field: ${piiField}`,
                ).toBe(false);
            }
        }
    });

    it("should have typed properties on all contracts", () => {
        for (const { key, contract } of allContracts) {
            expect(contract.properties, `${key} missing properties`).toBeDefined();
            expect(typeof contract.properties, `${key} properties should be object`).toBe("object");
        }
    });

    it("should have required fields on all contracts", () => {
        for (const { key, contract } of allContracts) {
            expect(contract.name, `${key} missing name`).toBeDefined();
            expect(typeof contract.name, `${key} name should be string`).toBe("string");
            expect(contract.version, `${key} missing version`).toBeDefined();
            expect(typeof contract.version, `${key} version should be number`).toBe("number");
            expect(contract.description, `${key} missing description`).toBeDefined();
            expect(typeof contract.description, `${key} description should be string`).toBe("string");
        }
    });

    it("should enforce EventEnvelope shape via type check", () => {
        // Compile-time type check: ensure EventEnvelope has required fields
        const testEnvelope: EventEnvelope<{ test: string }> = {
            event_id: "550e8400-e29b-41d4-a716-446655440000",
            event_name: "test.event",
            event_version: 1,
            timestamp: Date.now(),
            properties: { test: "value" },
        };

        expect(testEnvelope.event_id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
        expect(testEnvelope.event_name).toBe("test.event");
        expect(testEnvelope.event_version).toBe(1);
        expect(testEnvelope.timestamp).toBeGreaterThan(0);
        expect(testEnvelope.properties).toEqual({ test: "value" });
    });
});
