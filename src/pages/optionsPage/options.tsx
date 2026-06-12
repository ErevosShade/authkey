import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ThemeProvider } from "@/components/ui/theme-provider";
import {
  Lock,
  Unlock,
  Shield,
  Globe,
  Settings,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  BarChart3,
  Timer,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
} from "lucide-react";

import { createRoot } from "react-dom/client";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import "@/index.css";
import { ExtensionProvider, useAuth, useSites } from "../../contexts/ExtensionContext";

// Imported Shared/Options subcomponents
import { NumberTicker } from "../../components/shared/NumberTicker";
import { ConfirmationModal } from "../../components/shared/ConfirmationModal";
import { LoginScreen } from "../../components/options/LoginScreen";
import { ScheduleLock } from "../../components/options/ScheduleLock";
import { Analytics } from "../../components/options/Analytics";

function Options() {
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth();
  const { sites, addSite, removeSite, toggleSiteLock } = useSites();
  const [todayUnlocks] = useState(23);
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    siteUrl: string | null;
    siteName: string;
  }>({
    isOpen: false,
    siteUrl: null,
    siteName: "",
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sitesPerPage = 6;

  const handleToggleSiteLock = (host: string) => {
    toggleSiteLock(host).catch(console.error);
  };

  const openConfirmModal = (url: string, siteName: string) => {
    setConfirmModal({ isOpen: true, siteUrl: url, siteName });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, siteUrl: null, siteName: "" });
  };

  const confirmRemoveSite = () => {
    if (confirmModal.siteUrl) {
      removeSite(confirmModal.siteUrl).catch(console.error);
    }
    closeConfirmModal();
  };

  const addNewSite = () => {
    if (newSiteUrl.trim()) {
      addSite(newSiteUrl.trim()).catch(console.error);
      setNewSiteUrl("");
      setShowAddSite(false);
    }
  };

  const lockedCount = sites.filter((site) => site.isLocked).length;
  const unlockedCount = sites.filter((site) => !site.isLocked).length;

  const totalPages = Math.ceil(sites.length / sitesPerPage);
  const startIndex = (currentPage - 1) * sitesPerPage;
  const endIndex = startIndex + sitesPerPage;
  const currentSites = sites.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isAuthLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-[#0F0F0F] transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen text-black dark:text-white overflow-hidden font-sans relative bg-[#F5F5F5] dark:bg-[#0F0F0F] transition-colors">
      

      {/* LEFT SIDEBAR */}
      <aside 
        className={`relative z-10 transition-all duration-300 ease-in-out flex flex-col border-r border-gray-800 dark:border-[#2A2A2A] bg-black dark:bg-[#1A1A1A] ${
          isSidebarCollapsed ? "w-20" : "w-52"
        }`}
      >
     
        {/* Logo Area */}
        <div className={`h-20 flex items-center border-b border-gray-800 dark:border-[#2A2A2A] ${isSidebarCollapsed ? 'justify-center' : 'justify-start px-6'}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-lg bg-white dark:bg-[#252525] shrink-0 hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors focus:outline-hidden focus:ring-2 focus:ring-white cursor-pointer"
              title="Toggle Sidebar"
            >
              <Shield className="w-6 h-6 text-black dark:text-white" />
            </button>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white whitespace-nowrap tracking-tight">
                  AuthKey
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Security Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className={`text-[10px] font-semibold text-gray-500 mb-4 px-2 uppercase tracking-widest ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
            Pages
          </p>
          {[
            { id: "dashboard", label: "Dashboard", icon: Shield },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "schedule", label: "Schedule Lock", icon: Timer },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-4'} py-6 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black hover:bg-gray-100"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent"
              }`}
              title={isSidebarCollapsed ? tab.label : undefined}
            >
              <tab.icon className={`w-5 h-5 ${isSidebarCollapsed ? 'mr-0' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span className="text-sm font-medium">{tab.label}</span>}
            </Button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative z-10 bg-[#F5F5F5] dark:bg-[#0F0F0F] transition-colors">

        {/* Sticky Navbar */}
        <div className="sticky top-0 z-30 bg-[#F5F5F5]/80 dark:bg-[#0F0F0F]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#2A2A2A] transition-colors">
          <div className="flex justify-between items-center gap-4 px-6 py-3 max-w-7xl mx-auto">

            {/* Search Box (UI only) */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search sites, settings..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] text-black rounded-xl outline-hidden focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all placeholder:text-gray-400 dark:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <ModeToggle />

              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="relative text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#252525] transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#F5F5F5] dark:border-[#0F0F0F] translate-x-1 -translate-y-1">
                  2
                </span>
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#252525] transition-all">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

          </div>
        </div>

        <div className="p-6 pt-4 max-w-7xl mx-auto space-y-4">

          {activeTab === "dashboard" && (
            <>
              {/* HERO BANNER */}
              <div className="rounded-2xl p-6 mb-5 relative overflow-hidden border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] shadow-sm transition-colors">
                {/* Fading Grid Background */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(156, 163, 175, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 90%)',
                    maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 90%)',
                  }}
                />
                {/* Decorative oversized Shield watermark */}
                <Shield className="absolute -right-20 -bottom-48 w-96 h-96 text-gray-200 opacity-40 dark:opacity-10 pointer-events-none" />
                <div className="relative z-10 flex flex-col justify-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-1 flex items-center gap-2 tracking-tight">
                    👋 Hello {user?.userId || "User"},
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md text-xs sm:text-sm leading-relaxed">
                    Welcome to your AuthKey Dashboard! Monitor your unlocked sites,
                    track your lock progress, and gain valuable privacy insights.
                  </p>
                  <div>
                    <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 font-medium px-4 h-8 text-xs transition-all rounded-lg">
                      Quick Review
                    </Button>
                  </div>
                </div>
              </div>

              {/* 3-COLUMN KPI GRID (Glassmorphism) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <Card className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-200 hover:border-gray-300 dark:border-[#333] dark:hover:border-gray-700 hover:shadow-md transition-all duration-200 rounded-2xl relative overflow-hidden">
                  <Unlock className="absolute -right-8 -bottom-16 w-40 h-40 text-gray-200 opacity-40 dark:opacity-10 pointer-events-none" />
                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#2A2A2A]">
                      <Unlock className="w-5 h-5 text-black dark:text-white" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">Today's Unlocks</p>
                    <NumberTicker value={todayUnlocks} className="!text-3xl text-black dark:text-white font-sans" />
                  </div>
                </Card>

                <Card className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-200 hover:border-gray-300 dark:border-[#333] hover:shadow-md transition-all duration-200 rounded-2xl relative overflow-hidden">
                  <Lock className="absolute -right-8 -bottom-16 w-40 h-40 text-gray-200 opacity-40 dark:opacity-10 pointer-events-none" />
                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#2A2A2A]">
                      <Lock className="w-5 h-5 text-black dark:text-white" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">Sites Locked</p>
                    <div className="text-3xl font-bold text-black dark:text-white leading-none">{lockedCount}</div>
                  </div>
                </Card>

                <Card className="p-5 bg-white dark:bg-[#1A1A1A] border border-gray-200 hover:border-gray-300 dark:border-[#333] hover:shadow-md transition-all duration-200 rounded-2xl relative overflow-hidden">
                  <Globe className="absolute -right-8 -bottom-16 w-40 h-40 text-gray-200 opacity-40 dark:opacity-10 pointer-events-none" />
                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#2A2A2A]">
                      <Globe className="w-5 h-5 text-black dark:text-white" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-400 mb-1 uppercase tracking-wider">Sites Unlocked</p>
                    <div className="text-3xl font-bold text-black dark:text-white leading-none">{unlockedCount}</div>
                  </div>
                </Card>
              </div>

              {/* MAIN DATA GRID (2/3 width for lists, 1/3 for quick actions) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Side: Managed Sites (Takes up 2 columns) */}
                <div className="xl:col-span-2">
                  <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 hover:border-gray-300 dark:border-[#333] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h2 className="text-xl font-semibold text-black dark:text-white tracking-tight">Managed Sites</h2>
                      <Button
                        size="sm"
                        onClick={() => setShowAddSite(!showAddSite)}
                        className="bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Site
                      </Button>
                    </div>

                    {showAddSite && (
                      <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 dark:border-[#2A2A2A]">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newSiteUrl}
                            onChange={(e) => setNewSiteUrl(e.target.value)}
                            placeholder="Enter website URL (e.g., example.com)"
                            className="flex-1 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#333] rounded-lg text-black dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black"
                            onKeyPress={(e) => e.key === "Enter" && addNewSite()}
                          />
                          <Button onClick={addNewSite} className="bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black transition-all">
                            Add
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col">
                      {/* CHANGED: Swapped space-y-3 for a CSS Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentSites.length > 0 ? (
                          currentSites.map((site, index) => (
                            <div
                              key={site.id}
                              className={`flex flex-col p-5 rounded-2xl border hover:border-gray-300 dark:border-[#333] transition-all group relative hover:shadow-sm ${
                                index % 2 === 0
                                  ? "bg-gray-100 dark:bg-[#252525] border-gray-200 dark:border-[#2A2A2A]"
                                  : "bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A]"
                              }`}
                            >
                              {/* Top row: Icon and absolute positioned Trash */}
                              <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-gray-200 dark:border-[#2A2A2A] ${
                                  index % 2 === 0 ? "bg-white dark:bg-[#1A1A1A]" : "bg-gray-100 dark:bg-[#252525]"
                                }`}>
                                  {site.icon}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openConfirmModal(site.url, site.url)}
                                  className="text-gray-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 absolute top-4 right-4"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Middle row: Text details */}
                              <div className="mb-6">
                                <div className="font-semibold text-black dark:text-white truncate text-base">
                                  {site.url}
                                </div>
                                <div className="text-xs font-medium text-gray-400 dark:text-gray-400 mt-1">
                                  {site.category}
                                </div>
                              </div>

                              {/* Bottom row: Controls */}
                              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                                <Badge
                                  variant="outline"
                                  className={`${site.isLocked
                                      ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30"
                                      : "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30"
                                    } px-3 py-1 rounded-md border text-xs font-bold tracking-wide`}
                                >
                                  {site.isLocked ? "Locked" : "Unlocked"}
                                </Badge>

                                <Switch
                                   checked={site.isLocked}
                                   onCheckedChange={() => handleToggleSiteLock(site.url)}
                                   className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
                                 />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full flex items-center justify-center h-64 text-gray-400 dark:text-gray-400">
                            <div className="text-center">
                              <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
                              <p className="text-black dark:text-white font-medium">No sites added yet</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-[#2A2A2A]">
                          <p className="text-sm text-gray-400 dark:text-gray-400">
                            Showing {startIndex + 1}-{Math.min(endIndex, sites.length)} of {sites.length}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="border-gray-300 dark:border-[#333] bg-white hover:bg-gray-50 dark:hover:bg-[#252525] dark:bg-[#1F1F1F] text-black dark:text-white disabled:opacity-40"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="border-gray-300 dark:border-[#333] bg-white hover:bg-gray-50 dark:hover:bg-[#252525] dark:bg-[#1F1F1F] text-black dark:text-white disabled:opacity-40"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right Side: Quick Actions & Activity */}
                <div className="space-y-6">
                  <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 hover:border-gray-300 dark:border-[#333] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-4 tracking-tight">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start border-gray-200 dark:border-[#2A2A2A] bg-white hover:bg-gray-50 dark:hover:bg-[#252525] dark:bg-[#1F1F1F] text-black dark:text-white py-6 rounded-xl">
                        <Eye className="w-4 h-4 mr-3 text-black dark:text-white" />
                        Unlock All Sites
                      </Button>
                      <Button variant="outline" className="w-full justify-start border-gray-200 dark:border-[#2A2A2A] bg-white hover:bg-gray-50 dark:hover:bg-[#252525] dark:bg-[#1F1F1F] text-black dark:text-white py-6 rounded-xl">
                        <EyeOff className="w-4 h-4 mr-3 text-black dark:text-white" />
                        Lock All Sites
                      </Button>
                      <Button onClick={() => setActiveTab("schedule")} variant="outline" className="w-full justify-start border-gray-200 dark:border-[#2A2A2A] bg-white hover:bg-gray-50 dark:hover:bg-[#252525] dark:bg-[#1F1F1F] text-black dark:text-white py-6 rounded-xl">
                        <Timer className="w-4 h-4 mr-3 text-black dark:text-white" />
                        Schedule Locks
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white dark:bg-[#1A1A1A] border border-gray-200 hover:border-gray-300 dark:border-[#333] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-4 tracking-tight">Recent Activity</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-100 dark:bg-[#252525] border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-200 dark:hover:bg-[#2D2D2D] hover:border-gray-300 dark:hover:border-[#333] transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                        <span className="text-sm text-black dark:text-white font-medium grow">Unlocked facebook.com</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">2m</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl border bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-100 dark:hover:bg-[#222222] hover:border-gray-300 dark:hover:border-[#333] transition-colors">
                        <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                        <span className="text-sm text-black dark:text-white font-medium grow">Locked youtube.com</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">5m</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl border bg-gray-100 dark:bg-[#252525] border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-200 dark:hover:bg-[#2D2D2D] hover:border-gray-300 dark:hover:border-[#333] transition-colors">
                        <div className="w-2 h-2 bg-black dark:bg-white rounded-full shrink-0"></div>
                        <span className="text-sm text-black dark:text-white font-medium grow">Added reddit.com</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">1h</span>
                      </div>
                    </div>
                  </Card>
                </div>

              </div>
            </>
          )}

          {activeTab === "analytics" && <Analytics sites={sites} />}
          {activeTab === "schedule" && <ScheduleLock sites={sites} />}
        </div>
      </main>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmRemoveSite}
        siteName={confirmModal.siteName}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <ExtensionProvider>
      <Options />
    </ExtensionProvider>
  </ThemeProvider>
);