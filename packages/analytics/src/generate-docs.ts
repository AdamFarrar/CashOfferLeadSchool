// =============================================================================
// D13: Event Documentation Generator
// =============================================================================
// Generates markdown documentation from event contracts.
// Run via: npx tsx packages/analytics/src/generate-docs.ts
// =============================================================================

import * as contracts from "./event-contracts/index";

interface EventDoc {
    name: string;
    version: number;
    description: string;
    properties: Record<string, string>;
}

function extractDocs(): EventDoc[] {
    const docs: EventDoc[] = [];

    for (const [key, contract] of Object.entries(contracts)) {
        if (
            typeof contract === "object" &&
            contract !== null &&
            "name" in contract &&
            "version" in contract &&
            "description" in contract &&
            "properties" in contract
        ) {
            const props: Record<string, string> = {};
            const c = contract as { name: string; version: number; description: string; properties: Record<string, unknown> };
            for (const [propKey, propValue] of Object.entries(c.properties)) {
                props[propKey] = typeof propValue;
            }
            docs.push({
                name: c.name,
                version: c.version,
                description: c.description,
                properties: props,
            });
        }
    }

    return docs.sort((a, b) => a.name.localeCompare(b.name));
}

function generateMarkdown(docs: EventDoc[]): string {
    const lines: string[] = [
        "# Analytics Event Reference",
        "",
        `> Auto-generated from event contracts. ${docs.length} events documented.`,
        `> Last generated: ${new Date().toISOString()}`,
        "",
        "## Event Index",
        "",
        "| Event | Version | Description |",
        "|---|---|---|",
    ];

    for (const doc of docs) {
        lines.push(`| \`${doc.name}\` | v${doc.version} | ${doc.description} |`);
    }

    lines.push("", "---", "");

    for (const doc of docs) {
        lines.push(`### \`${doc.name}\``);
        lines.push("");
        lines.push(`**Version:** ${doc.version}`);
        lines.push("");
        lines.push(doc.description);
        lines.push("");

        const propEntries = Object.entries(doc.properties);
        if (propEntries.length > 0) {
            lines.push("**Properties:**");
            lines.push("");
            lines.push("| Property | Type |");
            lines.push("|---|---|");
            for (const [key, type] of propEntries) {
                lines.push(`| \`${key}\` | \`${type}\` |`);
            }
        } else {
            lines.push("*No properties.*");
        }

        lines.push("", "---", "");
    }

    return lines.join("\n");
}

// CLI execution
if (typeof process !== "undefined") {
    const docs = extractDocs();
    const markdown = generateMarkdown(docs);
    console.log(markdown);
}

export { extractDocs, generateMarkdown };
