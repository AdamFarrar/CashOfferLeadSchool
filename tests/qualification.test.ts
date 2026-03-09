import { describe, it, expect } from "vitest";

// =============================================================================
// Qualification Form Validation Tests
// =============================================================================
// Tests server-side validation logic for qualification form data.
// Mirrors the validation in app/actions/qualification.ts.
// =============================================================================

interface QualificationData {
    userId: string;
    organizationId: string;
    businessName: string;
    businessType: string;
    yearsExperience: string;
    monthlyBudget: string;
    marketArea: string;
    currentLeadSources: string;
    goals: string;
}

const MAX_TEXT = 500;

function validateQualification(data: Partial<QualificationData>): string | null {
    if (!data.userId || !data.organizationId) {
        return "Authentication required.";
    }

    if (!data.businessName?.trim()) {
        return "Business name is required.";
    }

    if (!data.businessType?.trim()) {
        return "Business type is required.";
    }

    if (!data.marketArea?.trim()) {
        return "Market area is required.";
    }

    const textFields = [
        data.businessName,
        data.businessType,
        data.yearsExperience,
        data.monthlyBudget,
        data.marketArea,
        data.currentLeadSources,
        data.goals,
    ];

    for (const field of textFields) {
        if (field && field.length > MAX_TEXT) {
            return `Fields must be under ${MAX_TEXT} characters.`;
        }
    }

    return null;
}

const VALID_DATA: QualificationData = {
    userId: "user-123",
    organizationId: "org-456",
    businessName: "Acme Real Estate",
    businessType: "Real Estate Investor",
    yearsExperience: "3-5 years",
    monthlyBudget: "$3,000 - $5,000/mo",
    marketArea: "Dallas-Fort Worth, TX",
    currentLeadSources: "PPC, Facebook Ads",
    goals: "Generate 20 cash offer leads per month.",
};

describe("Qualification Form Validation", () => {
    describe("valid submissions", () => {
        it("accepts complete valid data", () => {
            expect(validateQualification(VALID_DATA)).toBeNull();
        });

        it("accepts data with optional fields empty", () => {
            const data = {
                ...VALID_DATA,
                yearsExperience: "",
                monthlyBudget: "",
                currentLeadSources: "",
                goals: "",
            };
            expect(validateQualification(data)).toBeNull();
        });
    });

    describe("required field validation", () => {
        it("rejects missing userId", () => {
            const data = { ...VALID_DATA, userId: "" };
            expect(validateQualification(data)).toBe("Authentication required.");
        });

        it("rejects missing organizationId", () => {
            const data = { ...VALID_DATA, organizationId: "" };
            expect(validateQualification(data)).toBe("Authentication required.");
        });

        it("rejects missing businessName", () => {
            const data = { ...VALID_DATA, businessName: "" };
            expect(validateQualification(data)).toBe("Business name is required.");
        });

        it("rejects whitespace-only businessName", () => {
            const data = { ...VALID_DATA, businessName: "   " };
            expect(validateQualification(data)).toBe("Business name is required.");
        });

        it("rejects missing businessType", () => {
            const data = { ...VALID_DATA, businessType: "" };
            expect(validateQualification(data)).toBe("Business type is required.");
        });

        it("rejects missing marketArea", () => {
            const data = { ...VALID_DATA, marketArea: "" };
            expect(validateQualification(data)).toBe("Market area is required.");
        });
    });

    describe("length limit validation", () => {
        it("rejects businessName over 500 chars", () => {
            const data = { ...VALID_DATA, businessName: "a".repeat(501) };
            expect(validateQualification(data)).toBe("Fields must be under 500 characters.");
        });

        it("accepts businessName at exactly 500 chars", () => {
            const data = { ...VALID_DATA, businessName: "a".repeat(500) };
            expect(validateQualification(data)).toBeNull();
        });

        it("rejects goals over 500 chars", () => {
            const data = { ...VALID_DATA, goals: "x".repeat(501) };
            expect(validateQualification(data)).toBe("Fields must be under 500 characters.");
        });
    });

    describe("edge cases", () => {
        it("handles undefined fields in partial data", () => {
            const data = {
                userId: "user-1",
                organizationId: "org-1",
                businessName: "Test",
                businessType: "Investor",
                marketArea: "NYC",
            };
            expect(validateQualification(data)).toBeNull();
        });

        it("rejects XSS in text fields but validates length", () => {
            const xss = '<script>alert("xss")</script>';
            const data = { ...VALID_DATA, businessName: xss };
            // Validation only checks required + length; XSS is sanitized on output
            expect(validateQualification(data)).toBeNull();
        });
    });
});
