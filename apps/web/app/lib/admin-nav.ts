// =============================================================================
// Admin Navigation — Single Source of Truth (Phase H)
// =============================================================================
// Both the sidebar navigation and the admin dashboard import from here.
// No hardcoded admin navigation lists elsewhere.
// =============================================================================

export interface AdminNavItem {
    href: string;
    icon: string;
    label: string;
    description: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
    {
        href: "/admin/program",
        icon: "🎓",
        label: "Program",
        description: "Manage episodes, modules, and program content.",
    },
    {
        href: "/admin/intelligence",
        icon: "🧠",
        label: "Intelligence",
        description: "Generate AI insights — best moments, cohort signals, and takeaways.",
    },
    {
        href: "/admin/enrollments",
        icon: "💳",
        label: "Enrollments",
        description: "Manage user enrollments, payments, and manual access.",
    },
    {
        href: "/admin/sessions",
        icon: "📹",
        label: "Sessions",
        description: "Schedule and manage live coaching sessions.",
    },
    {
        href: "/admin/downloads",
        icon: "📥",
        label: "Downloads",
        description: "Upload and manage downloadable assets for episodes.",
    },
    {
        href: "/admin/bookings",
        icon: "📋",
        label: "Bookings",
        description: "View and manage audit booking requests from users.",
    },
    {
        href: "/admin/email-templates",
        icon: "📧",
        label: "Email Templates",
        description: "Manage verification, password reset, and welcome email templates.",
    },
    {
        href: "/admin/automation-rules",
        icon: "⚡",
        label: "Automation Rules",
        description: "Configure event-driven automation for emails and notifications.",
    },
    {
        href: "/admin/feedback",
        icon: "💬",
        label: "Feedback",
        description: "Review user-submitted feedback and NPS responses.",
    },
];
