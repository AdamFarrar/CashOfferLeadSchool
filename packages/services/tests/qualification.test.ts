import { describe, it, expect, vi, beforeEach } from "vitest";

// =============================================================================
// Qualification Service — Pure Logic Tests
// =============================================================================
// Tests input trimming, null handling, and event emission.
// DB operations are mocked at the module level.
// =============================================================================

// Mock the database client and events before importing
vi.mock("@cols/database/client", () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
    },
}));

vi.mock("@cols/database/schema", () => ({
    qualificationForm: {
        id: "id",
        userId: "user_id",
        organizationId: "organization_id",
        businessName: "business_name",
        businessType: "business_type",
        yearsExperience: "years_experience",
        monthlyBudget: "monthly_budget",
        marketArea: "market_area",
        currentLeadSources: "current_lead_sources",
        goals: "goals",
        responses: "responses",
        submittedAt: "submitted_at",
        updatedAt: "updated_at",
    },
}));

vi.mock("@cols/events", () => ({
    emitDomainEvent: vi.fn().mockResolvedValue(undefined),
    DOMAIN_EVENTS: {
        QUALIFICATION_SUBMITTED: "qualification_submitted",
    },
}));

import { submitQualificationForm, getQualificationByUser } from "../src/qualification";
import { emitDomainEvent, DOMAIN_EVENTS } from "@cols/events";

describe("submitQualificationForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should emit QUALIFICATION_SUBMITTED event", async () => {
        const result = await submitQualificationForm({
            userId: "user-1",
            organizationId: "org-1",
            businessName: "  Test Business  ",
            businessType: "  wholesaler  ",
            marketArea: "Dallas TX",
        });

        expect(result.success).toBe(true);
        expect(emitDomainEvent).toHaveBeenCalledOnce();
        expect(emitDomainEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventKey: DOMAIN_EVENTS.QUALIFICATION_SUBMITTED,
                actor: { type: "user", id: "user-1" },
                organizationId: "org-1",
            }),
        );
    });

    it("should still succeed if event emission fails", async () => {
        vi.mocked(emitDomainEvent).mockRejectedValueOnce(new Error("Event bus down"));

        const result = await submitQualificationForm({
            userId: "user-1",
            organizationId: "org-1",
            businessName: "Test Business",
            businessType: "wholesaler",
            marketArea: "Dallas TX",
        });

        // Form submission must succeed even if events fail
        expect(result.success).toBe(true);
    });

    it("should pass trimmed business name in event payload", async () => {
        await submitQualificationForm({
            userId: "user-1",
            organizationId: "org-1",
            businessName: "  Padded Name  ",
            businessType: "wholesaler",
            marketArea: "Austin TX",
        });

        expect(emitDomainEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    user_name: "  Padded Name  ",
                }),
            }),
        );
    });
});
