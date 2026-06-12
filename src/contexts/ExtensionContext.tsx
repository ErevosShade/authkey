import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { FC, ReactNode } from "react";
import { getLockedSites, setLockRecord, deleteLockRecord, getLockRecord } from "../storage/lockDb";
import { registerUser } from "../webAuthn";

export interface Site {
  id: number;
  url: string;
  icon: string;
  isLocked: boolean;
  category: string;
  unlockCount: number;
  avgLockDuration: number;
}

export interface UserProfile {
  userId: string;
}

interface ExtensionContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  register: (userId: string) => Promise<{ success: boolean; message: string }>;
  sites: Site[];
  isSitesLoading: boolean;
  addSite: (url: string) => Promise<void>;
  removeSite: (host: string) => Promise<void>;
  toggleSiteLock: (host: string) => Promise<void>;
  refreshSites: () => Promise<void>;
}

const ExtensionContext = createContext<ExtensionContextType | undefined>(undefined);

export const ExtensionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>([]);
  const [isSitesLoading, setIsSitesLoading] = useState(true);

  // Load user profile
  const loadUser = useCallback(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("authkey_user", (result) => {
        const profile = result.authkey_user as UserProfile | undefined;
        setUser(profile || null);
        setIsAuthLoading(false);
      });
    } else {
      const val = localStorage.getItem("authkey_user");
      try {
        const profile = val ? (JSON.parse(val) as UserProfile) : null;
        setUser(profile);
      } catch {
        setUser(null);
      }
      setIsAuthLoading(false);
    }
  }, []);

  // Sync sites from Dexie DB
  const refreshSites = useCallback(async () => {
    setIsSitesLoading(true);
    try {
      const records = await getLockedSites();
      const mapped = records.map((record, index) => {
        const host = record.host;
        let icon = "🌐";
        if (host.includes("facebook.com")) icon = "🔵";
        else if (host.includes("youtube.com")) icon = "🔴";
        else if (host.includes("twitter.com") || host.includes("x.com")) icon = "🐦";
        else if (host.includes("reddit.com")) icon = "🤖";
        else if (host.includes("instagram.com")) icon = "📸";
        else if (host.includes("github.com")) icon = "🐱";
        else if (host.includes("netflix.com")) icon = "🍿";

        let category = "Custom";
        if (host.includes("facebook.com") || host.includes("twitter.com") || host.includes("x.com") || host.includes("instagram.com") || host.includes("reddit.com")) {
          category = "Social Media";
        } else if (host.includes("youtube.com") || host.includes("netflix.com")) {
          category = "Entertainment";
        } else if (host.includes("github.com") || host.includes("stackoverflow.com")) {
          category = "Development";
        } else if (host.includes("linkedin.com")) {
          category = "Professional";
        }

        // Generate a deterministic integer ID based on host name
        let id = 0;
        for (let i = 0; i < host.length; i++) {
          id += host.charCodeAt(i);
        }

        return {
          id: id || (index + 1),
          url: host,
          icon,
          isLocked: record.isLocked,
          category,
          unlockCount: record.unlockCount || 0,
          avgLockDuration: record.avgLockDuration || 0,
        };
      });
      setSites(mapped);
    } catch (err: unknown) {
      console.error("Failed to load sites", err);
    } finally {
      setIsSitesLoading(false);
    }
  }, []);

  // WebAuthn registration
  const register = useCallback(async (userId: string) => {
    const result = await registerUser(userId);
    if (result.success) {
      loadUser();
    }
    return result;
  }, [loadUser]);

  // Add site
  const addSite = useCallback(async (url: string) => {
    const cleanUrl = url.trim().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    if (!cleanUrl) return;
    await setLockRecord(cleanUrl, true, url);
    await refreshSites();
  }, [refreshSites]);

  // Remove site
  const removeSite = useCallback(async (host: string) => {
    await deleteLockRecord(host);
    await refreshSites();
  }, [refreshSites]);

  // Toggle lock state
  const toggleSiteLock = useCallback(async (host: string) => {
    const record = await getLockRecord(host);
    if (record) {
      await setLockRecord(host, !record.isLocked, record.lastUrl || `https://${host}`);
      await refreshSites();
    }
  }, [refreshSites]);

  useEffect(() => {
    loadUser();
    void refreshSites();

    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.authkey_user) {
        setUser((changes.authkey_user.newValue as UserProfile) || null);
      }
    };
    
    const isChromeStorage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged;
    if (isChromeStorage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    // Refresh on focus
    const handleFocus = () => {
      void refreshSites();
      loadUser();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      if (isChromeStorage) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadUser, refreshSites]);

  return (
    <ExtensionContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthLoading,
        register,
        sites,
        isSitesLoading,
        addSite,
        removeSite,
        toggleSiteLock,
        refreshSites,
      }}
    >
      {children}
    </ExtensionContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(ExtensionContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an ExtensionProvider");
  }
  return {
    user: context.user,
    isLoggedIn: context.isLoggedIn,
    isLoading: context.isAuthLoading,
    register: context.register,
  };
};

export const useSites = () => {
  const context = useContext(ExtensionContext);
  if (context === undefined) {
    throw new Error("useSites must be used within an ExtensionProvider");
  }
  return {
    sites: context.sites,
    isLoading: context.isSitesLoading,
    addSite: context.addSite,
    removeSite: context.removeSite,
    toggleSiteLock: context.toggleSiteLock,
    refreshSites: context.refreshSites,
  };
};
