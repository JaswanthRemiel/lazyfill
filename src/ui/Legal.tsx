import { useEffect, useState } from 'react';
import { NOT_AFFILIATED } from '../shared/config';
import { getItem } from '../shared/storage';
import { legalLinks } from '../shared/tracker';

const inExtension = () => typeof chrome !== 'undefined' && !!chrome.storage?.local;

/**
 * Where the policies are. On the web tracker they sit next to the page itself. In the extension they are on the
 * person's own tracker site if they set one up, else in the project's README.
 */
export function useLegalLinks() {
  const [links, setLinks] = useState(() => (inExtension() ? legalLinks() : { privacy: './privacy.html', terms: './terms.html' }));
  useEffect(() => {
    if (!inExtension()) return;
    const load = () => getItem('lf_tracker_url').then((u) => setLinks(legalLinks(u))).catch(() => {});
    load();
    const on = (c: Record<string, chrome.storage.StorageChange>, area: string) => { if (area === 'local' && c.lf_tracker_url) load(); };
    chrome.storage.onChanged?.addListener(on);
    return () => chrome.storage.onChanged?.removeListener(on);
  }, []);
  return links;
}

/** Links to the policies, and the line that says lazyfill is nobody's product but its own. */
export function LegalFooter({ className = '' }: { className?: string }) {
  const { privacy, terms } = useLegalLinks();
  const version = typeof chrome !== 'undefined' && chrome.runtime?.getManifest ? chrome.runtime.getManifest().version : '';
  return (
    <footer className={`grid gap-1.5 border-t border-border pt-6 text-xs text-muted-foreground ${className}`}>
      <p className="max-w-3xl leading-relaxed">{NOT_AFFILIATED}</p>
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        <a className="underline-offset-2 hover:text-foreground hover:underline" href={privacy} target="_blank" rel="noopener noreferrer">Privacy policy</a>
        <a className="underline-offset-2 hover:text-foreground hover:underline" href={terms} target="_blank" rel="noopener noreferrer">Terms</a>
        {version && <span>v{version}</span>}
      </p>
    </footer>
  );
}
