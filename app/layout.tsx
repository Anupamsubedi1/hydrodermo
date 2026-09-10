import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PROPOSAL, SITE_META } from "@/content/site";

// Single family, one variable WOFF2 (latin subset), self-hosted. OFL licence in app/fonts/OFL.txt.
const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-latin-wght.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-sans",
  fallback: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

function siteUrl(): URL {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: SITE_META.title,
  description: SITE_META.description,
  applicationName: "Beni Hydropower concept",
  authors: [{ name: PROPOSAL.agency }],
  openGraph: {
    type: "website",
    title: SITE_META.ogTitle,
    description: SITE_META.description,
    siteName: `${PROPOSAL.label}`,
    locale: "en_NP",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_META.ogTitle,
    description: SITE_META.description,
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0c221f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--paper-50)] text-[var(--ink)]">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
