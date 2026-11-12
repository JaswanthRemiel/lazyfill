import type { NextConfig } from 'next';

// The public landing page. Deployed to Vercel by .github/workflows/site.yml whenever site/ changes.
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'] },
};

export default config;
