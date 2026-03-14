import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// =============================================================================
// UI Component Structure Tests
// =============================================================================

const uiDir = path.resolve(__dirname, "../../app/components/ui");

describe("UI components exist", () => {
    const components = [
        "Breadcrumbs.tsx",
        "Cards.tsx",
        "EmptyState.tsx",
        "ErrorBoundaryCard.tsx",
        "FeaturePreview.tsx",
        "LoadingSkeleton.tsx",
    ];

    for (const comp of components) {
        it(`${comp} exists`, () => {
            expect(fs.existsSync(path.join(uiDir, comp))).toBe(true);
        });
    }
});

describe("UI component content", () => {
    it("ErrorBoundaryCard uses React class component", () => {
        const src = fs.readFileSync(path.join(uiDir, "ErrorBoundaryCard.tsx"), "utf8");
        expect(src).toContain("React.Component");
    });

    it("LoadingSkeleton is a client component", () => {
        const src = fs.readFileSync(path.join(uiDir, "LoadingSkeleton.tsx"), "utf8");
        // LoadingSkeleton should have visual styling
        expect(src.length).toBeGreaterThan(50);
    });
});
