import type { Metadata } from "next";
import { Inter, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { RootProvider } from 'fumadocs-ui/provider/next';

const inter = Inter({
  subsets: ['latin'],
});

// Editorial serif for display headings — lends the registry clinical gravitas.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

// Institutional mono for technical tokens (FHIR codes, component slugs).
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "FHIR UI",
  description: "A collection of FHIR-themed UI components",
  // metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  // Uncomment above and set NEXT_PUBLIC_SITE_URL in .env for production OG images
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${newsreader.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
