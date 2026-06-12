import { useState } from "react";
import type { FC } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";
import { useAuth } from "../../contexts/ExtensionContext";

export const LoginScreen: FC = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!userId.trim()) {
      setError("Please enter a user name.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await register(userId.trim());
    setIsLoading(false);

    if (!result.success) {
      setError(result.message);
    }
    // On success, useAuth().isLoggedIn flips to true automatically
    // and the parent Options component will re-render past this screen
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 bg-[#F5F5F5] dark:bg-[#0F0F0F] transition-colors">
      <div className="max-w-md w-full">
        <Card className="p-8 text-center bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-sm">
          <div className="mb-6">
            <div className="p-4 rounded-full bg-black dark:bg-white inline-block mb-4">
              <Shield className="w-8 h-8 text-white dark:text-black" />
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">AuthKey</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              A simple extension to manage your privacy
            </p>
          </div>

          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center">
              <Lock className="w-16 h-16 text-black dark:text-white" />
            </div>
            <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
              Set up your passcode to use AuthKey
            </h2>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter your user name"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setError(null);
              }}
              className="w-full rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#252525] px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <Button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-3 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black font-medium rounded-xl transition-all"
          >
            {isLoading ? "Setting up..." : "Set up passcode"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
