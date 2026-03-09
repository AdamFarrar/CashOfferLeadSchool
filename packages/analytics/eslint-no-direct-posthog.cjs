// =============================================================================
// ESLint Rule: no-direct-posthog
// =============================================================================
// Prevents direct usage of posthog.capture() outside the analytics package.
// All events must go through the typed track() helper.
//
// Add to .eslintrc:
//   "no-restricted-syntax": ["error", {
//     "selector": "CallExpression[callee.object.name='posthog'][callee.property.name='capture']",
//     "message": "Do not use posthog.capture() directly. Use track() from @cocs/analytics instead."
//   }]
// =============================================================================

module.exports = {
    rules: {
        "no-restricted-syntax": [
            "error",
            {
                selector:
                    "CallExpression[callee.object.name='posthog'][callee.property.name='capture']",
                message:
                    "Do not use posthog.capture() directly. Use track() from @cocs/analytics instead.",
            },
            {
                selector:
                    "CallExpression[callee.property.name='capture'][callee.object.property.name='posthog']",
                message:
                    "Do not use posthog.capture() directly. Use track() from @cocs/analytics instead.",
            },
        ],
    },
    overrides: [
        {
            // Allow in the analytics package track.ts (only sanctioned location)
            files: ["packages/analytics/src/track.ts"],
            rules: {
                "no-restricted-syntax": "off",
            },
        },
    ],
};
