import { ArrowUpRight } from 'lucide-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../ui/theme.css';
import { REPO_URL } from '../shared/tracker';
import { Wordmark } from '../ui/kit';
import { useTheme } from '../ui/theme';

const steps = [
  ['Create a profile', 'Upload your resume and let your AI key fill it in, or type it by hand. It is stored only in this browser.', 'profiles/new'],
  ['Add an AI key (optional)', 'A Gemini or OpenAI key lets lazyfill read your resume and draft answers. It stays in this browser.', 'settings'],
  ['Apply anywhere', 'Open a job application. lazyfill appears on its own. Press Autofill, review, and submit.', 'applications'],
];

function Welcome() {
  useTheme();
  return (
    <main className="mx-auto grid min-h-screen max-w-xl content-center gap-10 px-6 py-16 font-sans">
      <Wordmark />
      <div>
        <h1 className="text-[40px] leading-[1.05] font-semibold tracking-tight">Let’s get you set up.</h1>
        <p className="mt-3 text-base text-muted-foreground">No account needed. Everything stays in your browser.</p>
      </div>
      <ol className="grid gap-3">
        {steps.map(([title, body, to], i) => (
          <li key={title}>
            <a href={`dashboard.html#/${to}`} className="group flex items-start gap-4 rounded-2xl border border-border p-5 transition-colors hover:bg-muted">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <b className="block text-[15px] font-semibold">{title}</b>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">{body}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
            </a>
          </li>
        ))}
      </ol>
      <p className="text-[13px] text-muted-foreground">Click the toolbar icon on any page to open the panel manually. Need help? Read the <a className="font-medium text-foreground underline underline-offset-2" href={REPO_URL} target="_blank" rel="noreferrer">README</a>.</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Welcome /></StrictMode>);
