import type { ReactNode } from 'react';

export const UPDATED = '20 November 2026';
export const REPO = 'https://github.com/JaswanthRemiel/lazyfill';

/** Plain reading layout shared by the privacy policy and terms. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="mx-auto max-w-[46rem] px-4 pt-12 pb-20 text-[16px] leading-relaxed sm:px-6 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:text-[19px] [&_h2]:font-semibold [&_li]:my-1 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
        <a href="/" className="font-semibold !no-underline">&larr; lazyfill</a>
        <h1 className="mt-6 text-[32px] font-semibold tracking-tight">{title}</h1>
        <p className="text-[14px] text-muted-foreground">Last updated {UPDATED}.</p>
        {children}
      </main>
    </div>
  );
}
