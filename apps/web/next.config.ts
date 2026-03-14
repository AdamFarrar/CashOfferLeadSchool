import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    output: "standalone",
    outputFileTracingRoot: path.join(__dirname, "../../"),
    serverExternalPackages: ["openai"],
    transpilePackages: [
        "@cols/auth",
        "@cols/database",
        "@cols/services",
        "@cols/analytics",
        "@cols/experiments",
        "@cols/ui",
        "@cols/email",
        "@cols/automation",
        "@cols/events",
        "@cols/ai",
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
