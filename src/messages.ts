export const MESSAGE_TYPES = {
  GET_LOCK_STATE: 'AUTHKEY_GET_LOCK_STATE',
  SET_LOCK_STATE: 'AUTHKEY_SET_LOCK_STATE',
  GET_LOCKED_SITES: 'AUTHKEY_GET_LOCKED_SITES',
  REQUEST_UNLOCK: 'AUTHKEY_REQUEST_UNLOCK',
  AUTH_RESULT: 'AUTHKEY_AUTH_RESULT',
  UNLOCK_GRANTED: 'AUTHKEY_UNLOCK_GRANTED',
  SETUP_REQUIRED: 'AUTHKEY_SETUP_REQUIRED',
} as const;

export type GetLockStateRequest = {
  type: typeof MESSAGE_TYPES.GET_LOCK_STATE;
  host: string;
  url: string;
};

export type GetLockStateResponse = {
  isLocked: boolean;
  unlockUntil?: number;
  isUnlocked: boolean;
};

export type SetLockStateRequest = {
  type: typeof MESSAGE_TYPES.SET_LOCK_STATE;
  host: string;
  url: string;
  isLocked: boolean;
};

export type GetLockedSitesRequest = {
  type: typeof MESSAGE_TYPES.GET_LOCKED_SITES;
};

export type LockedSiteSummary = {
  host: string;
  isLocked: boolean;
  updatedAt: number;
  unlockUntil?: number;
  lastUrl?: string;
};

export type GetLockedSitesResponse = {
  sites: LockedSiteSummary[];
};

export type RequestUnlockRequest = {
  type: typeof MESSAGE_TYPES.REQUEST_UNLOCK;
  host: string;
  url: string;
};

export type AuthResultRequest = {
  type: typeof MESSAGE_TYPES.AUTH_RESULT;
  tabId: number;
  host: string;
  success: boolean;
  error?: string;
};

export type UnlockGrantedMessage = {
  type: typeof MESSAGE_TYPES.UNLOCK_GRANTED;
  unlockUntil: number;
};

export type SetupRequiredMessage = {
  type: typeof MESSAGE_TYPES.SETUP_REQUIRED;
  reason: string;
};

export type BackgroundRequest =
  | GetLockStateRequest
  | SetLockStateRequest
  | GetLockedSitesRequest
  | RequestUnlockRequest
  | AuthResultRequest;
