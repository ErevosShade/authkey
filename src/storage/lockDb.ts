import Dexie, { type Table } from 'dexie';

export type LockedSiteRecord = {
  host: string;
  isLocked: boolean;
  updatedAt: number;
  unlockUntil?: number;
  lastUrl?: string;
  unlockCount?: number;
  avgLockDuration?: number;
};

export type ScheduleRecord = {
  id?: number; // Optional for auto-incrementing inserts, but we can manage IDs manually too.
  name: string;
  sites: string[];
  startTime: string;
  endTime: string;
  repeat: string;
  customDays: string[];
  isActive: boolean;
  canModify: boolean;
  triggerDate?: string; // ISO date string for one-time ("never") schedules
};

class AuthKeyDB extends Dexie {
  lockedSites!: Table<LockedSiteRecord, string>;
  schedules!: Table<ScheduleRecord, number>;

  constructor() {
    super('authkey');
    this.version(1).stores({
      lockedSites: '&host, isLocked, updatedAt, unlockUntil',
    });
    this.version(2).stores({
      lockedSites: '&host, isLocked, updatedAt, unlockUntil',
      schedules: '++id, isActive',
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
    unlockCount: 0,
    avgLockDuration: 0,
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
    unlockCount: (existing.unlockCount || 0) + (unlockUntil ? 1 : 0),
  });
}

export async function deleteLockRecord(host: string): Promise<void> {
  await db.lockedSites.delete(host);
}

export async function getLockedSites(): Promise<LockedSiteRecord[]> {
  return db.lockedSites.toArray();
}

export async function getAllSchedules(): Promise<ScheduleRecord[]> {
  return db.schedules.toArray();
}

export async function putSchedule(schedule: ScheduleRecord): Promise<number> {
  return db.schedules.put(schedule);
}

export async function deleteScheduleRecord(id: number): Promise<void> {
  return db.schedules.delete(id);
}
