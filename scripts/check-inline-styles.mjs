#!/usr/bin/env node

/**
 * Check for inline style objects in React components.
 *
 * Inline styles are forbidden except for:
 * - Dynamic width/height (template literals)
 * - Dynamic transforms (template literals)
 * - Dynamic background colors (state-dependent variables)
 *
 * Phase 1.7 enforcement scope:
 *   apps/web/app/page.tsx
 *   apps/web/app/(dashboard)/layout.tsx
 *   apps/web/app/(dashboard)/qualify/page.tsx
 *   apps/web/app/(dashboard)/dashboard/page.tsx
 *
 * Files outside the enforcement scope are reported as warnings.
 *
 * Usage:
 *   node scripts/check-inline-styles.mjs
 *   pnpm check:styles
 *
 * Exit code 0 = pass, 1 = enforced violations found.
 */

import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCAN_DIRS = [join(ROOT, "apps"), join(ROOT, "packages")];
const EXTENSIONS = [".tsx", ".ts"];
const IGNORE_DIRS = ["node_modules", ".next", "dist", "prpm-extract"];

// Files where inline styles are enforced (fail CI)
const ENFORCED_FILES = new Set([
    "apps/web/app/page.tsx",
    "apps/web/app/(dashboard)/layout.tsx",
    "apps/web/app/(dashboard)/qualify/page.tsx",
    "apps/web/app/(dashboard)/dashboard/page.tsx",
]);

// Patterns whitelisted (dynamic values that can't be CSS classes)
const WHITELIST_PATTERNS = [
    /style=\{\{\s*background:\s*(?:qual|`)/,       // state-dependent backgrounds
    /style=\{\{\s*background:\s*"rgba\(/,           // known safe static (quick info card)
];

function isWhitelisted(line) {
    return WHITELIST_PATTERNS.some((pat) => pat.test(line.trim()));
}

function* walkFiles(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (IGNORE_DIRS.includes(entry.name)) continue;
            yield* walkFiles(fullPath);
        } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
            yield fullPath;
        }
    }
}

const enforced = [];
const warnings = [];

for (const scanDir of SCAN_DIRS) {
    try {
        for (const filePath of walkFiles(scanDir)) {
            const relPath = relative(ROOT, filePath);
            const content = readFileSync(filePath, "utf-8");
            const lines = content.split("\n");

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes("style={{") && !isWhitelisted(line)) {
                    const entry = { file: relPath, line: i + 1, content: line.trim().slice(0, 120) };
                    if (ENFORCED_FILES.has(relPath)) {
                        enforced.push(entry);
                    } else {
                        warnings.push(entry);
                    }
                }
            }
        }
    } catch {
        // Directory might not exist
    }
}

if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} inline style(s) in non-enforced files (Phase 2 cleanup):\n`);
    const byFile = {};
    for (const w of warnings) {
        if (!byFile[w.file]) byFile[w.file] = 0;
        byFile[w.file]++;
    }
    for (const [file, count] of Object.entries(byFile)) {
        console.warn(`   ${count} — ${file}`);
    }
    console.warn("");
}

if (enforced.length > 0) {
    console.error(`\n❌ ${enforced.length} inline style violation(s) in enforced files:\n`);
    for (const v of enforced) {
        console.error(`  ${v.file}:${v.line}`);
        console.error(`    ${v.content}\n`);
    }
    console.error("Inline styles are forbidden in enforced files. Use Tailwind or CSS classes.\n");
    process.exit(1);
} else {
    console.log(`✅ No inline style violations in enforced files.`);
    if (warnings.length > 0) {
        console.log(`   (${warnings.length} non-enforced occurrences remain for Phase 2 cleanup)\n`);
    }
    process.exit(0);
}
