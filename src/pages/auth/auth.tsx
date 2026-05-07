import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { authenticateUser } from '@/webAuthn';
import { MESSAGE_TYPES } from '@/messages';
import '@/index.css';

type UserProfile = {
  userId: string;
};

function AuthPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [host, setHost] = useState('this site');
  const [tabId, setTabId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabIdParam = params.get('tabId');
    const hostParam = params.get('host');

    setHost(hostParam ? decodeURIComponent(hostParam) : 'this site');
    setTabId(tabIdParam ? Number(tabIdParam) : null);

    chrome.storage.local.get('authkey_user', (result) => {
      const profile = result.authkey_user as UserProfile | undefined;
      setUserId(profile?.userId ?? null);
    });
  }, []);

  const notifyBackground = async (success: boolean, message?: string) => {
    if (!tabId || !host) {
      return;
    }

    await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.AUTH_RESULT,
      tabId,
      host,
      success,
      error: message,
    });
  };

  const handleUnlock = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (!userId) {
        throw new Error('No registered user found. Register in the popup first.');
      }
      const result = await authenticateUser(userId);
      await notifyBackground(result.success, result.message);

      if (!result.success) {
        throw new Error(result.message);
      }

      setIsSubmitting(false);
      window.close();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      await notifyBackground(false, message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Unlock {host}</h1>
          <p className="text-sm text-slate-300">
            Authenticate with WebAuthn.
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleUnlock}
          disabled={isSubmitting}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-950 transition disabled:opacity-60"
        >
          {isSubmitting ? 'Authenticating...' : 'Unlock'}
        </button>

        <p className="mt-4 text-xs text-slate-500">
          Signed in as {userId ?? 'unknown'}
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<AuthPage />);
