import { describe, it, expect } from "vitest";

// =============================================================================
// UI Component Export Tests
// =============================================================================

describe("Breadcrumbs component", () => {
    it("module exists", async () => {
        const mod = await import("../../app/components/ui/Breadcrumbs");
        expect(mod).toBeTruthy();
    });
});

describe("Cards component", () => {
    it("module exists", async () => {
        const mod = await import("../../app/components/ui/Cards");
        expect(mod).toBeTruthy();
    });
});

describe("EmptyState component", () => {
    it("module exists", async () => {
        const mod = await import("../../app/components/ui/EmptyState");
        expect(mod).toBeTruthy();
    });
});

describe("ErrorBoundaryCard component", () => {
    it("module exists", async () => {
        const mod = await import("../../app/components/ui/ErrorBoundaryCard");
        expect(mod).toBeTruthy();
    });
});

describe("FeaturePreview component", () => {
    it("module exists", async () => {
        const mod = await import("../../app/components/ui/FeaturePreview");
        expect(mod).toBeTruthy();
    });
});

describe("LoadingSkeleton component", () => {
    it("module exists", async () => {
        const mod = await import("../../app/components/ui/LoadingSkeleton");
        expect(mod).toBeTruthy();
    });
});
