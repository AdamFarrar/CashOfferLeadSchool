import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Top-Level Component Structure Tests
// =============================================================================

const compDir = path.resolve(__dirname, "../../app/components");

describe("Top-level components exist", () => {
    const components = [
        "AnalyticsProvider.tsx",
        "FaqAccordion.tsx",
        "FeedbackPrompt.tsx",
        "FeedbackWidget.tsx",
        "LandingNav.tsx",
        "TrackedCta.tsx",
        "admin/AdminSetupChecklist.tsx",
        "modals/FeedbackModal.tsx",
        "modals/QualificationModal.tsx",
    ];

    for (const comp of components) {
        it(`${comp} exists`, () => {
            expect(fs.existsSync(path.join(compDir, comp))).toBe(true);
        });
    }
});
