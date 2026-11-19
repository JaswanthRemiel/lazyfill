import {
  buildSelectionPrompt, cleanAnswer, DEFAULT_PROMPT_TEMPLATE, findBankEntry, isSensitiveQuestion, stripDashes, type JobContext,
} from '../shared/answers';
import { getItem, setItem } from '../shared/storage';
import { callLlmWithFallback } from './ai';
import { getActiveProfile } from './data';
import { knownJob } from './tracker';

const weak = (s: string) => !s || /^(untitled role|unknown company)$/i.test(s);

/** The form page rarely carries the job text, so borrow what the job page said. */
async function jobFor(req: GenerateRequest): Promise<JobContext> {
  const known = req.tabId === undefined ? undefined : await knownJob(req.tabId);
  if (!known) return req.job;
  return {
    title: weak(req.job.title) ? known.jobTitle : req.job.title,
    company: weak(req.job.company) ? known.company : req.job.company,
    description: req.job.description || known.description || '',
  };
}

export interface GenerateRequest { question: string; job: JobContext; tabId?: number }
export type GenerateResult =
  | { ok: true; answer: string; source: 'ai' | 'saved' }
  | { ok: false; error: string; sensitive?: boolean };

/** The prompt: your edited copy if there is one, else the built-in text. */
export async function getPromptTemplate(): Promise<string> {
  const local = await getItem('lf_prompt_template');
  return local?.trim() ? local : DEFAULT_PROMPT_TEMPLATE;
}

/** An empty template resets to the built-in prompt. */
export async function savePromptTemplate(template: string): Promise<void> {
  await setItem('lf_prompt_template', template.trim() ? template : '');
}

export async function generateAnswer(req: GenerateRequest): Promise<GenerateResult> {
  const question = req.question.trim().slice(0, 4000);
  if (!question) return { ok: false, error: 'Select the question text first.' };
  if (isSensitiveQuestion(question)) {
    return { ok: false, sensitive: true, error: 'lazyfill does not write answers to legal, work authorization, demographic or identity questions. Answer this one yourself.' };
  }

  const profile = await getActiveProfile();
  if (!profile) return { ok: false, error: 'No profile yet. Create one in the extension first.' };

  const entry = findBankEntry(question, profile.data.answerBank);
  if (entry?.mode === 'static' && entry.answer.trim()) return { ok: true, answer: entry.answer.trim(), source: 'saved' };

  const hint = entry?.mode === 'llm_with_static_hint' && entry.answer.trim() ? entry.answer : undefined;
  const { system, user } = buildSelectionPrompt({ profile: profile.data, job: await jobFor(req), question, template: await getPromptTemplate(), hint });
  try {
    const text = await callLlmWithFallback({ system, prompt: user });
    const answer = stripDashes(cleanAnswer(text));
    if (!answer) return { ok: false, error: 'The model returned an empty answer. Try again.' };
    return { ok: true, answer, source: 'ai' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Something went wrong while writing this answer.' };
  }
}
