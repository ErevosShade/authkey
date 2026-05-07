import {
  MESSAGE_TYPES,
  type AuthResultRequest,
  type GetLockStateRequest,
  type RequestUnlockRequest,
  type SetLockStateRequest,
} from './messages';
import {
  getLockRecord,
  getLockedSites,
  setLockRecord,
  setUnlockUntil,
} from './storage/lockDb';

const UNLOCK_TTL_MS = 10 * 60 * 1000;
const pendingUnlocks = new Map<number, { host: string; createdAt: number }>();

async function hasRegisteredUser(): Promise<boolean> {
  const result = await chrome.storage.local.get('authkey_user');
  return Boolean(result.authkey_user?.userId);
}

function isCurrentlyUnlocked(unlockUntil?: number): boolean {
  return typeof unlockUntil === 'number' && unlockUntil > Date.now();
}

async function openAuthWindow(tabId: number, host: string): Promise<void> {
  const authUrl = chrome.runtime.getURL(
    `auth.html?tabId=${encodeURIComponent(String(tabId))}&host=${encodeURIComponent(host)}`
  );

  await chrome.windows.create({
    url: authUrl,
    type: 'popup',
    width: 420,
    height: 640,
  });
}

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  const typedMessage = message as { type?: string } | undefined;

  if (!typedMessage?.type) {
    return false;
  }

  const handleMessage = async (): Promise<unknown> => {
    switch (typedMessage.type) {
      case MESSAGE_TYPES.GET_LOCK_STATE: {
        const request = typedMessage as GetLockStateRequest;
        const record = await getLockRecord(request.host);
        const unlockUntil = record?.unlockUntil;
        const isUnlocked = isCurrentlyUnlocked(unlockUntil);
        return {
          isLocked: Boolean(record?.isLocked),
          unlockUntil,
          isUnlocked,
        };
      }

      case MESSAGE_TYPES.SET_LOCK_STATE: {
        const request = typedMessage as SetLockStateRequest;
        await setLockRecord(request.host, request.isLocked, request.url);
        return { success: true };
      }

      case MESSAGE_TYPES.GET_LOCKED_SITES: {
        const sites = await getLockedSites();
        return {
          sites: sites.map((site) => ({
            host: site.host,
            isLocked: site.isLocked,
            updatedAt: site.updatedAt,
            unlockUntil: site.unlockUntil,
            lastUrl: site.lastUrl,
          })),
        };
      }

      case MESSAGE_TYPES.REQUEST_UNLOCK: {
        const request = typedMessage as RequestUnlockRequest;
        const tabId = sender.tab?.id;
        if (!tabId) {
          return { success: false, error: 'Missing tab ID' };
        }

        if (!(await hasRegisteredUser())) {
          await chrome.tabs.sendMessage(tabId, {
            type: MESSAGE_TYPES.SETUP_REQUIRED,
            reason: 'Register a passphrase in the extension popup first.',
          });
          return { success: false, error: 'No registered user' };
        }

        if (!pendingUnlocks.has(tabId)) {
          pendingUnlocks.set(tabId, { host: request.host, createdAt: Date.now() });
          await openAuthWindow(tabId, request.host);
        }

        return { success: true };
      }

      case MESSAGE_TYPES.AUTH_RESULT: {
        const request = typedMessage as AuthResultRequest;
        pendingUnlocks.delete(request.tabId);

        if (request.success) {
          const unlockUntil = Date.now() + UNLOCK_TTL_MS;
          await setUnlockUntil(request.host, unlockUntil);
          await chrome.tabs.sendMessage(request.tabId, {
            type: MESSAGE_TYPES.UNLOCK_GRANTED,
            unlockUntil,
          });
        }

        return { success: request.success };
      }

      default:
        return { success: false, error: 'Unknown message type' };
    }
  };

  handleMessage()
    .then((response) => sendResponse(response))
    .catch((error) => {
      sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
    });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  pendingUnlocks.delete(tabId);
});
