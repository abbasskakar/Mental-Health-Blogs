import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { SITE_URL, GOOGLE_SITE_VERIFICATION, absoluteUrl } from "@/lib/site";
import { getResolvedSettings } from "@/lib/settings";
import { organizationSchema, websiteSchema, jsonLdScript } from "@/lib/schema";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-merriweather",
});

// Metadata is built from admin-saved Site Settings (site_settings table),
// falling back to the code defaults in src/lib/site.ts.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getResolvedSettings();

  // Set the og:image explicitly rather than relying on the src/app/opengraph-image.tsx
  // file convention: because this layout declares an `openGraph` object, the
  // generated image was never merged in and pages shipped with no og:image at all.
  // An admin-set Open Graph Image URL (Settings → SEO) still wins.
  const ogImage = s.ogImage || absoluteUrl("/opengraph-image");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.metaTitle,
      template: `%s | ${s.siteName}`,
    },
    description: s.metaDescription,
    keywords: [
      "mental health",
      "anxiety",
      "depression",
      "mindfulness",
      "stress management",
      "therapy",
      "mental wellness",
      "self-care",
      "emotional health",
    ],
    authors: [{ name: "Dr. Sarah Mitchell" }],
    creator: s.siteName,
    publisher: s.siteName,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: s.siteName,
      title: s.metaTitle,
      description: s.metaDescription,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.metaTitle,
      description: s.metaDescription,
      creator: s.twitterHandle,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getResolvedSettings();

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationSchema())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(websiteSchema())}
        />
        {/* Admin-chosen accent color (Settings → Appearance) overrides the default */}
        {settings.accentColor && (
          <style>{`:root{--accent:${settings.accentColor};}`}</style>
        )}
      </head>
      <body className={`${inter.variable} ${merriweather.variable}`}>
        <ThemeProvider defaultTheme={settings.defaultTheme}>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <GoogleAnalytics gaId={settings.googleAnalyticsId} />
      </body>
    </html>
  );
}
