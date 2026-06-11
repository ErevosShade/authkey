import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { authenticateUser } from '@/webAuthn';
import { MESSAGE_TYPES } from '@/messages';
import { ShieldFP } from "../../components/shared/ShieldFP";
import { UnlockIcon } from "../../components/shared/icons";
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
    document.documentElement.classList.add("dark");

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
    <div className="min-h-screen w-full bg-bg text-text font-[Space_Grotesk,sans-serif] flex items-center justify-center p-6">
      <div className="relative w-full max-w-sm rounded-xl overflow-hidden bg-surface border border-border/50 shadow-sm flex flex-col items-center pt-10 pb-8 px-8">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-ak-accent opacity-50" />

        <div className="relative flex items-center justify-center rounded-full flex-shrink-0 mb-8 w-24 h-24 bg-surface-deep border border-border/50 shadow-sm">
          <div className="absolute rounded-full pointer-events-none opacity-40 border border-border/40" style={{ inset: -12 }} />
          <div className="absolute rounded-full pointer-events-none opacity-20 border border-border/40" style={{ inset: -24 }} />
          <ShieldFP />
        </div>

        <span className="font-mono uppercase tracking-widest text-[10px] text-ak-accent opacity-80 mb-2">
          Authentication Required
        </span>

        <h2 className="font-sans font-semibold text-center text-xl leading-tight tracking-wide text-text mb-2 opacity-90">
          Unlock {host}
        </h2>

        <p className="font-mono uppercase tracking-widest text-[10px] text-text-muted mb-8 opacity-70 text-center">
          verify with webauthn to continue
        </p>

        <div className="w-full flex flex-col gap-4">
          {error ? (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-center">
              <p className="font-mono text-xs tracking-wide text-rose-400">
                {error}
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleUnlock}
            disabled={isSubmitting}
            className="relative w-full flex items-center justify-center gap-3 rounded-lg font-mono font-bold uppercase overflow-hidden cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-widest p-4 bg-btn-bg border border-btn-border/50 text-text shadow-sm"
          >
            <span className="absolute top-0 left-0 bottom-0 w-1 bg-ak-accent opacity-80" />
            <UnlockIcon color="currentColor" /> {isSubmitting ? 'Verifying...' : 'Unlock Site'}
          </button>
        </div>

        <p className="mt-6 font-mono text-center text-xs tracking-wide text-text-muted opacity-80">
          Signed in as {userId ?? 'unknown'}
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<AuthPage />);