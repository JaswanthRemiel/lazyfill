import {
  ArrowRight, Check, ClipboardList, Database, EyeOff, FileScan, Hand, Layers, Lock, MessageSquareText, Sparkles, Zap,
} from 'lucide-react';
import Image from 'next/image';
import { DemoVideo } from '../components/DemoVideo';
import type { ReactNode } from 'react';

const REPO = 'https://github.com/JaswanthRemiel/lazyfill';
const SETUP = `${REPO}/blob/main/docs/SETUP.md`;

const PLATFORMS = [
  'Workday', 'Greenhouse', 'Lever', 'Ashby', 'SmartRecruiters', 'Workable', 'iCIMS', 'Jobvite', 'BambooHR', 'Rippling',
  'Recruitee', 'Teamtailor', 'Personio', 'Breezy HR', 'JazzHR', 'Paylocity', 'Comeet', 'ADP',
];

/* ---------- small pieces ---------- */

function Logo({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6.5" className="fill-primary" />
      <path d="M13.2 4.2 6.6 13h4.5l-.9 6.8 7.2-9.2h-4.6l.4-6.4Z" className="fill-primary-foreground" />
    </svg>
  );
}

function GitHubMark({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

const btnBase = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[transform,background-color,opacity] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
const btnPrimary = `${btnBase} bg-primary text-primary-foreground hover:opacity-90 h-11 px-5 text-[15px]`;
const btnGhost = `${btnBase} border border-border bg-background hover:bg-muted h-11 px-5 text-[15px]`;

function Section({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) {
  return <section id={id} className={`mx-auto w-full max-w-6xl scroll-mt-20 px-4 sm:px-6 ${className}`}>{children}</section>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{children}</p>;
}

function Shot({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-border bg-card shadow-float ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2.5" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
        <span className="size-2.5 rounded-full bg-foreground/15" />
      </div>
      <Image src={src} alt={alt} width={1280} height={800} sizes="(min-width: 1152px) 1024px, 100vw" className="block h-auto w-full" />
    </figure>
  );
}

/* ---------- sections ---------- */

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6" aria-label="Main">
        <a href="#top" className="inline-flex items-center gap-2 text-[16px] font-semibold tracking-tight">
          <Logo className="size-[22px]" /> lazyfill
        </a>
        <div className="ml-auto hidden items-center gap-6 text-[14px] text-muted-foreground md:flex">
          <a className="hover:text-foreground" href="#features">Features</a>
          <a className="hover:text-foreground" href="#how">How it works</a>
          <a className="hover:text-foreground" href="#privacy">Privacy</a>
          <a className="hover:text-foreground" href="#faq">FAQ</a>
        </div>
        <a href={REPO} className={`${btnBase} ml-auto h-9 border border-border px-3.5 text-[14px] hover:bg-muted md:ml-0`}>
          <GitHubMark /> GitHub
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--muted)_0%,transparent_70%)]" />
      <Section className="relative pt-16 pb-10 text-center sm:pt-24">
        <a href={REPO} className="mx-auto inline-flex animate-rise items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[13px] text-muted-foreground hover:text-foreground">
          <span className="size-1.5 rounded-full bg-success" /> Free and open source, MIT licensed <ArrowRight className="size-3.5" />
        </a>
        <h1 className="mx-auto mt-6 max-w-4xl animate-rise text-[44px] leading-[1.02] font-semibold tracking-[-0.035em] [animation-delay:60ms] sm:text-[72px]">
          Apply in one click.<br className="hidden sm:block" /> <span className="text-muted-foreground">Keep track of every one.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl animate-rise text-[17px] leading-relaxed text-muted-foreground [animation-delay:120ms] sm:text-[19px]">
          lazyfill is a Chrome extension that fills job applications from your profile, remembers the answers you give,
          and tracks everything you apply to. Your data lives in your own Firebase project, not on someone else&apos;s server.
        </p>
        <div className="mt-9 flex animate-rise flex-col items-center justify-center gap-3 [animation-delay:180ms] sm:flex-row">
          <a href={REPO} className={btnPrimary}><GitHubMark className="size-[18px]" /> Get it on GitHub</a>
          <a href={SETUP} className={btnGhost}>Read the setup guide <ArrowRight className="size-4" /></a>
        </div>
        <p className="mt-4 animate-rise text-[13px] text-muted-foreground [animation-delay:220ms]">Chrome, Edge and Brave. Never submits a form for you.</p>
      </Section>
      <Section className="relative pb-6">
        <DemoVideo className="mx-auto max-w-5xl animate-rise [animation-delay:260ms]" />
      </Section>
    </div>
  );
}

function Platforms() {
  return (
    <Section className="py-16 text-center">
      <Eyebrow>Recognises the applicant tracking systems companies use</Eyebrow>
      <ul className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
        {PLATFORMS.map((p) => (
          <li key={p} className="rounded-full border border-border px-3.5 py-1.5 text-[14px] text-muted-foreground">{p}</li>
        ))}
        <li className="rounded-full bg-muted px-3.5 py-1.5 text-[14px]">and any form it can read by label</li>
      </ul>
    </Section>
  );
}

const FEATURES: { icon: ReactNode; title: string; body: string }[] = [
  { icon: <Zap />, title: 'One-click autofill', body: 'Contact details, links, work history, education, skills, your resume and common screening questions, filled the way a person would type them.' },
  { icon: <Layers />, title: 'Repeating sections done right', body: '"Add another job" sections are filled one entry at a time, including month and year pickers, "currently work here" boxes and degree wording.' },
  { icon: <ClipboardList />, title: 'Application tracker', body: 'Every application you fill or submit is saved with company, role, link and status. Search, filter, add notes, export CSV or JSON.' },
  { icon: <MessageSquareText />, title: 'Remembers your answers', body: 'Answer a new question once and lazyfill fills it next time. Edit or delete any saved answer from the dashboard.' },
  { icon: <FileScan />, title: 'Import from your resume', body: 'Turn a PDF or image of your resume into a profile with your own AI key, then tick what to add on a review screen.' },
  { icon: <Sparkles />, title: 'Draft answers with AI', body: 'Select an open question, right-click, and get a draft based on your profile and the job. Legal and identity questions are left to you.' },
];

function Features() {
  return (
    <Section id="features" className="py-20">
      <div className="max-w-2xl">
        <Eyebrow>Features</Eyebrow>
        <h2 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.025em] sm:text-[44px]">Everything the tenth application of the day needs.</h2>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted [&>svg]:size-5" aria-hidden="true">{f.icon}</span>
            <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

const SHOWCASE = [
  {
    src: '/screenshots/1-detects-the-application.png',
    alt: 'The panel opening by itself on a job application and naming the platform',
    eyebrow: 'Detect',
    title: 'It notices when you are on an application.',
    points: ['The panel opens by itself on application pages and names the platform.', 'Works inside embedded application forms on company career pages.', 'Click the toolbar icon to open it anywhere else.'],
  },
  {
    src: '/screenshots/3-tracks-every-application.png',
    alt: 'The dashboard listing tracked applications with their status',
    eyebrow: 'Track',
    title: 'A tracker that fills itself in.',
    points: ['Applications are recorded when you fill them and marked submitted when the confirmation page appears.', 'Set statuses from applied to offer, add notes, and filter.', 'Open the same list from any browser with your own web tracker.'],
  },
  {
    src: '/screenshots/4-review-before-anything-is-added.png',
    alt: 'The resume import review screen with fields to tick before adding them',
    eyebrow: 'Import',
    title: 'Nothing is added until you say so.',
    points: ['Resume import reads the page layout and the text, and checks contact details and links against the file.', 'Blank fields are pre-ticked, differing values are not.', 'Anything you typed yourself is never replaced unless you choose it.'],
  },
  {
    src: '/screenshots/5-drafts-answers-with-ai.png',
    alt: 'A drafted answer to an open application question',
    eyebrow: 'Draft',
    title: 'A first draft for the long questions.',
    points: ['Select the question on the page and choose Generate with lazyfill.', 'Uses your profile and the job description, with your own Gemini or OpenAI key.', 'Edit the prompt it uses from Settings.'],
  },
];

function Showcase() {
  return (
    <div className="bg-subtle py-10">
      {SHOWCASE.map((s, i) => (
        <Section key={s.title} className="grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-14">
          <div className={`lg:col-span-5 ${i % 2 ? 'lg:order-2' : ''}`}>
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <h3 className="mt-3 text-[28px] leading-tight font-semibold tracking-[-0.02em] sm:text-[34px]">{s.title}</h3>
            <ul className="mt-6 grid gap-3">
              {s.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                  <Check className="mt-1 size-4 shrink-0 text-foreground" aria-hidden="true" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <Shot className={`lg:col-span-7 ${i % 2 ? 'lg:order-1' : ''}`} src={s.src} alt={s.alt} />
        </Section>
      ))}
    </div>
  );
}

const STEPS = [
  { title: 'Build and load', body: 'Clone the repository, run npm install and npm run build, and load the dist folder as an unpacked extension.', code: 'npm install && npm run build' },
  { title: 'Connect your Firebase', body: 'Create a free Firebase project, paste its web config into Settings, and create your account. About ten minutes, once.', code: 'Settings > Firebase project' },
  { title: 'Open an application', body: 'Pick a profile, press Autofill, review every field, and submit it yourself. lazyfill records it in your tracker.', code: 'Autofill' },
];

function How() {
  return (
    <Section id="how" className="py-24">
      <div className="max-w-2xl">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.025em] sm:text-[44px]">Set up once. Apply all week.</h2>
      </div>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col rounded-2xl border border-border p-6">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-[14px] font-semibold text-primary-foreground">{i + 1}</span>
            <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{s.title}</h3>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
            <code className="mt-5 block rounded-lg bg-muted px-3 py-2 font-mono text-[13px]">{s.code}</code>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-[15px] text-muted-foreground">
        Every step, with checks and fixes for common problems, is in the <a className="font-medium text-foreground underline underline-offset-4" href={SETUP}>setup guide</a>.
      </p>
    </Section>
  );
}

const PRIVACY = [
  { icon: <Database />, title: 'Your Firebase, your data', body: 'Profiles and applications are stored in a Firebase project you own. Security rules let only your verified account read them.' },
  { icon: <EyeOff />, title: 'No servers, no tracking', body: 'There is no lazyfill backend. The code sends nothing to its authors and contains no analytics, trackers or ads.' },
  { icon: <Lock />, title: 'Keys stay in your browser', body: 'Your AI key and Firebase config are kept in the browser. AI requests go straight to the provider you chose, only when you use them.' },
  { icon: <Hand />, title: 'You stay in control', body: 'lazyfill never submits a form, never ticks consent boxes, and never saves passwords, ID numbers or dates of birth.' },
];

function Privacy() {
  return (
    <Section id="privacy" className="pb-24">
      <div className="rounded-[28px] bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-16">
        <p className="text-[13px] font-semibold tracking-wide uppercase opacity-60">Privacy by design</p>
        <h2 className="mt-3 max-w-3xl text-[34px] leading-tight font-semibold tracking-[-0.025em] sm:text-[44px]">Self-hosted, so nobody else holds your job search.</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY.map((p) => (
            <div key={p.title}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/10 [&>svg]:size-5" aria-hidden="true">{p.icon}</span>
              <h3 className="mt-4 text-[16px] font-semibold">{p.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed opacity-70">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

const FAQ = [
  { q: 'Is it free?', a: 'Yes. lazyfill is open source under the MIT license. The Firebase free plan covers personal use. AI features use your own Gemini or OpenAI key, billed by that provider, and are optional.' },
  { q: 'Do I need an AI key?', a: 'No. Autofill, saved answers and the tracker work without one. A key only adds resume import and drafted answers.' },
  { q: 'Why do I need a Firebase project?', a: 'So your account and data are stored somewhere you own instead of on a shared server. You create it once in the Firebase console and paste its config into the extension.' },
  { q: 'Is it in the Chrome Web Store?', a: 'Not at the moment. You build it from the repository and load it as an unpacked extension. The setup guide walks you through it.' },
  { q: 'Which browsers does it support?', a: 'Chromium based browsers, version 114 or newer: Chrome, Edge and Brave. Firefox and Safari are not supported.' },
  { q: 'Will it submit applications for me?', a: 'Never. It fills the form and stops. You review every field and press submit yourself.' },
  { q: 'What if a site is not on the list?', a: 'The general engine fills whatever it can match by label, name and accessibility attributes, and the questions it cannot answer are remembered once you type them.' },
];

function Faq() {
  return (
    <Section id="faq" className="pb-24">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.025em]">Questions, answered.</h2>
        </div>
        <div className="divide-y divide-border border-y border-border lg:col-span-8">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Cta() {
  return (
    <Section className="pb-24 text-center">
      <Logo className="mx-auto size-14" />
      <h2 className="mx-auto mt-6 max-w-2xl text-[34px] leading-tight font-semibold tracking-[-0.025em] sm:text-[44px]">Spend your time on the interview, not the form.</h2>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href={REPO} className={btnPrimary}><GitHubMark className="size-[18px]" /> Get lazyfill</a>
        <a href={SETUP} className={btnGhost}>Setup guide <ArrowRight className="size-4" /></a>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-[13px] text-muted-foreground sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="inline-flex items-center gap-2 font-semibold text-foreground"><Logo className="size-5" /> lazyfill</span>
          <a className="hover:text-foreground" href={REPO}>Source code</a>
          <a className="hover:text-foreground" href={SETUP}>Setup guide</a>
          <a className="hover:text-foreground" href={`${REPO}/issues`}>Report an issue</a>
          <a className="hover:text-foreground" href={`${REPO}/blob/main/LICENSE`}>MIT license</a>
        </div>
        <p className="max-w-4xl leading-relaxed">
          lazyfill is an independent project. It is not affiliated with, endorsed by or sponsored by any employer, job board,
          applicant tracking system, browser vendor or AI provider. Product and company names belong to their owners and are
          used only to describe what lazyfill works with.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-background font-sans text-foreground">
      <a href="#features" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <Nav />
      <main>
        <Hero />
        <Platforms />
        <Features />
        <Showcase />
        <How />
        <Privacy />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
