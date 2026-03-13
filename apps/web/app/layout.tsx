import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import "./lib/automation-init";

export const metadata: Metadata = {
    title: "Cash Offer Conversion School",
    description:
        "Learn to build and operate a successful cash offer lead generation and conversion business.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AnalyticsProvider>{children}</AnalyticsProvider>
            </body>
        </html>
    );
}
