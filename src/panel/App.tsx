import { Navigate, Route, Routes } from 'react-router-dom';
import { AutofillProvider, useAutofill } from './AutofillContext';
import { FailedScreen, ProgressScreen, SuccessScreen } from './AutofillScreens';
import { Home } from './Home';
import { ProfilesPage } from './ProfilesPage';
import { SettingsPage } from './SettingsPage';
import { Shell } from './Shell';
import { useProfiles } from './useProfiles';
import { useTheme } from '../ui/theme';

function Routed() {
  useTheme(); // applies the saved theme class to <html>
  const { profiles, active, loading, error, select } = useProfiles();
  const { status } = useAutofill();

  const busyScreen = status === 'running' ? <ProgressScreen profile={active} />
    : status === 'success' ? <SuccessScreen profile={active} />
      : status === 'failed' ? <FailedScreen profile={active} /> : null;

  return (
    <Shell disabledHeader={status === 'running'}>
      {busyScreen ?? (
        <Routes>
          <Route path="/" element={<Home profiles={profiles} active={active} onSelect={select} />} />
          <Route path="/profile" element={<ProfilesPage profiles={profiles} active={active} loading={loading} error={error} onSelect={select} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Shell>
  );
}

export function App() {
  return (
    <AutofillProvider>
      <Routed />
    </AutofillProvider>
  );
}
