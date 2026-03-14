import { describe, it, expect } from "vitest";
import { ADMIN_NAV_ITEMS } from "../../app/lib/admin-nav";
import type { AdminNavItem } from "../../app/lib/admin-nav";

// =============================================================================
// Admin Navigation Registry Tests
// =============================================================================

describe("ADMIN_NAV_ITEMS", () => {
    it("has 10 nav items", () => {
        expect(ADMIN_NAV_ITEMS).toHaveLength(10);
    });

    it("each item has required fields", () => {
        for (const item of ADMIN_NAV_ITEMS) {
            expect(item.href).toBeTruthy();
            expect(item.icon).toBeTruthy();
            expect(item.label).toBeTruthy();
            expect(item.description).toBeTruthy();
        }
    });

    it("all hrefs start with /admin/", () => {
        for (const item of ADMIN_NAV_ITEMS) {
            expect(item.href).toMatch(/^\/admin\//);
        }
    });

    it("all hrefs are unique", () => {
        const hrefs = ADMIN_NAV_ITEMS.map(i => i.href);
        expect(new Set(hrefs).size).toBe(hrefs.length);
    });

    it("all labels are unique", () => {
        const labels = ADMIN_NAV_ITEMS.map(i => i.label);
        expect(new Set(labels).size).toBe(labels.length);
    });

    it("includes Program nav item", () => {
        expect(ADMIN_NAV_ITEMS.some(i => i.label === "Program")).toBe(true);
    });

    it("includes Email Templates nav item", () => {
        expect(ADMIN_NAV_ITEMS.some(i => i.label === "Email Templates")).toBe(true);
    });

    it("includes Automation Rules nav item", () => {
        expect(ADMIN_NAV_ITEMS.some(i => i.label === "Automation Rules")).toBe(true);
    });

    it("includes Settings as last item", () => {
        expect(ADMIN_NAV_ITEMS[ADMIN_NAV_ITEMS.length - 1].label).toBe("Settings");
    });
});

describe("AdminNavItem type", () => {
    it("satisfies the interface", () => {
        const item: AdminNavItem = {
            href: "/admin/test",
            icon: "🧪",
            label: "Test",
            description: "Test description",
        };
        expect(item.href).toBe("/admin/test");
    });
});
