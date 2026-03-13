// =============================================================================
// Enrollment Gate — Phase 7
// =============================================================================
// Server-side check used by dashboard layout to verify enrollment.
// Admins bypass enrollment. Non-enrolled users redirect to /pricing.
// =============================================================================

import { isUserEnrolled } from "@cocs/services";

export async function checkEnrollment(
    userId: string,
    role: string,
): Promise<{ enrolled: boolean }> {
    // Admins always have access
    if (role === "owner" || role === "admin") {
        return { enrolled: true };
    }

    const enrolled = await isUserEnrolled(userId);
    return { enrolled };
}
