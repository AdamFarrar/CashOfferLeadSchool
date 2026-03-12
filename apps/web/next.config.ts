import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    output: "standalone",
    outputFileTracingRoot: path.join(__dirname, "../../"),
    serverExternalPackages: ["openai"],
    transpilePackages: [
        "@cocs/auth",
        "@cocs/database",
        "@cocs/services",
        "@cocs/analytics",
        "@cocs/experiments",
        "@cocs/ui",
        "@cocs/email",
        "@cocs/automation",
        "@cocs/events",
        "@cocs/ai",
    ],
    poweredByHeader: false,
    compress: true,
    images: {
        unoptimized: true,
    },
    headers: async () => [
        {
            source: "/(.*)",
            headers: [
                { key: "X-Frame-Options", value: "DENY" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
            ],
        },
    ],
};

export default nextConfig;
