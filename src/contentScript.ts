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
  container.style.background = 'rgba(5, 5, 7, 0.95)';
  container.style.backdropFilter = 'blur(8px)';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  const shadow = container.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      
      .overlay {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        color: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
      }

      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #09090b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 40px 32px;
        max-width: 360px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        overflow: hidden;
      }

      .left-accent {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 4px;
        background: #00e5ff;
        opacity: 0.5;
      }

      .shield {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #121214;
        border: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 24px;
        position: relative;
      }

      .shield::before {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.04);
      }
      
      .shield::after {
        content: '';
        position: absolute;
        inset: -16px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.02);
      }

      .shield svg {
        width: 24px;
        height: 24px;
        color: #00e5ff;
        opacity: 0.8;
      }

      .tag {
        font-family: monospace;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        font-size: 10px;
        color: #00e5ff;
        opacity: 0.8;
        margin-bottom: 8px;
      }

      h1 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        letter-spacing: 0.02em;
      }

      p {
        font-family: monospace;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 10px;
        color: #9ca3af;
        margin: 0 0 32px 0;
        text-align: center;
        opacity: 0.8;
      }

      button {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: #121214;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #f3f4f6;
        padding: 14px;
        font-family: monospace;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        font-size: 12px;
        cursor: pointer;
        transition: opacity 0.2s, background 0.2s;
        overflow: hidden;
      }

      button:hover {
        opacity: 0.9;
        background: #18181b;
      }

      button .btn-accent {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: #00e5ff;
        opacity: 0.8;
      }

      button svg {
        width: 14px;
        height: 14px;
        opacity: 0.9;
      }
    </style>
    <div class="overlay">
      <div class="card">
        <div class="left-accent"></div>
        <div class="shield">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <div class="tag">Access Restricted</div>
        <h1>Site Locked</h1>
        <p id="authkey-message">Authenticate to unlock ${host}</p>
        <button id="authkey-unlock">
          <div class="btn-accent"></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Unlock Site
        </button>
      </div>
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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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