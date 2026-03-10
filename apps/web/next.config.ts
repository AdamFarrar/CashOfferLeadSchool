import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: ["jsdom", "isomorphic-dompurify", "juice"],
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
    ],
    poweredByHeader: false,
    compress: true,
    headers: async () => [
        {
            source: "/(.*)",
            headers: [
                { key: "X-Frame-Options", value: "DENY" },
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
            ],
        },
    ],
};

export default nextConfig;
