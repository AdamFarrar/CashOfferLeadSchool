import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["**/*.test.ts", "**/*.test.tsx"],
        exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json-summary"],
            include: [
                "packages/*/src/**/*.ts",
                "apps/web/app/lib/**/*.ts",
                "apps/web/app/actions/**/*.ts",
            ],
            exclude: [
                "**/node_modules/**",
                "**/dist/**",
                "**/.next/**",
                "**/*.test.*",
                "**/*.d.ts",
                "**/index.ts",
            ],
        },
    },
});
