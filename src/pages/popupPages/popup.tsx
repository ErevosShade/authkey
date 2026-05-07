import { useCallback, useEffect, useState } from "react";
import { Separator } from "../../components/ui/separator";
import { Button } from "../../components/ui/button";
import { Lock } from "lucide-react";
import { GridSmallBackground } from "../../components/ui/grid";
import Lottie from "lottie-react";
import lockAnimation from "@/lottieFiles/lock.json";
import { createRoot } from "react-dom/client";
import { registerUser } from "@/webAuthn";
import {
  MESSAGE_TYPES,
  type GetLockStateResponse,
  type GetLockedSitesResponse,
  type LockedSiteSummary,
} from "@/messages";
import "@/index.css";

type UserProfile = {
  userId: string;
};

const sendMessage = <T,>(message: unknown): Promise<T> =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(error);
        return;
      }
      resolve(response as T);
    });
  });

function Popup() {
  const [activeHost, setActiveHost] = useState<string>("");
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [lockState, setLockState] = useState<GetLockStateResponse | null>(null);
  const [lockedSites, setLockedSites] = useState<LockedSiteSummary[]>([]);

  const loadActiveTab = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const url = tab?.url ?? "";
      const host = url ? new URL(url).hostname : "";
      setActiveUrl(url);
      setActiveHost(host);
    });
  };

  const loadUserProfile = () => {
    chrome.storage.local.get("authkey_user", (result) => {
      const profile = result.authkey_user as UserProfile | undefined;
      if (profile?.userId) {
        setIsRegistered(true);
        setUserId(profile.userId);
      } else {
        setIsRegistered(false);
      }
    });
  };

  const refreshLockState = useCallback(async () => {
    if (!activeHost) {
      return;
    }

    const response = await sendMessage<GetLockStateResponse>({
      type: MESSAGE_TYPES.GET_LOCK_STATE,
      host: activeHost,
      url: activeUrl,
    });
    setLockState(response);
  }, [activeHost, activeUrl]);

  const refreshLockedSites = useCallback(async () => {
    const response = await sendMessage<GetLockedSitesResponse>({
      type: MESSAGE_TYPES.GET_LOCKED_SITES,
    });
    setLockedSites(response.sites.filter((site) => site.isLocked));
  }, []);

  useEffect(() => {
    loadActiveTab();
    loadUserProfile();
  }, []);

  useEffect(() => {
    void refreshLockState();
    void refreshLockedSites();
  }, [refreshLockState, refreshLockedSites]);

  const handleRegister = async () => {
    setStatus("");

    if (!userId.trim()) {
      setStatus("User name is required.");
      return;
    }

    const result = await registerUser(userId.trim());
    setStatus(result.message);
    if (result.success) {
      setIsRegistered(true);
    }
  };

  const handleToggleLock = async () => {
    if (!activeHost) {
      setStatus("No active website detected.");
      return;
    }

    const nextLockState = !lockState?.isLocked;
    await sendMessage({
      type: MESSAGE_TYPES.SET_LOCK_STATE,
      host: activeHost,
      url: activeUrl,
      isLocked: nextLockState,
    });

    await refreshLockState();
    await refreshLockedSites();
  };

  const renderLockStatus = () => {
    if (!lockState?.isLocked) {
      return "Not locked";
    }

    if (lockState.isUnlocked) {
      return "Unlocked (temporary)";
    }

    return "Locked";
  };

  return (
    <GridSmallBackground>
      <div className="w-full h-full flex flex-col items-center text-white gap-2 p-4 overflow-visible">
        <h1 className="text-white text-3xl font-extrabold font-sans">AuthKey</h1>
        <p className="text-muted-foreground text-sm font-sans">
          A simple extension to manage your privacy
        </p>
        <Separator />

        {!isRegistered ? (
          <>
            <Lottie
              animationData={lockAnimation}
              loop
              autoplay
              className="w-1/2 h-1/2 opacity-80 brightness-[0.2] grayscale mask-[radial-gradient(circle_at_center,black_0%,transparent_80%)]"
            />
            <h1 className="text-white text-2xl font-extrabold font-sans text-wrap-balance text-center">
              Set up your passcode to use AuthKey
            </h1>
            <div className="w-full space-y-2">
              <input
                type="text"
                placeholder="User name"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              />
            </div>
            <Button
              className="mt-4 px-10 py-7 rounded-md cursor-pointer"
              onClick={handleRegister}
            >
              Register AuthKey
            </Button>
            {status ? (
              <p className="text-xs text-slate-300 text-center">{status}</p>
            ) : null}
          </>
        ) : (
          <>
            <div className="rounded-[5%] shadow-[inset_11.11px_11.11px_17px_#131316,inset_-11.11px_-11.11px_17px_#1D1D20] bg-[linear-gradient(145deg,#121214,#1E1E22)] w-full h-30 flex items-center flex-col gap-2 p-4">
              <h1 className="text-white text-xl font-extrabold font-sans h-8">
                🌐 Website
              </h1>
              <span className="text-sm text-slate-300">{activeHost || "No active tab"}</span>
              <span className="text-xs text-slate-400">{renderLockStatus()}</span>
              <Button
                className="rounded-[7%] shadow-[inset_11.41px_11.41px_20px_#101012,inset_-11.41px_-11.41px_20px_#202024] bg-[linear-gradient(145deg,#1E1E22,#121214)] px-6 py-3"
                onClick={handleToggleLock}
              >
                {lockState?.isLocked ? "Remove lock" : "Lock"}
              </Button>
            </div>

            <div className="rounded-[10%] shadow-[inset_11.11px_11.11px_17px_#131316,inset_-11.11px_-11.11px_17px_#1D1D20] bg-[linear-gradient(145deg,#121214,#1E1E22)] w-full h-64 mt-4 flex items-center flex-col gap-2 p-4">
              <h1 className="text-white text-xl font-extrabold font-sans h-10 flex items-center justify-around gap-2">
                <Lock /> Your Protected Websites
              </h1>
              <ul className="w-full h-full overflow-y-auto overflow-x-hidden text-sm">
                {lockedSites.length === 0 ? (
                  <li className="text-center text-slate-400">No locked sites yet.</li>
                ) : (
                  lockedSites.map((site) => (
                    <li
                      key={site.host}
                      className="my-3 w-full bg-zinc-800 px-4 py-2 rounded-md flex items-center justify-between"
                    >
                      <span className="text-white text-sm font-sans">{site.host}</span>
                      <span className="text-xs text-slate-400">Locked</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {status ? (
              <p className="text-xs text-slate-300 text-center">{status}</p>
            ) : null}
          </>
        )}
      </div>
    </GridSmallBackground>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);

export default Popup;