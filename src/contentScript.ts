import {
  MESSAGE_TYPES,
  type GetLockStateResponse,
  type SetupRequiredMessage,
  type UnlockGrantedMessage,
} from './messages';

const host = window.location.hostname;
const isTopFrame = window.top === window;
let overlayContainer: HTMLDivElement | null = null;
let overlayMessage: HTMLParagraphElement | null = null;
let unlockButton: HTMLButtonElement | null = null;
let autoRequested = false;

function sendMessage<T>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }
      resolve(response as T);
    });
  });
}

function mountOverlay(): void {
  if (overlayContainer) {
    return;
  }

  const container = document.createElement('div');
  container.id = 'authkey-lock-overlay';
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.zIndex = '2147483647';
  container.style.background = '#050507';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  const shadow = container.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .wrap {
        font-family: 'Segoe UI', sans-serif;
        color: #f8fafc;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 32px 28px;
        border-radius: 16px;
        background: radial-gradient(circle at top, #1f2937 0%, #0f172a 80%);
        box-shadow: 0 16px 30px rgba(15, 23, 42, 0.6);
        max-width: 360px;
        text-align: center;
      }
      h1 { font-size: 22px; margin: 0; }
      p { margin: 0; color: #cbd5f5; font-size: 14px; }
      button {
        border: none;
        border-radius: 10px;
        padding: 10px 18px;
        font-size: 14px;
        font-weight: 600;
        background: linear-gradient(135deg, #38bdf8, #4f46e5);
        color: #0f172a;
        cursor: pointer;
      }
    </style>
    <div class="wrap">
      <h1>Site locked</h1>
      <p id="authkey-message">Authenticate to unlock ${host}</p>
      <button id="authkey-unlock">Unlock with AuthKey</button>
    </div>
  `;

  overlayMessage = shadow.querySelector('#authkey-message') as HTMLParagraphElement | null;
  unlockButton = shadow.querySelector('#authkey-unlock') as HTMLButtonElement | null;

  unlockButton?.addEventListener('click', () => {
    void requestUnlock('manual');
  });

  document.documentElement.appendChild(container);
  overlayContainer = container;
}

function unmountOverlay(): void {
  overlayContainer?.remove();
  overlayContainer = null;
  overlayMessage = null;
  unlockButton = null;
}

function setOverlayMessage(text: string): void {
  if (overlayMessage) {
    overlayMessage.textContent = text;
  }
}

async function requestUnlock(reason: 'auto' | 'manual'): Promise<void> {
  if (reason === 'auto' && autoRequested) {
    return;
  }

  autoRequested = true;
  try {
    await sendMessage({
      type: MESSAGE_TYPES.REQUEST_UNLOCK,
      host,
      url: window.location.href,
    });
  } catch (error) {
    setOverlayMessage('Unable to open AuthKey. Try again from the extension.');
    console.error('AuthKey unlock request failed', error);
  }
}

async function init(): Promise<void> {
  if (!isTopFrame || !host) {
    return;
  }

  try {
    const response = await sendMessage<GetLockStateResponse>({
      type: MESSAGE_TYPES.GET_LOCK_STATE,
      host,
      url: window.location.href,
    });

    if (response.isLocked && !response.isUnlocked) {
      mountOverlay();
      void requestUnlock('auto');
    }
  } catch (error) {
    console.error('AuthKey lock state check failed', error);
  }
}

chrome.runtime.onMessage.addListener((message: UnlockGrantedMessage | SetupRequiredMessage) => {
  if (message.type === MESSAGE_TYPES.UNLOCK_GRANTED) {
    unmountOverlay();
  }

  if (message.type === MESSAGE_TYPES.SETUP_REQUIRED) {
    mountOverlay();
    setOverlayMessage(message.reason);
  }
});

void init();
