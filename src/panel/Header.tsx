import { Flag, LayoutGrid, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NEW_ISSUE_URL } from '../shared/tracker';
import { Wordmark } from '../ui/kit';

const btn = 'flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30';

export const closePanel = () => window.parent.postMessage({ action: 'closePanel' }, '*');
export const openDashboard = (tab = '') => chrome.tabs.create({ url: chrome.runtime.getURL(`dashboard.html#/${tab}`) });

export function ActionCluster({ className = '', disabled }: { className?: string; disabled?: boolean }) {
  const nav = useNavigate();
  const icon = { className: 'size-[17px]', strokeWidth: 1.75 } as const;
  return (
    <div className={`flex items-center ${className}`}>
      <button type="button" onClick={() => openDashboard('applications')} disabled={disabled} aria-label="Dashboard" className={btn}><LayoutGrid {...icon} /></button>
      <button type="button" onClick={() => nav('/settings', { replace: true })} disabled={disabled} aria-label="Settings" className={btn}><Settings {...icon} /></button>
      <button type="button" onClick={() => chrome.tabs.create({ url: NEW_ISSUE_URL })} disabled={disabled} aria-label="Report a problem" title="Report a problem on GitHub" className={btn}><Flag {...icon} /></button>
      <button type="button" onClick={closePanel} aria-label="Close" className={btn}><X {...icon} /></button>
    </div>
  );
}

export function Header({ disabled }: { disabled?: boolean }) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between pr-2 pl-4">
      <Wordmark />
      <ActionCluster disabled={disabled} />
    </div>
  );
}
