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
  getAllSchedules,
  logActivity,
  cleanHost,
} from './storage/lockDb';

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

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
        
        let isLocked = Boolean(record?.isLocked);

        // Schedule lock check if not manually locked
        if (!isLocked) {
          const schedules = await getAllSchedules();
          const now = dayjs();
          const daysMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

          for (const schedule of schedules) {
            if (!schedule.isActive) continue;
            const cleanedRequestHost = cleanHost(request.host);
            const cleanedScheduleSites = schedule.sites.map(s => cleanHost(s));
            if (!cleanedScheduleSites.includes(cleanedRequestHost)) continue;

            const isValidDay = (d: dayjs.Dayjs) => {
              if (schedule.repeat === "never") {
                if (!schedule.triggerDate) return false;
                return d.isSame(dayjs(schedule.triggerDate), 'day');
              }
              if (schedule.repeat === "daily") return true;
              const dayIndex = d.day();
              const dayName = daysMap[dayIndex];
              if (schedule.repeat === "weekdays") return dayIndex >= 1 && dayIndex <= 5;
              if (schedule.repeat === "weekends") return dayIndex === 0 || dayIndex === 6;
              if (schedule.repeat === "custom") return schedule.customDays.includes(dayName);
              return true;
            };

            const checkTimeWindow = (dateToCheck: dayjs.Dayjs) => {
              if (!isValidDay(dateToCheck)) return false;
              
              const startT = dayjs(`${dateToCheck.format("YYYY-MM-DD")} ${schedule.startTime}`, "YYYY-MM-DD HH:mm");
              let endT = dayjs(`${dateToCheck.format("YYYY-MM-DD")} ${schedule.endTime}`, "YYYY-MM-DD HH:mm");
              if (endT.isBefore(startT)) endT = endT.add(1, "day");
              
              return now.isBetween(startT, endT, null, "[)");
            };

            // Check yesterday and today for spanning times
            if (checkTimeWindow(now.subtract(1, 'day')) || checkTimeWindow(now)) {
               isLocked = true;
               break;
            }
          }
        }

        return {
          isLocked,
          unlockUntil,
          isUnlocked,
        };
      }

      case MESSAGE_TYPES.SET_LOCK_STATE: {
        const request = typedMessage as SetLockStateRequest;
        await setLockRecord(request.host, request.isLocked, request.url);
        await logActivity(request.host, request.isLocked ? 'locked' : 'unlocked');
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
          pendingUnlocks.set(tabId, { host: cleanHost(request.host), createdAt: Date.now() });
          await openAuthWindow(tabId, cleanHost(request.host));
        }

        return { success: true };
      }

      case MESSAGE_TYPES.AUTH_RESULT: {
        const request = typedMessage as AuthResultRequest;
        pendingUnlocks.delete(request.tabId);

        if (request.success) {
          const unlockUntil = Date.now() + UNLOCK_TTL_MS;
          await setUnlockUntil(request.host, unlockUntil);
          await logActivity(request.host, 'unlocked');
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
    .catch((error: unknown) => {
      sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
    });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  pendingUnlocks.delete(tabId);
});
