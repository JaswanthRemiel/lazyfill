import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const title = 'lazyfill - autofill job applications, track every one';
const description =
  'lazyfill is a free, open source Chrome extension that fills job applications from your profile, tracks every application, and drafts answers with your own AI key. Your data stays in your own Firebase project.';

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in Vercel when you add a custom domain; Vercel's own address is used otherwise.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  ),
  title,
  description,
  openGraph: {
    title,
    description: 'Free, open source, self-hosted. Fill applications in one click, track what you applied to, and keep your data in your own Firebase project.',
    type: 'website',
    images: [{ url: '/screenshots/2-autofills-in-one-click.png', width: 1280, height: 800, alt: 'lazyfill filling a job application' }],
    videos: [{ url: '/video/demo.mp4', width: 1920, height: 1080, type: 'video/mp4' }],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
