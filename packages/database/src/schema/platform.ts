// =============================================================================
// Platform Settings Schema
// =============================================================================

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformSetting = pgTable("platform_setting", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    description: text("description"),
    updatedBy: text("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
