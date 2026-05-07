import Dexie, { type Table } from 'dexie';

export type LockedSiteRecord = {
  host: string;
  isLocked: boolean;
  updatedAt: number;
  unlockUntil?: number;
  lastUrl?: string;
};

class AuthKeyDB extends Dexie {
  lockedSites!: Table<LockedSiteRecord, string>;

  constructor() {
    super('authkey');
    this.version(1).stores({
      lockedSites: '&host, isLocked, updatedAt, unlockUntil',
    });
  }
}

export const db = new AuthKeyDB();

export async function getLockRecord(host: string): Promise<LockedSiteRecord | undefined> {
  return db.lockedSites.get(host);
}

export async function setLockRecord(host: string, isLocked: boolean, url: string): Promise<void> {
  const updatedAt = Date.now();
  await db.lockedSites.put({
    host,
    isLocked,
    updatedAt,
    unlockUntil: undefined,
    lastUrl: url,
  });
}

export async function setUnlockUntil(host: string, unlockUntil?: number): Promise<void> {
  const existing = await db.lockedSites.get(host);
  if (!existing) {
    return;
  }

  await db.lockedSites.put({
    ...existing,
    unlockUntil,
    updatedAt: Date.now(),
  });
}

export async function getLockedSites(): Promise<LockedSiteRecord[]> {
  return db.lockedSites.toArray();
}
